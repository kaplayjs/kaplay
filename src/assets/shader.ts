import {
    DEF_FRAG,
    DEF_VERT,
    FRAG_TEMPLATE,
    VERT_TEMPLATE,
    VERTEX_FORMAT,
} from "../constants/general";
import { type GfxCtx, Texture } from "../gfx/gfx";
import { Color } from "../math/color";
import { Mat4 } from "../math/Mat4";
import { Mat23 } from "../math/math";
import { Vec2 } from "../math/Vec2";
import { _k } from "../shared";
import type { RenderProps } from "../types";
import { arrayIsColor, arrayIsNumber, arrayIsVec2 } from "../utils/asserts";
import { getErrorMessage } from "../utils/log";
import { fetchText, loadProgress } from "./asset";
import { Asset } from "./asset";
import { fixURL } from "./utils";

class TextureUnitManager {
    private static textureMap = new Map<Texture, number>();
    private static maxUnit = 1;

    constructor() {}

    static getUnitForTexture(texture: Texture): number {
        let unit = TextureUnitManager.textureMap.get(texture);

        if (unit === undefined) {
            // Assign new unit
            unit = TextureUnitManager.maxUnit++;

            // Check if this unit is actually available
            const gl = _k.gfx.gl;
            if (gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) < unit) {
                throw new Error(
                    "Using too many concurrent textures. Try to use less additional textures as uniforms",
                );
            }

            // Assign texture to unit
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, texture.glTex);
            gl.activeTexture(gl.TEXTURE0);

            // Remember location
            TextureUnitManager.textureMap.set(texture, unit);
        }

        return unit;
    }
}

/**
 * @group Assets
 * @subgroup Data
 */
export type ShaderData = Shader;

/**
 * Possible values for a shader Uniform.
 *
 * @group Rendering
 * @subgroup Shaders
 */
export type UniformValue =
    | number
    | Vec2
    | Color
    | Mat4
    | Mat23
    | number[]
    | Vec2[]
    | Color[]
    | Texture;

/**
 * Possible uniform value, basically any but "u_tex".
 *
 * @group Rendering
 * @subgroup Shaders
 */
export type UniformKey = string;

/**
 * @group Rendering
 * @subgroup Shaders
 */
export type Uniform = Record<UniformKey, UniformValue>;

/**
 * A shader, yeah.
 *
 * @group Rendering
 * @subgroup Shaders
 */
export class Shader {
    ctx: GfxCtx;
    glProgram: WebGLProgram;

    constructor(ctx: GfxCtx, vert: string, frag: string, attribs: string[]) {
        this.ctx = ctx;
        ctx.onDestroy(() => this.free());
        this.glProgram = this.compile(vert, frag, attribs);
    }

    compile(vert: string, frag: string, attribs: string[]) {
        const gl = this.ctx.gl;
        const vertShader = gl.createShader(gl.VERTEX_SHADER);
        const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

        if (!vertShader || !fragShader) {
            throw new Error("Failed to create shader");
        }

        // What we should do if vert or frag are null?

        gl.shaderSource(vertShader, vert);
        gl.shaderSource(fragShader, frag);
        gl.compileShader(vertShader);
        gl.compileShader(fragShader);

        const prog = gl.createProgram();

        gl.attachShader(prog!, vertShader!);
        gl.attachShader(prog!, fragShader!);

        attribs.forEach((attrib, i) => gl.bindAttribLocation(prog!, i, attrib));

        gl.linkProgram(prog!);

        if (!gl.getProgramParameter(prog!, gl.LINK_STATUS)) {
            const vertError = gl.getShaderInfoLog(vertShader!);
            if (vertError) throw new Error("VERTEX SHADER " + vertError);
            const fragError = gl.getShaderInfoLog(fragShader!);
            if (fragError) throw new Error("FRAGMENT SHADER " + fragError);
            const linkError = gl.getProgramInfoLog(prog!);
            if (linkError) throw new Error("LINK ERROR: " + linkError);
            throw new Error("Unknown shader error (gl.LINK_STATUS was false)");
        }

        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);

        return prog!;
    }

    bind() {
        this.ctx.pushProgram(this.glProgram);
    }

    unbind() {
        this.ctx.popProgram();
    }

    send(uniform: Uniform) {
        const gl = this.ctx.gl;
        for (const name in uniform) {
            const val = uniform[name];
            const loc = gl.getUniformLocation(this.glProgram, name);
            if (typeof val === "number") {
                gl.uniform1f(loc, val);
            }
            else if (val instanceof Mat4) {
                gl.uniformMatrix4fv(loc, false, new Float32Array(val.m));
            }
            else if (val instanceof Mat23) {
                gl.uniformMatrix4fv(
                    loc,
                    false,
                    new Float32Array([
                        val.a,
                        val.b,
                        0,
                        0,
                        val.c,
                        val.d,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        val.e,
                        val.f,
                        0,
                        1,
                    ]),
                );
                // console.log(val)
            }
            else if (val instanceof Color) {
                gl.uniform3f(loc, val.r, val.g, val.b);
            }
            else if (val instanceof Vec2) {
                gl.uniform2f(loc, val.x, val.y);
            }
            else if (val instanceof Texture) {
                gl.uniform1i(loc, TextureUnitManager.getUnitForTexture(val));
            }
            else if (Array.isArray(val)) {
                if (arrayIsNumber(val)) {
                    gl.uniform1fv(loc, val as number[]);
                }
                else if (arrayIsVec2(val)) {
                    gl.uniform2fv(loc, val.map((v) => [v.x, v.y]).flat());
                }
                else if (arrayIsColor(val)) {
                    gl.uniform3fv(loc, val.map(v => [v.r, v.g, v.b]).flat());
                }
            }
            else {
                throw new Error("Unsupported uniform data type");
            }
        }
    }

    free() {
        this.ctx.gl.deleteProgram(this.glProgram);
    }
}

export function makeShader(
    ggl: GfxCtx,
    vertSrc: string | null = DEF_VERT,
    fragSrc: string | null = DEF_FRAG,
): Shader {
    const vcode = VERT_TEMPLATE.replace("{{user}}", vertSrc ?? DEF_VERT);
    const fcode = FRAG_TEMPLATE.replace("{{user}}", fragSrc ?? DEF_FRAG);

    try {
        return new Shader(
            ggl,
            vcode,
            fcode,
            VERTEX_FORMAT.map((vert) => vert.name),
        );
    } catch (e) {
        const fmt = /(?<type>^\w+) SHADER ERROR: 0:(?<line>\d+): (?<msg>.+)/;
        const match = getErrorMessage(e).match(fmt);
        if (!match?.groups) throw e;
        const line = Number(match.groups.line);
        const msg = match.groups.msg.trim();
        const ty = match.groups.type.toLowerCase();
        const lines = (ty == "vertex" ? vcode : fcode).split("\n");
        const lineContents = lines[line - 1];
        throw new Error(`${ty} shader line ${line}: ${msg}\n${lineContents}`);
    }
}

export function resolveShader(
    src: RenderProps["shader"],
): ShaderData | Asset<ShaderData> | null {
    if (!src) {
        return _k.gfx.defShader;
    }
    if (typeof src === "string") {
        const shader = getShader(src);
        if (shader) {
            return shader.data ?? shader;
        }
        else if (loadProgress() < 1) {
            return null;
        }
        else {
            throw new Error(`Shader not found: ${src}`);
        }
    }
    else if (src instanceof Asset) {
        return src.data ? src.data : src;
    }

    return src;
}

export function getShader(name: string): Asset<ShaderData> | null {
    return _k.assets.shaders.get(name) ?? null;
}

export function loadShader(
    name: string | null,
    vert?: string,
    frag?: string,
) {
    return _k.assets.shaders.addLoaded(
        name,
        makeShader(_k.gfx.ggl, vert, frag),
    );
}

export function loadShaderURL(
    name: string | null,
    vert?: string,
    frag?: string,
): Asset<ShaderData> {
    vert = fixURL(vert);
    frag = fixURL(frag);
    const resolveUrl = (url?: string) =>
        url
            ? fetchText(url)
            : Promise.resolve(null);
    const load = Promise.all([resolveUrl(vert), resolveUrl(frag)])
        .then(([vcode, fcode]: [string | null, string | null]) => {
            return makeShader(_k.gfx.ggl, vcode, fcode);
        });
    return _k.assets.shaders.add(name, load);
}

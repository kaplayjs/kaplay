import {
    DEF_FRAG,
    DEF_VERT,
    FRAG_TEMPLATE,
    VERT_TEMPLATE,
    VERTEX_FORMAT,
} from "../constants";
import { type GfxCtx, Shader } from "../gfx";
import {
    assets,
    gfx,
    type KaboomCtx,
    type RenderProps,
    type ShaderData,
} from "../kaboom";
import { getErrorMessage } from "../utils";
import { loadProgress } from "./asset";
import { Asset } from "./asset";

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
        const lineOffset = 14;
        const fmt = /(?<type>^\w+) SHADER ERROR: 0:(?<line>\d+): (?<msg>.+)/;
        const match = getErrorMessage(e).match(fmt);
        if (!match?.groups) throw e;
        const line = Number(match.groups.line) - lineOffset;
        const msg = match.groups.msg.trim();
        const ty = match.groups.type.toLowerCase();
        throw new Error(`${ty} shader line ${line}: ${msg}`);
    }
}

export function resolveShader(
    src: RenderProps["shader"],
): ShaderData | Asset<ShaderData> | null {
    if (!src) {
        return gfx.defShader;
    }
    if (typeof src === "string") {
        const shader = getShader(src);
        if (shader) {
            return shader.data ?? shader;
        } else if (loadProgress() < 1) {
            return null;
        } else {
            throw new Error(`Shader not found: ${src}`);
        }
    } else if (src instanceof Asset) {
        return src.data ? src.data : src;
    }

    return src;
}

export function getShader(name: string): Asset<ShaderData> | null {
    return assets.shaders.get(name) ?? null;
}

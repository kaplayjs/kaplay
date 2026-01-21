import type { Shader, Uniform } from "../../assets/shader";
import { IDENTITY_MATRIX } from "../../constants/math";
import { getCamTransform } from "../../game/camera";
import { _k } from "../../shared";
import type { BlendMode, RenderProps } from "../../types";
import { Mesh, type Texture } from "../gfx";
import { height, width } from "../stack";

/**
 * @group Draw
 * @subgroup Picture
 */
export type Material = {
    tex?: Texture;
    shader?: Shader;
    uniform?: Uniform;
    blend?: BlendMode;
};

/**
 * @group Draw
 * @subgroup Picture
 */
export type PictureCommand = {
    material: Material;
    index: number;
    count: number;
};

/**
 * A picture holding drawing data
 *
 * @group Draw
 * @subgroup Picture
 */
export class Picture {
    vertices: number[];
    indices: number[];
    commands: PictureCommand[];
    mesh?: Mesh;

    /**
     * Creates an empty picture if no data is given, otherwise deserializes the data
     * @param data - Optional archived picture data
     */
    constructor(data?: string) {
        this.vertices = [];
        this.indices = [];
        this.commands = [];

        if (data) {
            // TODO: deserialize
        }
    }

    /**
     * Serializes this picture to a JSON string
     * @returns a string containing JSON picture data
     */
    archive(): string {
        return JSON.stringify({
            vertices: this.vertices,
            indices: this.indices,
            commands: this.commands.map(command => {
                return {
                    material: {
                        tex: "", // TODO: Find a way to refer to a texture by name (main, font, single, etc)
                        shader: "", // TODO: Find a way to refer to a shader by name command.material.shader.name
                        uniform: command.material.uniform,
                        blend: command.material.blend,
                    },
                    index: command.index,
                    count: command.count,
                };
            }),
        });
    }

    free() {
        this.mesh?.free();
    }
}

/**
 * Drawing options for drawPicture
 *
 * @group Draw
 * @subgroup Types
 */
export type DrawPictureOpt = RenderProps & {};

/**
 * Draws a picture to the screen. This function can not be used to draw recursively to a picture.
 * @param picture - The picture to draw
 * @param opt - Drawing options
 */
export function drawPicture(
    picture: Picture,
    opt: DrawPictureOpt,
) {
    const w = width();
    const h = height();
    _k.gfx.renderer.flush(w, h);

    // This is the transform we will apply
    const transform = _k.gfx.transform.clone();
    if (opt.pos) transform.translateSelfV(opt.pos);
    if (opt.angle) transform.rotateSelf(opt.angle);
    if (opt.scale) transform.scaleSelfV(opt.scale);
    if (opt.skew) transform.skewSelfV(opt.skew);

    const ctx = _k.gfx.renderer.ctx;
    const gl = ctx.gl;

    // This binds the vertex buffer
    ctx.pushArrayBuffer(picture.mesh!.glVBuf);
    // Once bound, we set the pointers, which are offsets relative to the pointer of the array buffer we just bound
    const a_pos = gl.getAttribLocation(_k.gfx.defShader.glProgram, "a_pos");
    gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 32, 0);
    const a_uv = gl.getAttribLocation(_k.gfx.defShader.glProgram, "a_uv");
    gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 32, 8);
    const a_color = gl.getAttribLocation(_k.gfx.defShader.glProgram, "a_color");
    gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, 32, 16);
    // Bind the index buffer as well
    ctx.pushElementArrayBuffer(picture.mesh!.glIBuf);

    let lastShader: Shader | null = null;
    let lastTexture: Texture | null = null;

    // Execute all commands, basically drawing ranges using a given material
    for (const command of picture.commands) {
        const texture = command.material.tex ?? _k.gfx.whitePixel.tex;
        const shader = command.material.shader ?? _k.gfx.defShader;

        if (command.material.blend) {
            _k.gfx.renderer.setBlend(command.material.blend);
        }

        if (shader != lastShader) {
            lastShader?.unbind();
            shader.bind();
            lastShader = shader;
            shader.send({
                width: w,
                height: h,
                camera: opt.fixed ? IDENTITY_MATRIX : getCamTransform(),
                transform: transform,
            });
        }

        if (command.material.uniform) {
            shader?.send(command.material.uniform);
        }

        if (texture != lastTexture) {
            lastTexture?.unbind();
            texture?.bind();
            lastTexture = texture;
        }

        // Do the actual draw
        // TODO: put the mode into the command
        gl.drawElements(
            gl.TRIANGLES,
            command.count,
            gl.UNSIGNED_SHORT,
            command.index * 2,
        );
    }

    lastShader?.unbind();
    lastTexture?.unbind();

    // Pop these to balance the stack
    ctx.popArrayBuffer();
    ctx.popElementArrayBuffer();

    // So, you would think that once you pop the vertex buffer, the vertex buffer of the renderer is bound again
    // But that seems not to be happening, so we do it explicitly here
    ctx.pushArrayBuffer(_k.gfx.renderer.glVBuf);
    // We set the pointers to this vertex buffer again
    gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 32, 8);
    gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, 32, 16);
    // And pop the buffer to balance
    ctx.popArrayBuffer();
}

/**
 * Selects the picture for drawing, erases existing data.
 * @param picture - The picture to write drawing data to.
 */
export function beginPicture(picture?: Picture) {
    picture ??= new Picture();
    picture.vertices.length = 0;
    picture.indices.length = 0;
    picture.commands.length = 0;
    _k.gfx.renderer.picture = picture;
}

/**
 * Selects the picture for drawing, keeps existing data.
 * @param picture - The picture to write drawing data to.
 */
export function appendToPicture(picture?: Picture) {
    picture ??= new Picture();
    _k.gfx.renderer.picture = picture;
}

/**
 * Deselects the current picture for drawing, returning the picture.
 * @returns The picture which was previously selected.
 */
export function endPicture(): Picture {
    const ctx = _k.gfx.renderer.ctx;
    const gl = ctx.gl;

    const picture = _k.gfx.renderer.picture;
    if (!picture) {
        throw new Error("Called endPicture when no picture was started");
    }
    _k.gfx.renderer.picture = null;

    picture.free();
    picture.mesh = new Mesh(
        ctx,
        _k.gfx.renderer.vertexFormat,
        picture.vertices,
        picture.indices,
    );

    return picture;
}

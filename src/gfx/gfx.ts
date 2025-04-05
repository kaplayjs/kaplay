import type { Shader, Uniform } from "../assets/shader";
import { getCamTransform } from "../game/camera";
import { Mat4 } from "../math/math";
import {
    BlendMode,
    type ImageSource,
    type KAPLAYOpt,
    type TextureOpt,
} from "../types";
import { deepEq } from "../utils/deepEq";
import type { Picture } from "./draw/drawPicture";

export type GfxCtx = ReturnType<typeof initGfx>;

export class Texture {
    ctx: GfxCtx;
    src: null | ImageSource = null;
    glTex: WebGLTexture;
    width: number;
    height: number;

    constructor(ctx: GfxCtx, w: number, h: number, opt: TextureOpt = {}) {
        this.ctx = ctx;

        const gl = ctx.gl;
        const glText = ctx.gl.createTexture();

        if (!glText) {
            throw new Error("Failed to create texture");
        }

        this.glTex = glText;
        ctx.onDestroy(() => this.free());

        this.width = w;
        this.height = h;

        const filter = {
            "linear": gl.LINEAR,
            "nearest": gl.NEAREST,
        }[opt.filter ?? ctx.opts.texFilter ?? "nearest"];

        const wrap = {
            "repeat": gl.REPEAT,
            "clampToEdge": gl.CLAMP_TO_EDGE,
        }[opt.wrap ?? "clampToEdge"];

        this.bind();

        if (w && h) {
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                w,
                h,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                null,
            );
        }

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        this.unbind();
    }

    static fromImage(
        ctx: GfxCtx,
        img: ImageSource,
        opt: TextureOpt = {},
    ): Texture {
        const tex = new Texture(ctx, img.width, img.height, opt);
        tex.update(img);
        tex.src = img;
        return tex;
    }

    update(img: ImageSource, x = 0, y = 0) {
        const gl = this.ctx.gl;
        this.bind();
        gl.texSubImage2D(
            gl.TEXTURE_2D,
            0,
            x,
            y,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            img,
        );
        this.unbind();
    }

    bind() {
        this.ctx.pushTexture2D(this.glTex);
    }

    unbind() {
        this.ctx.popTexture2D();
    }

    /** Frees up texture memory. Call this once the texture is no longer being used to avoid memory leaks. */
    free() {
        this.ctx.gl.deleteTexture(this.glTex);
    }
}

export type VertexFormat = {
    name: string;
    size: number;
}[];

const identityMatrix = new Mat4();

export class BatchRenderer {
    ctx: GfxCtx;

    glVBuf: WebGLBuffer;
    glIBuf: WebGLBuffer;
    vqueue: number[] = [];
    iqueue: number[] = [];
    stride: number;
    maxVertices: number;
    maxIndices: number;

    vertexFormat: VertexFormat;
    numDraws: number = 0;

    curPrimitive: GLenum | null = null;
    curTex: Texture | null = null;
    curShader: Shader | null = null;
    curUniform: Uniform | null = null;
    curBlend: BlendMode = BlendMode.Normal;
    curFixed: boolean | undefined = undefined;

    picture: Picture | null = null;

    constructor(
        ctx: GfxCtx,
        format: VertexFormat,
        maxVertices: number,
        maxIndices: number,
    ) {
        const gl = ctx.gl;

        this.vertexFormat = format;
        this.ctx = ctx;
        this.stride = format.reduce((sum, f) => sum + f.size, 0);
        this.maxVertices = maxVertices;
        this.maxIndices = maxIndices;

        const glVBuf = gl.createBuffer();

        if (!glVBuf) {
            throw new Error("Failed to create vertex buffer");
        }

        this.glVBuf = glVBuf;

        ctx.pushArrayBuffer(this.glVBuf);
        gl.bufferData(gl.ARRAY_BUFFER, maxVertices * 4, gl.DYNAMIC_DRAW);
        ctx.popArrayBuffer();

        this.glIBuf = gl.createBuffer()!;
        ctx.pushElementArrayBuffer(this.glIBuf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, maxIndices * 4, gl.DYNAMIC_DRAW);
        ctx.popElementArrayBuffer();
    }

    push(
        primitive: GLenum,
        vertices: number[],
        indices: number[],
        shader: Shader,
        tex: Texture | null = null,
        uniform: Uniform | null = null,
        blend: BlendMode,
        width: number,
        height: number,
        fixed: boolean,
    ) {
        // If we have a picture, redirect data to the picture instead
        if (this.picture) {
            const index = this.picture.indices.length;
            const count = indices.length;
            const indexOffset = this.picture.vertices.length / this.stride;
            let l = vertices.length;
            for (let i = 0; i < l; i++) {
                this.picture.vertices.push(vertices[i]);
            }
            l = indices.length;
            for (let i = 0; i < l; i++) {
                this.picture.indices.push(indices[i] + indexOffset);
            }
            const material = {
                tex: tex || undefined,
                shader,
                uniform: uniform || undefined,
                blend,
            };
            if (this.picture.commands.length) {
                const lastCommand =
                    this.picture.commands[this.picture.commands.length - 1];
                const lastMaterial = lastCommand.material;
                if (
                    lastMaterial.tex == material.tex
                    && lastMaterial.shader == material.shader
                    && lastMaterial.uniform == material.uniform
                    && lastMaterial.blend == material.blend
                ) {
                    lastCommand.count += count;
                    return;
                }
            }
            const command = {
                material,
                index,
                count,
            };
            this.picture.commands.push(command);
            return;
        }

        // If texture, shader, blend mode or uniforms (including fixed) have changed, flush first
        // If the buffers are full, flush first
        if (
            primitive !== this.curPrimitive
            || tex !== this.curTex
            || shader !== this.curShader
            || ((this.curUniform != uniform)
                && !deepEq(this.curUniform, uniform))
            || blend !== this.curBlend
            || fixed !== this.curFixed
            || this.vqueue.length + vertices.length * this.stride
                > this.maxVertices
            || this.iqueue.length + indices.length > this.maxIndices
        ) {
            this.flush(width, height);
            this.setBlend(blend);
        }
        const indexOffset = this.vqueue.length / this.stride;
        let l = vertices.length;
        for (let i = 0; i < l; i++) {
            this.vqueue.push(vertices[i]);
        }
        l = indices.length;
        for (let i = 0; i < l; i++) {
            this.iqueue.push(indices[i] + indexOffset);
        }
        this.curPrimitive = primitive;
        this.curShader = shader;
        this.curTex = tex;
        this.curUniform = uniform;
        this.curFixed = fixed;
    }

    flush(width: number, height: number) {
        if (
            !this.curPrimitive
            || !this.curShader
            || this.vqueue.length === 0
            || this.iqueue.length === 0
        ) {
            return;
        }

        const gl = this.ctx.gl;

        // Bind vertex data
        this.ctx.pushArrayBuffer(this.glVBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.vqueue));

        // Bind index data
        this.ctx.pushElementArrayBuffer(this.glIBuf);
        gl.bufferSubData(
            gl.ELEMENT_ARRAY_BUFFER,
            0,
            new Uint16Array(this.iqueue),
        );

        // Set vertex format
        this.ctx.setVertexFormat(this.vertexFormat);

        // Bind Shader
        this.curShader.bind();

        // Send user uniforms
        if (this.curUniform) {
            this.curShader.send(this.curUniform);
        }

        // Send system uniforms
        this.curShader.send({
            width,
            height,
            camera: this.curFixed ? identityMatrix : getCamTransform(),
            transform: identityMatrix,
        });

        // Bind texture
        this.curTex?.bind();

        // Draw vertex buffer using active indices
        gl.drawElements(
            this.curPrimitive,
            this.iqueue.length,
            gl.UNSIGNED_SHORT,
            0,
        );

        // Unbind texture and shader
        this.curTex?.unbind();
        this.curShader.unbind();

        // Unbind buffers
        this.ctx.popArrayBuffer();
        this.ctx.popElementArrayBuffer();

        // Reset local buffers
        this.vqueue.length = 0;
        this.iqueue.length = 0;

        // Increase draw
        this.numDraws++;
    }

    free() {
        const gl = this.ctx.gl;
        gl.deleteBuffer(this.glVBuf);
        gl.deleteBuffer(this.glIBuf);
    }

    setBlend(blend: BlendMode) {
        if (blend !== this.curBlend) {
            const gl = this.ctx.gl;
            this.curBlend = blend;
            switch (this.curBlend) {
                case BlendMode.Normal:
                    gl.blendFuncSeparate(
                        gl.ONE,
                        gl.ONE_MINUS_SRC_ALPHA,
                        gl.ONE,
                        gl.ONE_MINUS_SRC_ALPHA,
                    );
                    break;
                case BlendMode.Add:
                    gl.blendFuncSeparate(
                        gl.ONE,
                        gl.ONE,
                        gl.ONE,
                        gl.ONE_MINUS_SRC_ALPHA,
                    );
                    break;
                case BlendMode.Multiply:
                    gl.blendFuncSeparate(
                        gl.DST_COLOR,
                        gl.ZERO,
                        gl.ONE,
                        gl.ONE_MINUS_SRC_ALPHA,
                    );
                    break;
                case BlendMode.Screen:
                    gl.blendFuncSeparate(
                        gl.ONE_MINUS_DST_COLOR,
                        gl.ONE,
                        gl.ONE,
                        gl.ONE_MINUS_SRC_ALPHA,
                    );
                    break;
                case BlendMode.Overlay:
                    gl.blendFuncSeparate(
                        gl.DST_COLOR,
                        gl.ONE_MINUS_SRC_ALPHA,
                        gl.ONE,
                        gl.ONE_MINUS_SRC_ALPHA,
                    );
            }
        }
    }
}

export class Mesh {
    ctx: GfxCtx;
    glVBuf: WebGLBuffer;
    glIBuf: WebGLBuffer;
    vertexFormat: VertexFormat;
    count: number;

    constructor(
        ctx: GfxCtx,
        format: VertexFormat,
        vertices: number[],
        indices: number[],
    ) {
        const gl = ctx.gl;
        this.vertexFormat = format;
        this.ctx = ctx;
        const glVBuf = gl.createBuffer();

        if (!glVBuf) throw new Error("Failed to create vertex buffer");

        this.glVBuf = glVBuf;

        ctx.pushArrayBuffer(this.glVBuf);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            gl.STATIC_DRAW,
        );
        ctx.popArrayBuffer();

        this.glIBuf = gl.createBuffer()!;
        ctx.pushElementArrayBuffer(this.glIBuf);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices),
            gl.STATIC_DRAW,
        );
        ctx.popElementArrayBuffer();

        this.count = indices.length;
    }

    draw(primitive?: GLenum, index?: GLuint, count?: GLuint): void {
        const gl = this.ctx.gl;
        this.ctx.pushArrayBuffer(this.glVBuf);
        this.ctx.pushElementArrayBuffer(this.glIBuf);
        this.ctx.setVertexFormat(this.vertexFormat);
        gl.drawElements(
            primitive ?? gl.TRIANGLES,
            index ?? this.count,
            gl.UNSIGNED_SHORT,
            count ?? 0,
        );
        this.ctx.popArrayBuffer();
        this.ctx.popElementArrayBuffer();
    }

    free() {
        const gl = this.ctx.gl;
        gl.deleteBuffer(this.glVBuf);
        gl.deleteBuffer(this.glIBuf);
    }
}

function genStack<T>(setFunc: (item: T | null) => void) {
    const stack: T[] = [];
    // TODO: don't do anything if pushed item is the same as the one on top?
    const push = (item: T) => {
        stack.push(item);
        setFunc(item);
    };
    const pop = () => {
        stack.pop();
        setFunc(cur() ?? null);
    };
    const cur = () => stack[stack.length - 1];
    return [push, pop, cur] as const;
}

export function initGfx(gl: WebGLRenderingContext, opts: KAPLAYOpt = {}) {
    const gc: Array<() => void> = [];

    function onDestroy(action: () => unknown) {
        gc.push(action);
    }

    function destroy() {
        gc.forEach((action) => action());
        const extension = gl.getExtension("WEBGL_lose_context");
        if (extension) extension.loseContext();
    }

    let curVertexFormat: object | null = null;

    function setVertexFormat(fmt: VertexFormat) {
        if (deepEq(fmt, curVertexFormat)) return;
        curVertexFormat = fmt;
        const stride = fmt.reduce((sum, f) => sum + f.size, 0);
        fmt.reduce((offset, f, i) => {
            gl.enableVertexAttribArray(i);
            gl.vertexAttribPointer(
                i,
                f.size,
                gl.FLOAT,
                false,
                stride * 4,
                offset,
            );
            return offset + f.size * 4;
        }, 0);
    }

    const [pushTexture2D, popTexture2D] = genStack<WebGLTexture>((t) =>
        gl.bindTexture(gl.TEXTURE_2D, t)
    );

    const [pushArrayBuffer, popArrayBuffer] = genStack<WebGLBuffer>((b) =>
        gl.bindBuffer(gl.ARRAY_BUFFER, b)
    );

    const [pushElementArrayBuffer, popElementArrayBuffer] = genStack<
        WebGLBuffer
    >((b) => gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b));

    const [pushFramebuffer, popFramebuffer] = genStack<WebGLFramebuffer>((b) =>
        gl.bindFramebuffer(gl.FRAMEBUFFER, b)
    );

    const [pushRenderbuffer, popRenderbuffer] = genStack<WebGLRenderbuffer>((
        b,
    ) => gl.bindRenderbuffer(gl.RENDERBUFFER, b));

    const [pushViewport, popViewport] = genStack<
        { x: number; y: number; w: number; h: number }
    >((stack) => {
        if (!stack) return;
        const { x, y, w, h } = stack;

        gl.viewport(x, y, w, h);
    });

    const [pushProgram, popProgram] = genStack<WebGLProgram>((p) =>
        gl.useProgram(p)
    );

    pushViewport({
        x: 0,
        y: 0,
        w: gl.drawingBufferWidth,
        h: gl.drawingBufferHeight,
    });

    return {
        gl,
        opts,
        onDestroy,
        destroy,
        pushTexture2D,
        popTexture2D,
        pushArrayBuffer,
        popArrayBuffer,
        pushElementArrayBuffer,
        popElementArrayBuffer,
        pushFramebuffer,
        popFramebuffer,
        pushRenderbuffer,
        popRenderbuffer,
        pushViewport,
        popViewport,
        pushProgram,
        popProgram,
        setVertexFormat,
    };
}

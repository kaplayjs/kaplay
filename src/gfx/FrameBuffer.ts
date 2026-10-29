import type { TextureOpt } from "../types";
import { type GfxCtx, Texture } from "./gfx";

/**
 * @group Rendering
 * @subgroup Canvas
 */
export class FrameBuffer {
    ctx: GfxCtx;
    tex: Texture;
    glFramebuffer: WebGLFramebuffer;
    glRenderbuffer: WebGLRenderbuffer;
    private stencil: WebGLRenderbuffer;
    private bindings = 0;
    private freed = false;
    private cancelCleanup: () => void;

    constructor(ctx: GfxCtx, w: number, h: number, opt: TextureOpt = {}) {
        this.ctx = ctx;
        const gl = ctx.gl;
        this.tex = new Texture(ctx, w, h, opt);

        const frameBuffer = gl.createFramebuffer();
        const renderBuffer = gl.createRenderbuffer();

        if (!frameBuffer || !renderBuffer) {
            if (frameBuffer) gl.deleteFramebuffer(frameBuffer);
            if (renderBuffer) gl.deleteRenderbuffer(renderBuffer);
            this.tex.free();
            throw new Error("Failed to create framebuffer");
        }

        this.glFramebuffer = frameBuffer;
        this.glRenderbuffer = renderBuffer;
        this.stencil = renderBuffer;
        this.cancelCleanup = ctx.onDestroy(() => this.free());

        try {
            this.bind();
            try {
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, w, h);
                gl.framebufferTexture2D(
                    gl.FRAMEBUFFER,
                    gl.COLOR_ATTACHMENT0,
                    gl.TEXTURE_2D,
                    this.tex.glTex,
                    0,
                );
                gl.framebufferRenderbuffer(
                    gl.FRAMEBUFFER,
                    gl.DEPTH_STENCIL_ATTACHMENT,
                    gl.RENDERBUFFER,
                    this.glRenderbuffer,
                );
            } finally {
                this.unbind();
            }
        } catch (error) {
            this.free();
            throw error;
        }
    }

    get isBound() {
        return this.bindings > 0;
    }

    get width() {
        return this.tex.width;
    }

    get height() {
        return this.tex.height;
    }

    toImageData() {
        const gl = this.ctx.gl;
        const data = new Uint8ClampedArray(this.width * this.height * 4);
        this.bind();
        try {
            gl.readPixels(
                0,
                0,
                this.width,
                this.height,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                data,
            );
        } finally {
            this.unbind();
        }
        // flip vertically
        const bytesPerRow = this.width * 4;
        const temp = new Uint8Array(bytesPerRow);
        for (let y = 0; y < (this.height / 2 | 0); y++) {
            const topOffset = y * bytesPerRow;
            const bottomOffset = (this.height - y - 1) * bytesPerRow;
            temp.set(data.subarray(topOffset, topOffset + bytesPerRow));
            data.copyWithin(
                topOffset,
                bottomOffset,
                bottomOffset + bytesPerRow,
            );
            data.set(temp, bottomOffset);
        }
        return new ImageData(data, this.width, this.height);
    }

    toDataURL() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = this.width;
        canvas.height = this.height;

        if (!ctx) throw new Error("Failed to get 2d context");

        ctx.putImageData(this.toImageData(), 0, 0);
        return canvas.toDataURL();
    }

    clear() {
        const gl = this.ctx.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    draw(action: () => void) {
        const nested = this.isBound;
        const gl = this.ctx.gl;
        const previousStencil = this.stencil;
        let stencil: WebGLRenderbuffer | null = null;
        this.bind();
        try {
            if (nested) {
                // Keep the suspended scope's mask pixels intact during reentry.
                stencil = gl.createRenderbuffer();
                if (!stencil) {
                    throw new Error("Failed to create stencil buffer");
                }
                this.ctx.pushRenderbuffer(stencil);
                gl.renderbufferStorage(
                    gl.RENDERBUFFER,
                    gl.DEPTH_STENCIL,
                    this.width,
                    this.height,
                );
                gl.framebufferRenderbuffer(
                    gl.FRAMEBUFFER,
                    gl.DEPTH_STENCIL_ATTACHMENT,
                    gl.RENDERBUFFER,
                    stencil,
                );
                this.stencil = stencil;
            }
            action();
        } finally {
            if (stencil) {
                gl.framebufferRenderbuffer(
                    gl.FRAMEBUFFER,
                    gl.DEPTH_STENCIL_ATTACHMENT,
                    gl.RENDERBUFFER,
                    previousStencil,
                );
                this.stencil = previousStencil;
                this.ctx.popRenderbuffer();
                gl.deleteRenderbuffer(stencil);
            }
            this.unbind();
        }
    }

    bind() {
        this.bindings++;
        this.ctx.pushFramebuffer(this.glFramebuffer);
        this.ctx.pushRenderbuffer(this.stencil);
        this.ctx.pushViewport({ x: 0, y: 0, w: this.width, h: this.height });
    }

    unbind() {
        this.bindings--;
        this.ctx.popFramebuffer();
        this.ctx.popRenderbuffer();
        this.ctx.popViewport();
    }

    free() {
        if (this.freed) return;
        this.freed = true;
        this.cancelCleanup();
        const gl = this.ctx.gl;
        gl.deleteFramebuffer(this.glFramebuffer);
        gl.deleteRenderbuffer(this.glRenderbuffer);
        this.tex.free();
    }
}

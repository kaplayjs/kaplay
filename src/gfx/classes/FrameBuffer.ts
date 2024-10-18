import type { TextureOpt } from "../../types";
import { type GfxCtx, Texture } from "../gfx";

/**
 * @group GFX
 */

export class FrameBuffer {
    ctx: GfxCtx;
    tex: Texture;
    glFramebuffer: WebGLFramebuffer;
    glRenderbuffer: WebGLRenderbuffer;

    constructor(ctx: GfxCtx, w: number, h: number, opt: TextureOpt = {}) {
        this.ctx = ctx;
        const gl = ctx.gl;
        ctx.onDestroy(() => this.free());
        this.tex = new Texture(ctx, w, h, opt);

        const frameBuffer = gl.createFramebuffer();
        const renderBuffer = gl.createRenderbuffer();

        if (!frameBuffer || !renderBuffer) {
            throw new Error("Failed to create framebuffer");
        }

        this.glFramebuffer = frameBuffer;
        this.glRenderbuffer = renderBuffer;

        this.bind();
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
        this.unbind();
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
        gl.readPixels(
            0,
            0,
            this.width,
            this.height,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            data,
        );
        this.unbind();
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
        this.bind();
        action();
        this.unbind();
    }

    bind() {
        this.ctx.pushFramebuffer(this.glFramebuffer);
        this.ctx.pushRenderbuffer(this.glRenderbuffer);
        this.ctx.pushViewport({ x: 0, y: 0, w: this.width, h: this.height });
    }

    unbind() {
        this.ctx.popFramebuffer();
        this.ctx.popRenderbuffer();
        this.ctx.popViewport();
    }

    free() {
        const gl = this.ctx.gl;
        gl.deleteFramebuffer(this.glFramebuffer);
        gl.deleteRenderbuffer(this.glRenderbuffer);
        this.tex.free();
    }
}

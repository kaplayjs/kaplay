"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameBuffer = void 0;
var gfx_1 = require("./gfx");
/**
 * @group GFX
 */
var FrameBuffer = /** @class */ (function () {
    function FrameBuffer(ctx, w, h, opt) {
        if (opt === void 0) { opt = {}; }
        var _this = this;
        this.ctx = ctx;
        var gl = ctx.gl;
        ctx.onDestroy(function () { return _this.free(); });
        this.tex = new gfx_1.Texture(ctx, w, h, opt);
        var frameBuffer = gl.createFramebuffer();
        var renderBuffer = gl.createRenderbuffer();
        if (!frameBuffer || !renderBuffer) {
            throw new Error("Failed to create framebuffer");
        }
        this.glFramebuffer = frameBuffer;
        this.glRenderbuffer = renderBuffer;
        this.bind();
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, w, h);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex.glTex, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.glRenderbuffer);
        this.unbind();
    }
    Object.defineProperty(FrameBuffer.prototype, "width", {
        get: function () {
            return this.tex.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FrameBuffer.prototype, "height", {
        get: function () {
            return this.tex.height;
        },
        enumerable: false,
        configurable: true
    });
    FrameBuffer.prototype.toImageData = function () {
        var gl = this.ctx.gl;
        var data = new Uint8ClampedArray(this.width * this.height * 4);
        this.bind();
        gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, data);
        this.unbind();
        // flip vertically
        var bytesPerRow = this.width * 4;
        var temp = new Uint8Array(bytesPerRow);
        for (var y = 0; y < (this.height / 2 | 0); y++) {
            var topOffset = y * bytesPerRow;
            var bottomOffset = (this.height - y - 1) * bytesPerRow;
            temp.set(data.subarray(topOffset, topOffset + bytesPerRow));
            data.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);
            data.set(temp, bottomOffset);
        }
        return new ImageData(data, this.width, this.height);
    };
    FrameBuffer.prototype.toDataURL = function () {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        canvas.width = this.width;
        canvas.height = this.height;
        if (!ctx)
            throw new Error("Failed to get 2d context");
        ctx.putImageData(this.toImageData(), 0, 0);
        return canvas.toDataURL();
    };
    FrameBuffer.prototype.clear = function () {
        var gl = this.ctx.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);
    };
    FrameBuffer.prototype.draw = function (action) {
        this.bind();
        action();
        this.unbind();
    };
    FrameBuffer.prototype.bind = function () {
        this.ctx.pushFramebuffer(this.glFramebuffer);
        this.ctx.pushRenderbuffer(this.glRenderbuffer);
        this.ctx.pushViewport({ x: 0, y: 0, w: this.width, h: this.height });
    };
    FrameBuffer.prototype.unbind = function () {
        this.ctx.popFramebuffer();
        this.ctx.popRenderbuffer();
        this.ctx.popViewport();
    };
    FrameBuffer.prototype.free = function () {
        var gl = this.ctx.gl;
        gl.deleteFramebuffer(this.glFramebuffer);
        gl.deleteRenderbuffer(this.glRenderbuffer);
        this.tex.free();
    };
    return FrameBuffer;
}());
exports.FrameBuffer = FrameBuffer;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mesh = exports.BatchRenderer = exports.Texture = void 0;
exports.initGfx = initGfx;
var math_1 = require("../constants/math");
var camera_1 = require("../game/camera");
var types_1 = require("../types");
var deepEq_1 = require("../utils/deepEq");
var Texture = /** @class */ function() {
    function Texture(ctx, w, h, opt) {
        if (opt === void 0) opt = {};
        var _this = this;
        var _a, _b, _c;
        this.src = null;
        this.ctx = ctx;
        var gl = ctx.gl;
        var glText = ctx.gl.createTexture();
        if (!glText) {
            throw new Error("[rendering] Failed to create texture");
        }
        this.glTex = glText;
        ctx.onDestroy(function() {
            return _this.free();
        });
        this.width = w;
        this.height = h;
        var filter = {
            "linear": gl.LINEAR,
            "nearest": gl.NEAREST,
        }[
            (_b = (_a = opt.filter) !== null && _a !== void 0
                        ? _a
                        : ctx.opts.texFilter) !== null && _b !== void 0
                ? _b
                : "nearest"
        ];
        var wrap = {
            "repeat": gl.REPEAT,
            "clampToEdge": gl.CLAMP_TO_EDGE,
        }[(_c = opt.wrap) !== null && _c !== void 0 ? _c : "clampToEdge"];
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
    Texture.fromImage = function(ctx, img, opt) {
        if (opt === void 0) opt = {};
        var tex = new Texture(ctx, img.width, img.height, opt);
        tex.update(img);
        tex.src = img;
        return tex;
    };
    Texture.prototype.update = function(img, x, y) {
        if (x === void 0) x = 0;
        if (y === void 0) y = 0;
        var gl = this.ctx.gl;
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
    };
    Texture.prototype.bind = function() {
        this.ctx.pushTexture2D(this.glTex);
    };
    Texture.prototype.unbind = function() {
        this.ctx.popTexture2D();
    };
    /** Frees up texture memory. Call this once the texture is no longer being used to avoid memory leaks. */
    Texture.prototype.free = function() {
        this.ctx.gl.deleteTexture(this.glTex);
    };
    return Texture;
}();
exports.Texture = Texture;
var BatchRenderer = /** @class */ function() {
    function BatchRenderer(ctx, format, maxVertices, maxIndices) {
        this.vqueue = [];
        this.iqueue = [];
        this.numDraws = 0;
        this.curPrimitive = null;
        this.curTex = null;
        this.curShader = null;
        this.curUniform = null;
        this.curBlend = types_1.BlendMode.Normal;
        this.curFixed = undefined;
        this.picture = null;
        var gl = ctx.gl;
        this.vertexFormat = format;
        this.ctx = ctx;
        this.stride = format.reduce(function(sum, f) {
            return sum + f.size;
        }, 0);
        this.maxVertices = maxVertices;
        this.maxIndices = maxIndices;
        var glVBuf = gl.createBuffer();
        if (!glVBuf) {
            throw new Error("Failed to create vertex buffer");
        }
        this.glVBuf = glVBuf;
        ctx.pushArrayBuffer(this.glVBuf);
        gl.bufferData(gl.ARRAY_BUFFER, maxVertices * 4, gl.DYNAMIC_DRAW);
        ctx.popArrayBuffer();
        this.glIBuf = gl.createBuffer();
        ctx.pushElementArrayBuffer(this.glIBuf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, maxIndices * 4, gl.DYNAMIC_DRAW);
        ctx.popElementArrayBuffer();
    }
    BatchRenderer.prototype.push = function(
        primitive,
        vertices,
        indices,
        shader,
        tex,
        uniform,
        blend,
        width,
        height,
        fixed,
    ) {
        if (tex === void 0) tex = null;
        if (uniform === void 0) uniform = null;
        // If we have a picture, redirect data to the picture instead
        if (this.picture) {
            var index = this.picture.indices.length;
            var count = indices.length;
            var indexOffset_1 = this.picture.vertices.length / this.stride;
            var l_1 = vertices.length;
            for (var i = 0; i < l_1; i++) {
                this.picture.vertices.push(vertices[i]);
            }
            l_1 = indices.length;
            for (var i = 0; i < l_1; i++) {
                this.picture.indices.push(indices[i] + indexOffset_1);
            }
            var material = {
                tex: tex || undefined,
                shader: shader,
                uniform: uniform || undefined,
                blend: blend,
            };
            if (this.picture.commands.length) {
                var lastCommand =
                    this.picture.commands[this.picture.commands.length - 1];
                var lastMaterial = lastCommand.material;
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
            var command = {
                material: material,
                index: index,
                count: count,
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
                && !(0, deepEq_1.deepEq)(this.curUniform, uniform))
            || blend !== this.curBlend
            || fixed !== this.curFixed
            || this.vqueue.length + vertices.length * this.stride
                > this.maxVertices
            || this.iqueue.length + indices.length > this.maxIndices
        ) {
            this.flush(width, height);
            this.setBlend(blend);
        }
        var indexOffset = this.vqueue.length / this.stride;
        var l = vertices.length;
        for (var i = 0; i < l; i++) {
            this.vqueue.push(vertices[i]);
        }
        l = indices.length;
        for (var i = 0; i < l; i++) {
            this.iqueue.push(indices[i] + indexOffset);
        }
        this.curPrimitive = primitive;
        this.curShader = shader;
        this.curTex = tex;
        this.curUniform = uniform;
        this.curFixed = fixed;
    };
    BatchRenderer.prototype.flush = function(width, height) {
        var _a, _b;
        if (
            !this.curPrimitive
            || !this.curShader
            || this.vqueue.length === 0
            || this.iqueue.length === 0
        ) {
            return;
        }
        var gl = this.ctx.gl;
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
            width: width,
            height: height,
            camera: this.curFixed
                ? math_1.IDENTITY_MATRIX
                : (0, camera_1.getCamTransform)(),
            transform: math_1.IDENTITY_MATRIX,
        });
        // Bind texture
        (_a = this.curTex) === null || _a === void 0 ? void 0 : _a.bind();
        // Draw vertex buffer using active indices
        gl.drawElements(
            this.curPrimitive,
            this.iqueue.length,
            gl.UNSIGNED_SHORT,
            0,
        );
        // Unbind texture and shader
        (_b = this.curTex) === null || _b === void 0 ? void 0 : _b.unbind();
        this.curShader.unbind();
        // Unbind buffers
        this.ctx.popArrayBuffer();
        this.ctx.popElementArrayBuffer();
        // Reset local buffers
        this.vqueue.length = 0;
        this.iqueue.length = 0;
        // Increase draw
        this.numDraws++;
    };
    BatchRenderer.prototype.free = function() {
        var gl = this.ctx.gl;
        gl.deleteBuffer(this.glVBuf);
        gl.deleteBuffer(this.glIBuf);
    };
    BatchRenderer.prototype.setBlend = function(blend) {
        if (blend !== this.curBlend) {
            var gl = this.ctx.gl;
            this.curBlend = blend;
            switch (this.curBlend) {
                case types_1.BlendMode.Normal:
                    gl.blendFuncSeparate(
                        gl.ONE,
                        gl.ONE_MINUS_SRC_ALPHA,
                        gl.ONE,
                        gl.ONE_MINUS_SRC_ALPHA,
                    );
                    break;
                case types_1.BlendMode.Add:
                    gl.blendFuncSeparate(
                        gl.ONE,
                        gl.ONE,
                        gl.ONE,
                        gl.ONE_MINUS_SRC_ALPHA,
                    );
                    break;
                case types_1.BlendMode.Multiply:
                    gl.blendFuncSeparate(
                        gl.DST_COLOR,
                        gl.ZERO,
                        gl.ONE,
                        gl.ONE_MINUS_SRC_ALPHA,
                    );
                    break;
                case types_1.BlendMode.Screen:
                    gl.blendFuncSeparate(
                        gl.ONE_MINUS_DST_COLOR,
                        gl.ONE,
                        gl.ONE,
                        gl.ONE_MINUS_SRC_ALPHA,
                    );
                    break;
                case types_1.BlendMode.Overlay:
                    gl.blendFuncSeparate(
                        gl.DST_COLOR,
                        gl.ONE_MINUS_SRC_ALPHA,
                        gl.ONE,
                        gl.ONE_MINUS_SRC_ALPHA,
                    );
            }
        }
    };
    return BatchRenderer;
}();
exports.BatchRenderer = BatchRenderer;
var Mesh = /** @class */ function() {
    function Mesh(ctx, format, vertices, indices) {
        var gl = ctx.gl;
        this.vertexFormat = format;
        this.ctx = ctx;
        var glVBuf = gl.createBuffer();
        if (!glVBuf) {
            throw new Error("Failed to create vertex buffer");
        }
        this.glVBuf = glVBuf;
        ctx.pushArrayBuffer(this.glVBuf);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            gl.STATIC_DRAW,
        );
        ctx.popArrayBuffer();
        this.glIBuf = gl.createBuffer();
        ctx.pushElementArrayBuffer(this.glIBuf);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices),
            gl.STATIC_DRAW,
        );
        ctx.popElementArrayBuffer();
        this.count = indices.length;
    }
    Mesh.prototype.draw = function(primitive, index, count) {
        var gl = this.ctx.gl;
        this.ctx.pushArrayBuffer(this.glVBuf);
        this.ctx.pushElementArrayBuffer(this.glIBuf);
        this.ctx.setVertexFormat(this.vertexFormat);
        gl.drawElements(
            primitive !== null && primitive !== void 0
                ? primitive
                : gl.TRIANGLES,
            index !== null && index !== void 0 ? index : this.count,
            gl.UNSIGNED_SHORT,
            count !== null && count !== void 0 ? count : 0,
        );
        this.ctx.popArrayBuffer();
        this.ctx.popElementArrayBuffer();
    };
    Mesh.prototype.free = function() {
        var gl = this.ctx.gl;
        gl.deleteBuffer(this.glVBuf);
        gl.deleteBuffer(this.glIBuf);
    };
    return Mesh;
}();
exports.Mesh = Mesh;
function genStack(setFunc) {
    var stack = [];
    // TODO: don't do anything if pushed item is the same as the one on top?
    var push = function(item) {
        stack.push(item);
        setFunc(item);
    };
    var pop = function() {
        var _a;
        stack.pop();
        setFunc((_a = cur()) !== null && _a !== void 0 ? _a : null);
    };
    var cur = function() {
        return stack[stack.length - 1];
    };
    return [push, pop, cur];
}
function initGfx(gl, opts) {
    if (opts === void 0) opts = {};
    var gc = [];
    function onDestroy(action) {
        gc.push(action);
    }
    function destroy() {
        gc.forEach(function(action) {
            return action();
        });
        var extension = gl.getExtension("WEBGL_lose_context");
        if (extension) {
            extension.loseContext();
        }
    }
    var curVertexFormat = null;
    function setVertexFormat(fmt) {
        if ((0, deepEq_1.deepEq)(fmt, curVertexFormat)) {
            return;
        }
        curVertexFormat = fmt;
        var stride = fmt.reduce(function(sum, f) {
            return sum + f.size;
        }, 0);
        fmt.reduce(function(offset, f, i) {
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
    var _a = genStack(function(t) {
            return gl.bindTexture(gl.TEXTURE_2D, t);
        }),
        pushTexture2D = _a[0],
        popTexture2D = _a[1];
    var _b = genStack(function(b) {
            return gl.bindBuffer(gl.ARRAY_BUFFER, b);
        }),
        pushArrayBuffer = _b[0],
        popArrayBuffer = _b[1];
    var _c = genStack(function(b) {
            return gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b);
        }),
        pushElementArrayBuffer = _c[0],
        popElementArrayBuffer = _c[1];
    var _d = genStack(function(b) {
            return gl.bindFramebuffer(gl.FRAMEBUFFER, b);
        }),
        pushFramebuffer = _d[0],
        popFramebuffer = _d[1];
    var _e = genStack(function(b) {
            return gl.bindRenderbuffer(gl.RENDERBUFFER, b);
        }),
        pushRenderbuffer = _e[0],
        popRenderbuffer = _e[1];
    var _f = genStack(function(stack) {
            if (!stack) {
                return;
            }
            var x = stack.x, y = stack.y, w = stack.w, h = stack.h;
            gl.viewport(x, y, w, h);
        }),
        pushViewport = _f[0],
        popViewport = _f[1];
    var _g = genStack(function(p) {
            return gl.useProgram(p);
        }),
        pushProgram = _g[0],
        popProgram = _g[1];
    pushViewport({
        x: 0,
        y: 0,
        w: gl.drawingBufferWidth,
        h: gl.drawingBufferHeight,
    });
    return {
        gl: gl,
        opts: opts,
        onDestroy: onDestroy,
        destroy: destroy,
        pushTexture2D: pushTexture2D,
        popTexture2D: popTexture2D,
        pushArrayBuffer: pushArrayBuffer,
        popArrayBuffer: popArrayBuffer,
        pushElementArrayBuffer: pushElementArrayBuffer,
        popElementArrayBuffer: popElementArrayBuffer,
        pushFramebuffer: pushFramebuffer,
        popFramebuffer: popFramebuffer,
        pushRenderbuffer: pushRenderbuffer,
        popRenderbuffer: popRenderbuffer,
        pushViewport: pushViewport,
        popViewport: popViewport,
        pushProgram: pushProgram,
        popProgram: popProgram,
        setVertexFormat: setVertexFormat,
    };
}

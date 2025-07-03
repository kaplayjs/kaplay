"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shader = void 0;
exports.makeShader = makeShader;
exports.resolveShader = resolveShader;
exports.getShader = getShader;
exports.loadShader = loadShader;
exports.loadShaderURL = loadShaderURL;
var general_1 = require("../constants/general");
var color_1 = require("../math/color");
var Mat4_1 = require("../math/Mat4");
var math_1 = require("../math/math");
var Vec2_1 = require("../math/Vec2");
var shared_1 = require("../shared");
var asserts_1 = require("../utils/asserts");
var log_1 = require("../utils/log");
var asset_1 = require("./asset");
var asset_2 = require("./asset");
var utils_1 = require("./utils");
/**
 * @group GFX
 */
var Shader = /** @class */ function() {
    function Shader(ctx, vert, frag, attribs) {
        var _this = this;
        this.ctx = ctx;
        ctx.onDestroy(function() {
            return _this.free();
        });
        var gl = ctx.gl;
        var vertShader = gl.createShader(gl.VERTEX_SHADER);
        var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        if (!vertShader || !fragShader) {
            throw new Error("Failed to create shader");
        }
        // What we should do if vert or frag are null?
        gl.shaderSource(vertShader, vert);
        gl.shaderSource(fragShader, frag);
        gl.compileShader(vertShader);
        gl.compileShader(fragShader);
        var prog = gl.createProgram();
        this.glProgram = prog;
        gl.attachShader(prog, vertShader);
        gl.attachShader(prog, fragShader);
        attribs.forEach(function(attrib, i) {
            return gl.bindAttribLocation(prog, i, attrib);
        });
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            var vertError = gl.getShaderInfoLog(vertShader);
            if (vertError) {
                throw new Error("VERTEX SHADER " + vertError);
            }
            var fragError = gl.getShaderInfoLog(fragShader);
            if (fragError) {
                throw new Error("FRAGMENT SHADER " + fragError);
            }
        }
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
    }
    Shader.prototype.bind = function() {
        this.ctx.pushProgram(this.glProgram);
    };
    Shader.prototype.unbind = function() {
        this.ctx.popProgram();
    };
    Shader.prototype.send = function(uniform) {
        var gl = this.ctx.gl;
        for (var name_1 in uniform) {
            var val = uniform[name_1];
            var loc = gl.getUniformLocation(this.glProgram, name_1);
            if (typeof val === "number") {
                gl.uniform1f(loc, val);
            }
            else if (val instanceof Mat4_1.Mat4) {
                gl.uniformMatrix4fv(loc, false, new Float32Array(val.m));
            }
            else if (val instanceof math_1.Mat23) {
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
            else if (val instanceof color_1.Color) {
                gl.uniform3f(loc, val.r, val.g, val.b);
            }
            else if (val instanceof Vec2_1.Vec2) {
                gl.uniform2f(loc, val.x, val.y);
            }
            else if (Array.isArray(val)) {
                if ((0, asserts_1.arrayIsNumber)(val)) {
                    gl.uniform1fv(loc, val);
                }
                else if ((0, asserts_1.arrayIsVec2)(val)) {
                    gl.uniform2fv(
                        loc,
                        val.map(function(v) {
                            return [v.x, v.y];
                        }).flat(),
                    );
                }
                else if ((0, asserts_1.arrayIsColor)(val)) {
                    gl.uniform3fv(
                        loc,
                        val.map(function(v) {
                            return [v.r, v.g, v.b];
                        }).flat(),
                    );
                }
            }
            else {
                throw new Error("Unsupported uniform data type");
            }
        }
    };
    Shader.prototype.free = function() {
        this.ctx.gl.deleteProgram(this.glProgram);
    };
    return Shader;
}();
exports.Shader = Shader;
function makeShader(ggl, vertSrc, fragSrc) {
    if (vertSrc === void 0) vertSrc = general_1.DEF_VERT;
    if (fragSrc === void 0) fragSrc = general_1.DEF_FRAG;
    var vcode = general_1.VERT_TEMPLATE.replace(
        "{{user}}",
        vertSrc !== null && vertSrc !== void 0 ? vertSrc : general_1.DEF_VERT,
    );
    var fcode = general_1.FRAG_TEMPLATE.replace(
        "{{user}}",
        fragSrc !== null && fragSrc !== void 0 ? fragSrc : general_1.DEF_FRAG,
    );
    try {
        return new Shader(
            ggl,
            vcode,
            fcode,
            general_1.VERTEX_FORMAT.map(function(vert) {
                return vert.name;
            }),
        );
    } catch (e) {
        var lineOffset = 14;
        var fmt = /(?<type>^\w+) SHADER ERROR: 0:(?<line>\d+): (?<msg>.+)/;
        var match = (0, log_1.getErrorMessage)(e).match(fmt);
        if (!(match === null || match === void 0 ? void 0 : match.groups)) {
            throw e;
        }
        var line = Number(match.groups.line) - lineOffset;
        var msg = match.groups.msg.trim();
        var ty = match.groups.type.toLowerCase();
        throw new Error(
            "".concat(ty, " shader line ").concat(line, ": ").concat(msg),
        );
    }
}
function resolveShader(src) {
    var _a;
    if (!src) {
        return shared_1._k.gfx.defShader;
    }
    if (typeof src === "string") {
        var shader = getShader(src);
        if (shader) {
            return (_a = shader.data) !== null && _a !== void 0 ? _a : shader;
        }
        else if ((0, asset_1.loadProgress)() < 1) {
            return null;
        }
        else {
            throw new Error("Shader not found: ".concat(src));
        }
    }
    else if (src instanceof asset_2.Asset) {
        return src.data ? src.data : src;
    }
    return src;
}
function getShader(name) {
    var _a;
    return (_a = shared_1._k.assets.shaders.get(name)) !== null && _a !== void 0
        ? _a
        : null;
}
function loadShader(name, vert, frag) {
    return shared_1._k.assets.shaders.addLoaded(
        name,
        makeShader(shared_1._k.gfx.ggl, vert, frag),
    );
}
function loadShaderURL(name, vert, frag) {
    vert = (0, utils_1.fixURL)(vert);
    frag = (0, utils_1.fixURL)(frag);
    var resolveUrl = function(url) {
        return url
            ? (0, asset_1.fetchText)(url)
            : Promise.resolve(null);
    };
    var load = Promise.all([resolveUrl(vert), resolveUrl(frag)])
        .then(function(_a) {
            var vcode = _a[0], fcode = _a[1];
            return makeShader(shared_1._k.gfx.ggl, vcode, fcode);
        });
    return shared_1._k.assets.shaders.add(name, load);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAppGfx = void 0;
var shader_1 = require("../assets/shader");
var general_1 = require("../constants/general");
var color_1 = require("../math/color");
var math_1 = require("../math/math");
var Vec2_1 = require("../math/Vec2");
var FrameBuffer_1 = require("./FrameBuffer");
var gfx_1 = require("./gfx");
var initAppGfx = function(gfx, gopt) {
    var _a, _b, _c, _d;
    var defShader = (0, shader_1.makeShader)(
        gfx,
        general_1.DEF_VERT,
        general_1.DEF_FRAG,
    );
    var pixelDensity = (_a = gopt.pixelDensity) !== null && _a !== void 0
        ? _a
        : 1;
    var gl = gfx.gl;
    // a 1x1 white texture to draw raw shapes like rectangles and polygons
    // we use a texture for those so we can use only 1 pipeline for drawing sprites + shapes
    var emptyTex = gfx_1.Texture.fromImage(
        gfx,
        new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1),
    );
    var frameBuffer = (gopt.width && gopt.height)
        ? new FrameBuffer_1.FrameBuffer(
            gfx,
            gopt.width * pixelDensity * gopt.scale,
            gopt.height * pixelDensity * gopt.scale,
        )
        : new FrameBuffer_1.FrameBuffer(
            gfx,
            gl.drawingBufferWidth,
            gl.drawingBufferHeight,
        );
    var bgColor = null;
    var bgAlpha = 1;
    if (gopt.background) {
        if (typeof gopt.background === "string") {
            bgColor = (0, color_1.rgb)(gopt.background);
        }
        else {
            bgColor = color_1.rgb.apply(void 0, gopt.background);
            bgAlpha = (_b = gopt.background[3]) !== null && _b !== void 0
                ? _b
                : 1;
        }
        gl.clearColor(
            bgColor.r / 255,
            bgColor.g / 255,
            bgColor.b / 255,
            bgAlpha !== null && bgAlpha !== void 0 ? bgAlpha : 1,
        );
    }
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA,
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA,
    );
    var renderer = new gfx_1.BatchRenderer(
        gfx,
        general_1.VERTEX_FORMAT,
        general_1.MAX_BATCHED_VERTS,
        general_1.MAX_BATCHED_INDICES,
    );
    // a checkerboard texture used for the default background
    var bgTex = gfx_1.Texture.fromImage(
        gfx,
        new ImageData(
            new Uint8ClampedArray([
                128,
                128,
                128,
                255,
                190,
                190,
                190,
                255,
                190,
                190,
                190,
                255,
                128,
                128,
                128,
                255,
            ]),
            2,
            2,
        ),
        {
            wrap: "repeat",
            filter: "nearest",
        },
    );
    var transformStack = new Array(32).fill(0).map(function(_) {
        return new math_1.Mat23();
    });
    return {
        // how many draw calls we're doing last frame, this is the number we give to users
        lastDrawCalls: 0,
        fontAtlases: {},
        ggl: gfx,
        // gfx states
        defShader: defShader,
        defTex: emptyTex,
        frameBuffer: frameBuffer,
        postShader: null,
        postShaderUniform: null,
        renderer: renderer,
        pixelDensity: pixelDensity,
        transform: new math_1.Mat23(),
        transformStack: transformStack,
        transformStackIndex: -1,
        bgTex: bgTex,
        bgColor: bgColor,
        bgAlpha: bgAlpha,
        width: (_c = gopt.width) !== null && _c !== void 0
            ? _c
            : gl.drawingBufferWidth / pixelDensity / gopt.scale,
        height: (_d = gopt.height) !== null && _d !== void 0
            ? _d
            : gl.drawingBufferHeight / pixelDensity / gopt.scale,
        viewport: {
            x: 0,
            y: 0,
            width: gl.drawingBufferWidth,
            height: gl.drawingBufferHeight,
            scale: 1,
        },
        fixed: false,
        gl: gl,
        scratchPt: new Vec2_1.Vec2(0, 0),
    };
};
exports.initAppGfx = initAppGfx;

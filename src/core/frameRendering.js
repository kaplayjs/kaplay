"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFrameRenderer = void 0;
var general_1 = require("../constants/general");
var drawTexture_1 = require("../gfx/draw/drawTexture");
var drawUnscaled_1 = require("../gfx/draw/drawUnscaled");
var drawUVQuad_1 = require("../gfx/draw/drawUVQuad");
var stack_1 = require("../gfx/stack");
var math_1 = require("../math/math");
var Vec2_1 = require("../math/Vec2");
var createFrameRenderer = function(gfx, game, pixelDensity) {
    // start a rendering frame, reset some states
    function frameStart() {
        // clear backbuffer
        gfx.gl.clear(gfx.gl.COLOR_BUFFER_BIT);
        gfx.frameBuffer.bind();
        // clear framebuffer
        gfx.gl.clear(gfx.gl.COLOR_BUFFER_BIT);
        // Iconic background
        if (!gfx.bgColor) {
            (0, drawUnscaled_1.drawUnscaled)(function() {
                (0, drawUVQuad_1.drawUVQuad)({
                    width: (0, stack_1.width)(),
                    height: (0, stack_1.height)(),
                    quad: new math_1.Quad(
                        0,
                        0,
                        (0, stack_1.width)() / general_1.BG_GRID_SIZE,
                        (0, stack_1.height)() / general_1.BG_GRID_SIZE,
                    ),
                    tex: gfx.bgTex,
                    fixed: true,
                });
            });
        }
        gfx.renderer.numDraws = 0;
        gfx.fixed = false;
        gfx.transformStackIndex = -1;
        gfx.transform.setIdentity();
    }
    function frameEnd() {
        // TODO: don't render debug UI with framebuffer
        // TODO: polish framebuffer rendering / sizing issues
        (0, stack_1.flush)();
        gfx.lastDrawCalls = gfx.renderer.numDraws;
        gfx.frameBuffer.unbind();
        gfx.gl.viewport(
            0,
            0,
            gfx.gl.drawingBufferWidth,
            gfx.gl.drawingBufferHeight,
        );
        var ow = gfx.width;
        var oh = gfx.height;
        gfx.width = gfx.gl.drawingBufferWidth / pixelDensity;
        gfx.height = gfx.gl.drawingBufferHeight / pixelDensity;
        (0, drawTexture_1.drawTexture)({
            flipY: true,
            tex: gfx.frameBuffer.tex,
            pos: new Vec2_1.Vec2(gfx.viewport.x, gfx.viewport.y),
            width: gfx.viewport.width,
            height: gfx.viewport.height,
            shader: gfx.postShader,
            uniform: typeof gfx.postShaderUniform === "function"
                ? gfx.postShaderUniform()
                : gfx.postShaderUniform,
            fixed: true,
        });
        (0, stack_1.flush)();
        gfx.width = ow;
        gfx.height = oh;
    }
    function fixedUpdateFrame() {
        // update every obj
        game.root.fixedUpdate();
    }
    function updateFrame() {
        game.root.update();
    }
    return {
        frameStart: frameStart,
        frameEnd: frameEnd,
        fixedUpdateFrame: fixedUpdateFrame,
        updateFrame: updateFrame,
    };
};
exports.createFrameRenderer = createFrameRenderer;

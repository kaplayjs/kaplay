"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAppEvents = initAppEvents;
var burp_1 = require("../audio/burp");
var FrameBuffer_1 = require("../gfx/FrameBuffer");
var viewport_1 = require("../gfx/viewport");
var clamp_1 = require("../math/clamp");
var shared_1 = require("../shared");
var numbers_1 = require("../utils/numbers");
// Events used at the start of a game
function initAppEvents() {
    var _a;
    shared_1._k.app.onHide(function() {
        if (!shared_1._k.globalOpt.backgroundAudio) {
            shared_1._k.audio.ctx.suspend();
        }
    });
    shared_1._k.app.onShow(function() {
        if (
            !shared_1._k.globalOpt.backgroundAudio && !shared_1._k.debug.paused
        ) {
            shared_1._k.audio.ctx.resume();
        }
    });
    shared_1._k.app.onResize(function() {
        if (shared_1._k.app.isFullscreen()) {
            return;
        }
        var fixedSize = shared_1._k.globalOpt.width
            && shared_1._k.globalOpt.height;
        if (fixedSize && !shared_1._k.globalOpt.letterbox) {
            return;
        }
        shared_1._k.canvas.width = shared_1._k.canvas.offsetWidth
            * shared_1._k.gfx.pixelDensity;
        shared_1._k.canvas.height = shared_1._k.canvas.offsetHeight
            * shared_1._k.gfx.pixelDensity;
        (0, viewport_1.updateViewport)();
        if (!fixedSize) {
            shared_1._k.gfx.frameBuffer.free();
            shared_1._k.gfx.frameBuffer = new FrameBuffer_1.FrameBuffer(
                shared_1._k.gfx.ggl,
                shared_1._k.gfx.ggl.gl.drawingBufferWidth,
                shared_1._k.gfx.ggl.gl.drawingBufferHeight,
            );
            shared_1._k.gfx.width = shared_1._k.gfx.ggl.gl.drawingBufferWidth
                / shared_1._k.gfx.pixelDensity
                / shared_1._k.globalOpt.scale;
            shared_1._k.gfx.height = shared_1._k.gfx.ggl.gl.drawingBufferHeight
                / shared_1._k.gfx.pixelDensity
                / shared_1._k.globalOpt.scale;
        }
    });
    if (shared_1._k.globalOpt.debug !== false) {
        shared_1._k.app.onKeyPress(
            (_a = shared_1._k.globalOpt.debugKey) !== null && _a !== void 0
                ? _a
                : "f1",
            function() {
                return shared_1._k.debug.inspect = !shared_1._k.debug.inspect;
            },
        );
        shared_1._k.app.onKeyPress("f2", function() {
            return shared_1._k.debug.clearLog();
        });
        shared_1._k.app.onKeyPress("f8", function() {
            return shared_1._k.debug.paused = !shared_1._k.debug.paused;
        });
        shared_1._k.app.onKeyPress("f7", function() {
            shared_1._k.debug.timeScale = (0, numbers_1.toFixed)(
                (0, clamp_1.clamp)(shared_1._k.debug.timeScale - 0.2, 0, 2),
                1,
            );
        });
        shared_1._k.app.onKeyPress("f9", function() {
            shared_1._k.debug.timeScale = (0, numbers_1.toFixed)(
                (0, clamp_1.clamp)(shared_1._k.debug.timeScale + 0.2, 0, 2),
                1,
            );
        });
        shared_1._k.app.onKeyPress("f10", function() {
            return shared_1._k.debug.stepFrame();
        });
    }
    // burp mode initialization
    if (shared_1._k.globalOpt.burp) {
        shared_1._k.app.onKeyPress("b", function() {
            return (0, burp_1.burp)();
        });
    }
}

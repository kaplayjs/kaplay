"use strict";
var __assign = (this && this.__assign) || function() {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) {
                if (Object.prototype.hasOwnProperty.call(s, p)) {
                    t[p] = s[p];
                }
            }
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErr = exports.throwError = void 0;
var general_1 = require("../constants/general");
var drawFormattedText_1 = require("../gfx/draw/drawFormattedText");
var drawRect_1 = require("../gfx/draw/drawRect");
var drawText_1 = require("../gfx/draw/drawText");
var drawUnscaled_1 = require("../gfx/draw/drawUnscaled");
var formatText_1 = require("../gfx/formatText");
var stack_1 = require("../gfx/stack");
var color_1 = require("../math/color");
var math_1 = require("../math/math");
var shared_1 = require("../shared");
var throwError = function(err) {
    (0, exports.handleErr)(err);
};
exports.throwError = throwError;
var handleErr = function(err) {
    if (shared_1._k.game.crashed) {
        return;
    }
    shared_1._k.game.crashed = true;
    shared_1._k.audio.ctx.suspend();
    var error;
    if (err instanceof Error) {
        error = err;
    }
    else {
        error = new Error(String(err));
    }
    if (!error.message) {
        error.message = "Unknown error, check console for more info";
    }
    shared_1._k.app.run(function() {}, function() {
        shared_1._k.app.state.stopped = true;
        shared_1._k.frameRenderer.frameStart();
        (0, drawUnscaled_1.drawUnscaled)(function() {
            var pad = 32;
            var gap = 16;
            var gw = (0, stack_1.width)();
            var gh = (0, stack_1.height)();
            var textStyle = {
                size: 36,
                width: gw - pad * 2,
                letterSpacing: 4,
                lineSpacing: 4,
                font: general_1.DBG_FONT,
                fixed: true,
            };
            (0, drawRect_1.drawRect)({
                width: gw,
                height: gh,
                color: (0, color_1.rgb)(0, 0, 255),
                fixed: true,
            });
            var title = (0, formatText_1.formatText)(
                __assign(__assign({}, textStyle), {
                    text: "Error",
                    pos: (0, math_1.vec2)(pad),
                    color: (0, color_1.rgb)(255, 128, 0),
                    fixed: true,
                }),
            );
            (0, drawFormattedText_1.drawFormattedText)(title);
            (0, drawText_1.drawText)(
                __assign(__assign({}, textStyle), {
                    text: esc(error.message),
                    pos: (0, math_1.vec2)(pad, pad + title.height + gap),
                    fixed: true,
                }),
            );
            (0, stack_1.popTransform)();
            shared_1._k.game.events.trigger("error", error);
        });
        shared_1._k.frameRenderer.frameEnd();
    });
    // TODO: Make this a setting
    if (!error.message.startsWith("[rendering]")) {
        throw error;
    }
    else {
        // We don't throw rendering errors,
        // but we log them to the console
        // This is for "headless" rendering
        console.error(error);
    }
};
exports.handleErr = handleErr;
function esc(t) {
    return t.replaceAll(/(?<!\\)\[/g, "\\[");
}

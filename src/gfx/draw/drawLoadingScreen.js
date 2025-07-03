"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawLoadScreen = drawLoadScreen;
var asset_1 = require("../../assets/asset");
var color_1 = require("../../math/color");
var math_1 = require("../../math/math");
var shared_1 = require("../../shared");
var stack_1 = require("../stack");
var drawRect_1 = require("./drawRect");
var drawUnscaled_1 = require("./drawUnscaled");
function drawLoadScreen() {
    var progress = (0, asset_1.loadProgress)();
    if (shared_1._k.game.events.numListeners("loading") > 0) {
        shared_1._k.game.events.trigger("loading", progress);
    }
    else {
        (0, drawUnscaled_1.drawUnscaled)(function () {
            var w = (0, stack_1.width)() / 2;
            var h = 24;
            var pos = (0, math_1.vec2)((0, stack_1.width)() / 2, (0, stack_1.height)() / 2).sub((0, math_1.vec2)(w / 2, h / 2));
            (0, drawRect_1.drawRect)({
                pos: (0, math_1.vec2)(0),
                width: (0, stack_1.width)(),
                height: (0, stack_1.height)(),
                color: (0, color_1.rgb)(0, 0, 0),
            });
            (0, drawRect_1.drawRect)({
                pos: pos,
                width: w,
                height: h,
                fill: false,
                outline: {
                    width: 4,
                },
            });
            (0, drawRect_1.drawRect)({
                pos: pos,
                width: w * progress,
                height: h,
            });
        });
    }
}

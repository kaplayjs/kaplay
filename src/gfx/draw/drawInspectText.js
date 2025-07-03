"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawInspectText = drawInspectText;
var general_1 = require("../../constants/general");
var color_1 = require("../../math/color");
var math_1 = require("../../math/math");
var formatText_1 = require("../formatText");
var stack_1 = require("../stack");
var drawFormattedText_1 = require("./drawFormattedText");
var drawRect_1 = require("./drawRect");
var drawUnscaled_1 = require("./drawUnscaled");
function drawInspectText(pos, txt) {
    (0, drawUnscaled_1.drawUnscaled)(function () {
        var pad = (0, math_1.vec2)(8);
        (0, stack_1.pushTransform)();
        (0, stack_1.multTranslateV)(pos);
        var ftxt = (0, formatText_1.formatText)({
            text: txt,
            font: general_1.DBG_FONT,
            size: 16,
            pos: pad,
            color: (0, color_1.rgb)(255, 255, 255),
            fixed: true,
        });
        var bw = ftxt.width + pad.x * 2;
        var bh = ftxt.height + pad.x * 2;
        if (pos.x + bw >= (0, stack_1.width)()) {
            (0, stack_1.multTranslateV)((0, math_1.vec2)(-bw, 0));
        }
        if (pos.y + bh >= (0, stack_1.height)()) {
            (0, stack_1.multTranslateV)((0, math_1.vec2)(0, -bh));
        }
        (0, drawRect_1.drawRect)({
            width: bw,
            height: bh,
            color: (0, color_1.rgb)(0, 0, 0),
            radius: 4,
            opacity: 0.8,
            fixed: true,
        });
        (0, drawFormattedText_1.drawFormattedText)(ftxt);
        (0, stack_1.popTransform)();
    });
}

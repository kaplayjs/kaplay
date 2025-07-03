"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawText = drawText;
var formatText_1 = require("../formatText");
var drawFormattedText_1 = require("./drawFormattedText");
function drawText(opt) {
    (0, drawFormattedText_1.drawFormattedText)((0, formatText_1.formatText)(opt));
}

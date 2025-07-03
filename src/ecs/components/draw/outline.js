"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outline = outline;
var color_1 = require("../../../math/color");
function outline(width, color, opacity, join, miterLimit, cap) {
    if (width === void 0) { width = 1; }
    if (color === void 0) { color = (0, color_1.rgb)(0, 0, 0); }
    if (opacity === void 0) { opacity = 1; }
    if (join === void 0) { join = "miter"; }
    if (miterLimit === void 0) { miterLimit = 10; }
    if (cap === void 0) { cap = "butt"; }
    return {
        id: "outline",
        outline: {
            width: width,
            color: color,
            opacity: opacity,
            join: join,
            miterLimit: miterLimit,
            cap: cap,
        },
        inspect: function () {
            return "outline: ".concat(this.outline.width, "px, ").concat(this.outline.color);
        },
    };
}

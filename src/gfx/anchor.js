"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anchorPt = anchorPt;
exports.alignPt = alignPt;
var math_1 = require("../constants/math");
// convert anchor string to a vec2 offset
function anchorPt(orig) {
    switch (orig) {
        case "topleft":
            return math_1.TOP_LEFT;
        case "top":
            return math_1.TOP;
        case "topright":
            return math_1.TOP_RIGHT;
        case "left":
            return math_1.LEFT;
        case "center":
            return math_1.CENTER;
        case "right":
            return math_1.RIGHT;
        case "botleft":
            return math_1.BOTTOM_LEFT;
        case "bot":
            return math_1.BOTTOM;
        case "botright":
            return math_1.BOTTOM_RIGHT;
        default:
            return orig;
    }
}
function alignPt(align) {
    switch (align) {
        case "left":
            return 0;
        case "center":
            return 0.5;
        case "right":
            return 1;
        default:
            return 0;
    }
}

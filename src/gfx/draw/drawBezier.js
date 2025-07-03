"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawBezier = drawBezier;
var math_1 = require("../../math/math");
var drawCurve_1 = require("./drawCurve");
function drawBezier(opt) {
    (0, drawCurve_1.drawCurve)(function(t) {
        return (0, math_1.evaluateBezier)(
            opt.pt1,
            opt.pt2,
            opt.pt3,
            opt.pt4,
            t,
        );
    }, opt);
}

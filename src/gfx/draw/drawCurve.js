"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawCurve = drawCurve;
var drawLine_1 = require("./drawLine");
function drawCurve(curve, opt) {
    var _a;
    var segments = (_a = opt.segments) !== null && _a !== void 0 ? _a : 16;
    var p = [];
    for (var i = 0; i <= segments; i++) {
        p.push(curve(i / segments));
    }
    (0, drawLine_1.drawLines)({
        pts: p,
        width: opt.width || 1,
        pos: opt.pos,
        color: opt.color,
        opacity: opt.opacity,
    });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawTriangle = drawTriangle;
var drawPolygon_1 = require("./drawPolygon");
function drawTriangle(opt) {
    if (!opt.p1 || !opt.p2 || !opt.p3) {
        throw new Error("drawTriangle() requires properties \"p1\", \"p2\" and \"p3\".");
    }
    return (0, drawPolygon_1.drawPolygon)(Object.assign({}, opt, {
        pts: [opt.p1, opt.p2, opt.p3],
    }));
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawCircle = drawCircle;
var drawEllipse_1 = require("./drawEllipse");
function drawCircle(opt) {
    if (typeof opt.radius !== "number") {
        throw new Error("drawCircle() requires property \"radius\".");
    }
    if (opt.radius === 0) {
        return;
    }
    (0, drawEllipse_1.drawEllipse)(Object.assign({}, opt, {
        radiusX: opt.radius,
        radiusY: opt.radius,
        angle: 0,
    }));
}

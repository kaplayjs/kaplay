"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawCanvas = drawCanvas;
var math_1 = require("../../math/math");
var stack_1 = require("../stack");
var drawUVQuad_1 = require("./drawUVQuad");
function drawCanvas(opt) {
    var fb = opt.canvas.fb;
    (0, drawUVQuad_1.drawUVQuad)(Object.assign({}, opt, {
        tex: fb.tex,
        width: opt.width || fb.width,
        height: opt.height || fb.height,
        pos: (opt.pos || (0, math_1.vec2)()).add(0, (0, stack_1.height)()),
        scale: (opt.scale || (0, math_1.vec2)(1)).scale(1, -1),
    }));
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawMasked = drawMasked;
var shared_1 = require("../../shared");
var drawStenciled_1 = require("./drawStenciled");
function drawMasked(content, mask) {
    var gl = shared_1._k.gfx.ggl.gl;
    (0, drawStenciled_1.drawStenciled)(content, mask, gl.EQUAL);
}

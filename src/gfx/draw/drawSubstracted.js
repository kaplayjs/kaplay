"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawSubtracted = drawSubtracted;
var shared_1 = require("../../shared");
var drawStenciled_1 = require("./drawStenciled");
function drawSubtracted(content, mask) {
    var gl = shared_1._k.gfx.ggl.gl;
    (0, drawStenciled_1.drawStenciled)(content, mask, gl.NOTEQUAL);
}

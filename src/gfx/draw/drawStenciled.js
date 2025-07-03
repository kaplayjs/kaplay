"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawStenciled = drawStenciled;
var shared_1 = require("../../shared");
var stack_1 = require("../stack");
function drawStenciled(content, mask, test) {
    var gl = shared_1._k.gfx.ggl.gl;
    (0, stack_1.flush)();
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.enable(gl.STENCIL_TEST);
    // don't perform test, pure write
    gl.stencilFunc(gl.NEVER, 1, 0xFF);
    // always replace since we're writing to the buffer
    gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
    mask();
    (0, stack_1.flush)();
    // perform test
    gl.stencilFunc(test, 1, 0xFF);
    // don't write since we're only testing
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    content();
    (0, stack_1.flush)();
    gl.disable(gl.STENCIL_TEST);
}

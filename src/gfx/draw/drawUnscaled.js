"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawUnscaled = drawUnscaled;
var shared_1 = require("../../shared");
var stack_1 = require("../stack");
function drawUnscaled(content) {
    (0, stack_1.flush)();
    var ow = shared_1._k.gfx.width;
    var oh = shared_1._k.gfx.height;
    shared_1._k.gfx.width = shared_1._k.gfx.viewport.width;
    shared_1._k.gfx.height = shared_1._k.gfx.viewport.height;
    content();
    (0, stack_1.flush)();
    shared_1._k.gfx.width = ow;
    shared_1._k.gfx.height = oh;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawFrame = drawFrame;
var lerp_1 = require("../../math/lerp");
var math_1 = require("../../math/math");
var Vec2_1 = require("../../math/Vec2");
var shared_1 = require("../../shared");
var stack_1 = require("../stack");
function drawFrame() {
    var _a;
    // calculate camera matrix
    var cam = shared_1._k.game.cam;
    var shake = Vec2_1.Vec2.fromAngle((0, math_1.rand)(0, 360)).scale(cam.shake);
    cam.shake = (0, lerp_1.lerp)(cam.shake, 0, 5 * shared_1._k.app.dt());
    cam.transform.setIdentity()
        .translateSelfV((0, stack_1.center)())
        .scaleSelfV(cam.scale)
        .rotateSelf(cam.angle)
        .translateSelfV(((_a = cam.pos) !== null && _a !== void 0 ? _a : (0, stack_1.center)()).scale(-1).add(shake));
    shared_1._k.game.root.draw();
    (0, stack_1.flush)();
}

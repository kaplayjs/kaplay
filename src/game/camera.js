"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCamPos = setCamPos;
exports.getCamPos = getCamPos;
exports.setCamScale = setCamScale;
exports.getCamScale = getCamScale;
exports.setCamRot = setCamRot;
exports.getCamRot = getCamRot;
exports.getCamTransform = getCamTransform;
exports.flash = flash;
exports.shake = shake;
exports.toScreen = toScreen;
exports.toWorld = toWorld;
exports.camPos = camPos;
exports.camScale = camScale;
exports.camRot = camRot;
exports.camFlash = camFlash;
exports.camTransform = camTransform;
var color_1 = require("../ecs/components/draw/color");
var opacity_1 = require("../ecs/components/draw/opacity");
var rect_1 = require("../ecs/components/draw/rect");
var fixed_1 = require("../ecs/components/transform/fixed");
var utils_1 = require("../ecs/entity/utils");
var stack_1 = require("../gfx/stack");
var color_2 = require("../math/color");
var math_1 = require("../math/math");
var Vec2_1 = require("../math/Vec2");
var shared_1 = require("../shared");
var log_1 = require("../utils/log");
function setCamPos() {
    var pos = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        pos[_i] = arguments[_i];
    }
    shared_1._k.game.cam.pos = math_1.vec2.apply(void 0, pos);
}
function getCamPos() {
    return shared_1._k.game.cam.pos
        ? shared_1._k.game.cam.pos.clone()
        : (0, stack_1.center)();
}
function setCamScale() {
    var scale = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        scale[_i] = arguments[_i];
    }
    shared_1._k.game.cam.scale = math_1.vec2.apply(void 0, scale);
}
function getCamScale() {
    return shared_1._k.game.cam.scale.clone();
}
function setCamRot(angle) {
    shared_1._k.game.cam.angle = angle;
}
function getCamRot() {
    return shared_1._k.game.cam.angle;
}
function getCamTransform() {
    return shared_1._k.game.cam.transform.clone();
}
function flash(flashColor, fadeOutTime) {
    if (flashColor === void 0) flashColor = (0, color_2.rgb)(255, 255, 255);
    if (fadeOutTime === void 0) fadeOutTime = 1;
    var flash = shared_1._k.game.root.add([
        (0, rect_1.rect)((0, stack_1.width)(), (0, stack_1.height)()),
        (0, color_1.color)(flashColor),
        (0, opacity_1.opacity)(1),
        (0, fixed_1.fixed)(),
    ]);
    var fade = flash.fadeOut(fadeOutTime);
    fade.onEnd(function() {
        return (0, utils_1.destroy)(flash);
    });
    return fade;
}
function shake(intensity) {
    if (intensity === void 0) intensity = 12;
    shared_1._k.game.cam.shake += intensity;
}
function toScreen(p) {
    return shared_1._k.game.cam.transform.transformPointV(p, new Vec2_1.Vec2());
}
function toWorld(p) {
    return shared_1._k.game.cam.transform.inverse.transformPointV(
        p,
        new Vec2_1.Vec2(),
    );
}
function camPos() {
    var pos = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        pos[_i] = arguments[_i];
    }
    (0, log_1.deprecateMsg)("camPos", "setCamPos / getCamPos");
    if (pos.length > 0) {
        setCamPos.apply(void 0, pos);
    }
    return getCamPos();
}
function camScale() {
    var scale = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        scale[_i] = arguments[_i];
    }
    (0, log_1.deprecateMsg)("camScale", "setCamScale / getCamScale");
    if (scale.length > 0) {
        setCamScale.apply(void 0, scale);
    }
    return getCamScale();
}
function camRot(angle) {
    (0, log_1.deprecateMsg)("camRot", "setCamRot / getCamRot");
    if (angle !== undefined) {
        setCamRot(angle);
    }
    return getCamRot();
}
function camFlash(flashColor, fadeOutTime) {
    if (flashColor === void 0) flashColor = (0, color_2.rgb)(255, 255, 255);
    if (fadeOutTime === void 0) fadeOutTime = 1;
    (0, log_1.deprecateMsg)("camFlash", "flash");
    return flash(flashColor, fadeOutTime);
}
function camTransform() {
    (0, log_1.deprecateMsg)("camTransform", "getCamTransform");
    return getCamTransform();
}

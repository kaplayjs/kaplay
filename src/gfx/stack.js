"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePostEffect = void 0;
exports.pushTransform = pushTransform;
exports.popTransform = popTransform;
exports.pushMatrix = pushMatrix;
exports.multTranslateV = multTranslateV;
exports.multTranslate = multTranslate;
exports.multScaleV = multScaleV;
exports.multScale = multScale;
exports.multRotate = multRotate;
exports.loadIdentity = loadIdentity;
exports.loadMatrix = loadMatrix;
exports.storeMatrix = storeMatrix;
exports.flush = flush;
exports.width = width;
exports.height = height;
exports.center = center;
var math_1 = require("../math/math");
var shared_1 = require("../shared");
function pushTransform() {
    shared_1._k.gfx.transformStack[++shared_1._k.gfx.transformStackIndex]
        .setMat23(shared_1._k.gfx.transform);
}
function popTransform() {
    if (shared_1._k.gfx.transformStackIndex >= 0) {
        shared_1._k.gfx.transform.setMat23(
            shared_1._k.gfx
                .transformStack[shared_1._k.gfx.transformStackIndex--],
        );
    }
}
function pushMatrix(m) {
    pushTransform();
    loadMatrix(m);
}
function multTranslateV(t) {
    if (t === undefined) {
        return;
    }
    if (t.x === 0 && t.y === 0) {
        return;
    }
    shared_1._k.gfx.transform.translateSelfV(t);
}
function multTranslate(x, y) {
    if (x === 0 && y === 0) {
        return;
    }
    shared_1._k.gfx.transform.translateSelf(x, y);
}
function multScaleV(s) {
    if (s === undefined) {
        return;
    }
    if (s.x === 1 && s.y === 1) {
        return;
    }
    shared_1._k.gfx.transform.scaleSelfV(s);
}
function multScale(x, y) {
    if (x === 1 && y === 1) {
        return;
    }
    shared_1._k.gfx.transform.scaleSelf(x, y);
}
function multRotate(angle) {
    if (!angle) {
        return;
    }
    shared_1._k.gfx.transform.rotateSelf(angle);
}
function loadIdentity(m) {
    shared_1._k.gfx.transform.setIdentity();
}
function loadMatrix(m) {
    shared_1._k.gfx.transform.setMat23(m);
}
function storeMatrix(m) {
    m.setMat23(shared_1._k.gfx.transform);
}
function flush() {
    shared_1._k.gfx.renderer.flush(width(), height());
}
// get game width
function width() {
    return shared_1._k.gfx.width;
}
// get game height
function height() {
    return shared_1._k.gfx.height;
}
function center() {
    return (0, math_1.vec2)(
        shared_1._k.gfx.width / 2,
        shared_1._k.gfx.height / 2,
    );
}
var usePostEffect = function(name, uniform) {
    shared_1._k.gfx.postShader = name;
    shared_1._k.gfx.postShaderUniform = uniform !== null && uniform !== void 0
        ? uniform
        : null;
};
exports.usePostEffect = usePostEffect;

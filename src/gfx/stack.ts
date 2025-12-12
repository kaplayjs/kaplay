import type { Uniform } from "../assets/shader";
import { type Mat23, vec2 } from "../math/math";
import { Vec2 } from "../math/Vec2";
import { _k } from "../shared";

export function pushTransform() {
    _k.gfx.transformStack[++_k.gfx.transformStackIndex].setMat23(
        _k.gfx.transform,
    );
}

export function popTransform() {
    if (_k.gfx.transformStackIndex >= 0) {
        _k.gfx.transform.setMat23(
            _k.gfx.transformStack[_k.gfx.transformStackIndex--],
        );
    }
}

export function pushMatrix(m: Mat23) {
    pushTransform();
    loadMatrix(m);
}

export function multTranslateV(t: Vec2 | undefined) {
    if (t === undefined) return;
    if (t.x === 0 && t.y === 0) return;
    _k.gfx.transform.translateSelfV(t);
}

export function multTranslate(x: number, y: number) {
    if (x === 0 && y === 0) return;
    _k.gfx.transform.translateSelf(x, y);
}

export function multRotate(angle: number | undefined) {
    if (!angle) return;
    _k.gfx.transform.rotateSelf(angle);
}

export function multScaleV(s: Vec2 | undefined) {
    if (s === undefined) return;
    if (s.x === 1 && s.y === 1) return;
    _k.gfx.transform.scaleSelfV(s);
}

export function multScale(x: number, y: number) {
    if (x === 1 && y === 1) return;
    _k.gfx.transform.scaleSelf(x, y);
}

export function multSkewV(s: Vec2 | undefined) {
    if (s === undefined) return;
    if (s.x === 0 && s.y === 0) return;
    _k.gfx.transform.skewSelfV(s);
}

export function multSkew(x: number, y: number) {
    if (x === 0 && y === 0) return;
    _k.gfx.transform.skewSelf(x, y);
}

export function loadIdentity() {
    _k.gfx.transform.setIdentity();
}

export function loadMatrix(m: Mat23) {
    _k.gfx.transform.setMat23(m);
}

export function storeMatrix(m: Mat23) {
    m.setMat23(_k.gfx.transform);
}

export function flush() {
    _k.gfx.renderer.flush(width(), height());
}

// get game width
export function width(): number {
    return _k.gfx.width;
}

// get game height
export function height(): number {
    return _k.gfx.height;
}

export function center(): Vec2 {
    return vec2(_k.gfx.width / 2, _k.gfx.height / 2);
}

export const usePostEffect = (
    name: string,
    uniform?: Uniform | (() => Uniform),
) => {
    _k.gfx.postShader = name;
    _k.gfx.postShaderUniform = uniform ?? null;
};

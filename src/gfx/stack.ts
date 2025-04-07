import { _k } from "../kaplay";
import { type Mat23, Vec2, vec2 } from "../math/math";

export function pushTranslateV(t: Vec2 | undefined) {
    if (t === undefined) return;
    if (t.x === 0 && t.y === 0) return;
    _k.gfx.transform.translateSelfV(t);
}

export function pushTranslate(x: number, y: number) {
    if (x === 0 && y === 0) return;
    _k.gfx.transform.translateSelf(x, y);
}

export function pushTransform() {
    _k.gfx.transformStack[++_k.gfx.transformStackIndex].setMat23(
        _k.gfx.transform,
    );
}

export function pushMatrix(m: Mat23) {
    _k.gfx.transform.setMat23(m);
}

export function pushScaleV(s: Vec2 | undefined) {
    if (s === undefined) return;
    if (s.x === 1 && s.y === 1) return;
    _k.gfx.transform.scaleSelfV(s);
}

export function pushScale(x: number, y: number) {
    if (x === 1 && y === 1) return;
    _k.gfx.transform.scaleSelf(x, y);
}

export function pushRotate(angle: number | undefined) {
    if (!angle) return;
    _k.gfx.transform.rotateSelf(angle);
}

export function popTransform() {
    if (_k.gfx.transformStackIndex >= 0) {
        _k.gfx.transform.setMat23(
            _k.gfx.transformStack[_k.gfx.transformStackIndex--],
        );
    }
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

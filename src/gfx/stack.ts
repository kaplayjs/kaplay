import { _k } from "../kaplay";
import { type Mat23, Vec2, vec2, type Vec2Args } from "../math/math";

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

export function pushRotate(a: number | undefined) {
    if (!a) return;

    _k.gfx.transform.rotateSelf(a);
}

export function popTransform() {
    if (_k.gfx.transformStackIndex >= 0) {
        _k.gfx.transform.setMat23(
            _k.gfx.transformStack[_k.gfx.transformStackIndex--],
        );
    }
}

export function flush() {
    _k.gfx.renderer.flush();
}

// get game width
export function width(): number {
    return _k.gfx.width;
}

// get game height
export function height(): number {
    return _k.gfx.height;
}

export function getViewportScale() {
    return (_k.gfx.viewport.width + _k.gfx.viewport.height)
        / (_k.gfx.width + _k.gfx.height);
}

// transform a point from content space to view space
export function contentToView(pt: Vec2) {
    return new Vec2(
        pt.x * _k.gfx.viewport.width / _k.gfx.width,
        pt.y * _k.gfx.viewport.height / _k.gfx.height,
    );
}

// transform a point from window space to content space
export function windowToContent(pt: Vec2) {
    return new Vec2(
        (pt.x - _k.gfx.viewport.x) * width() / _k.gfx.viewport.width,
        (pt.y - _k.gfx.viewport.y) * height() / _k.gfx.viewport.height,
    );
}

export function mousePos() {
    return windowToContent(_k.app.mousePos());
}

export function center(): Vec2 {
    return vec2(width() / 2, height() / 2);
}

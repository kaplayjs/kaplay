import { _k } from "../kaplay";
import { type Mat4, Vec2, vec2, type Vec2Args } from "../math/math";

export function pushTranslate(...args: Vec2Args | [undefined]) {
    if (args[0] === undefined) return;

    const p = vec2(...args);
    if (p.x === 0 && p.y === 0) return;
    _k.gfx.transform.translate(p);
}

export function pushTransform() {
    _k.gfx.transformStack.push(_k.gfx.transform.clone());
}

export function pushMatrix(m: Mat4) {
    _k.gfx.transform = m.clone();
}

export function pushScale(
    ...args: Vec2Args | [undefined] | [undefined, undefined]
) {
    if (args[0] === undefined) return;

    const p = vec2(...args);
    if (p.x === 1 && p.y === 1) return;
    _k.gfx.transform.scale(p);
}

export function pushRotate(a: number | undefined) {
    if (!a) return;

    _k.gfx.transform.rotate(a);
}

export function popTransform() {
    if (_k.gfx.transformStack.length > 0) {
        // if there's more than 1 element, it will return obviously a Mat4
        _k.gfx.transform = _k.gfx.transformStack.pop()!;
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

export function center(): Vec2 {
    return vec2(width() / 2, height() / 2);
}

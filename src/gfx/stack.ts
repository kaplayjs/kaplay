import { app, gfx } from "../kaplay";
import { type Mat23, Vec2, vec2, type Vec2Args } from "../math/math";

export function pushTranslateV(t: Vec2 | undefined) {
    if (t === undefined) return;
    if (t.x === 0 && t.y === 0) return;
    gfx.transform.translateSelfV(t);
}

export function pushTranslate(x: number, y: number) {
    if (x === 0 && y === 0) return;
    gfx.transform.translateSelf(x, y);
}

export function pushTransform() {
    gfx.transformStack[++gfx.transformStackIndex].setMat23(gfx.transform);
}

export function pushMatrix(m: Mat23) {
    gfx.transform.setMat23(m);
}

export function pushScaleV(s: Vec2 | undefined) {
    if (s === undefined) return;
    if (s.x === 1 && s.y === 1) return;
    gfx.transform.scaleSelfV(s);
}

export function pushScale(x: number, y: number) {
    if (x === 1 && y === 1) return;
    gfx.transform.scaleSelf(x, y);
}

export function pushRotate(a: number | undefined) {
    if (!a) return;

    gfx.transform.rotateSelf(a);
}

export function popTransform() {
    if (gfx.transformStackIndex >= 0) {
        gfx.transform.setMat23(gfx.transformStack[gfx.transformStackIndex--]);
    }
}

export function flush() {
    gfx.renderer.flush();
}

// get game width
export function width(): number {
    return gfx.width;
}

// get game height
export function height(): number {
    return gfx.height;
}

export function getViewportScale() {
    return (gfx.viewport.width + gfx.viewport.height)
        / (gfx.width + gfx.height);
}

// transform a point from content space to view space
export function contentToView(pt: Vec2) {
    return new Vec2(
        pt.x * gfx.viewport.width / gfx.width,
        pt.y * gfx.viewport.height / gfx.height,
    );
}

// transform a point from window space to content space
export function windowToContent(pt: Vec2) {
    return new Vec2(
        (pt.x - gfx.viewport.x) * width() / gfx.viewport.width,
        (pt.y - gfx.viewport.y) * height() / gfx.viewport.height,
    );
}

export function mousePos() {
    return windowToContent(app.mousePos());
}

export function center(): Vec2 {
    return vec2(width() / 2, height() / 2);
}

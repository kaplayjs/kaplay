import { getKaboomContext, type KaboomCtx } from "../kaboom";
import { type Mat4, vec2, type Vec2Args } from "../math";

export function pushTranslate(
    this: KaboomCtx,
    ...args: Vec2Args | [undefined]
) {
    const { _k } = getKaboomContext(this);
    const { gfx } = _k;

    if (args[0] === undefined) return;

    const p = vec2(...args);
    if (p.x === 0 && p.y === 0) return;
    gfx.transform.translate(p);
}

export function pushTransform(this: KaboomCtx) {
    const { _k } = getKaboomContext(this);
    const { gfx } = _k;

    gfx.transformStack.push(gfx.transform.clone());
}

export function pushMatrix(this: KaboomCtx, m: Mat4) {
    const { _k } = getKaboomContext(this);
    const { gfx } = _k;

    gfx.transform = m.clone();
}

export function pushScale(
    this: KaboomCtx,
    ...args: Vec2Args | [undefined] | [undefined, undefined]
) {
    if (args[0] === undefined) return;

    const { _k } = getKaboomContext(this);
    const { gfx } = _k;

    const p = vec2(...args);
    if (p.x === 1 && p.y === 1) return;
    gfx.transform.scale(p);
}

export function pushRotate(this: KaboomCtx, a: number | undefined) {
    if (!a) return;

    const { _k } = getKaboomContext(this);
    const { gfx } = _k;

    gfx.transform.rotate(a);
}

export function popTransform(this: KaboomCtx) {
    const { _k } = getKaboomContext(this);
    const { gfx } = _k;

    if (gfx.transformStack.length > 0) {
        // if there's more than 1 element, it will return obviously a Mat4
        gfx.transform = gfx.transformStack.pop()!;
    }
}

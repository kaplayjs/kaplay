import { withGfx } from "../core/context";
import { type Mat4, vec2, type Vec2Args } from "../math";

export const ctxPushTranslate = withGfx(
    function(gfx, ...args: Vec2Args | [undefined]) {
        if (args[0] === undefined) return;

        const p = vec2(...args);
        if (p.x === 0 && p.y === 0) return;
        gfx.transform.translate(p);
    },
);

export const ctxPushTransform = withGfx(function(gfx) {
    gfx.transformStack.push(gfx.transform.clone());
});

export const ctxPushMatrix = withGfx(function(gfx, m: Mat4) {
    gfx.transform = m.clone();
});

export const ctxPushScale = withGfx(
    function(gfx, ...args: Vec2Args | [undefined] | [undefined, undefined]) {
        if (args[0] === undefined) return;

        const p = vec2(...args);
        if (p.x === 1 && p.y === 1) return;
        gfx.transform.scale(p);
    },
);

export const ctxPushRotate = withGfx(function(gfx, a: number | undefined) {
    if (!a) return;

    gfx.transform.rotate(a);
});

export const ctxPopTransform = withGfx(function(gfx) {
    if (gfx.transformStack.length > 0) {
        // if there's more than 1 element, it will return obviously a Mat4
        gfx.transform = gfx.transformStack.pop()!;
    }
});

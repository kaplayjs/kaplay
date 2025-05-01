import type { Shape } from "../types";
import { vec2, Rect } from "./math";
import { Vec2 } from "./Vec2";

function minkowskiRectDifference(r1: Rect, r2: Rect): Rect {
    return new Rect(
        vec2(r1.pos.x - (r2.pos.x + r2.width), r1.pos.y - (r2.pos.y + r2.height)),
        r1.width + r2.width, r1.height + r2.height
    );
}

export function minkowskiRectShapeIntersection(shape1: Shape, shape2: Shape) {
    const s1 = shape1 instanceof Rect
        ? shape1
        : shape1.bbox();
    const s2 = shape2 instanceof Rect
        ? shape2
        : shape2.bbox();
    const res = minkowskiRectDifference(s1, s2);

    if (!res.contains(new Vec2())) {
        return null;
    }

    const distance = Math.min(
        Math.abs(res.pos.x),
        Math.abs(res.pos.x + res.width),
        Math.abs(res.pos.y),
        Math.abs(res.pos.y + res.height),
    );

    let normal = vec2();

    switch (distance) {
        case Math.abs(res.pos.x): normal = vec2(1, 0); break;
        case Math.abs(res.pos.x + res.width): normal = vec2(-1, 0); break;
        case Math.abs(res.pos.y): normal = vec2(0, 1); break;
        case Math.abs(res.pos.y + res.height): normal = vec2(0, -1); break;
    }

    return {
        normal,
        distance
    };
}
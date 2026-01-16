import { map, type Quad, vec2 } from "./math";
import type { Vec2 } from "./Vec2";

/**
 * Maps an UV quad onto a polygon
 * @param quad The UV quad in the texture
 * @param poly The polygon to project on
 * @returns The uv coordinates
 */
export function projectUV(quad: Quad, poly: Vec2[]) {
    const min = vec2(
        Math.min(...poly.map(v => v.x)),
        Math.min(...poly.map(v => v.y)),
    );
    const max = vec2(
        Math.max(...poly.map(v => v.x)),
        Math.max(...poly.map(v => v.y)),
    );

    return poly.map(v =>
        vec2(
            map(v.x, min.x, max.x, quad.x, quad.x + quad.w),
            map(v.y, min.y, max.y, quad.y, quad.y + quad.h),
        )
    );
}

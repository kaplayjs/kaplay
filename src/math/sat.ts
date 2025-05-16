import type { Shape } from "../types";
import { Polygon, vec2 } from "./math";
import { Vec2 } from "./Vec2";

export type SatResult = {
    normal: Vec2;
    distance: number;
};

export function satShapeIntersection(shape1: Shape, shape2: Shape) {
    const s1 = shape1 instanceof Polygon
        ? shape1
        : new Polygon(shape1.bbox().points());
    const s2 = shape2 instanceof Polygon
        ? shape2
        : new Polygon(shape2.bbox().points());
    return sat(s1, s2);
}

export function sat(p1: Polygon, p2: Polygon): SatResult | null {
    let overlap = Number.MAX_VALUE;
    let result: SatResult | null = null;
    for (const poly of [p1, p2]) {
        for (let i = 0; i < poly.pts.length; i++) {
            const a = poly.pts[i];
            const b = poly.pts[(i + 1) % poly.pts.length];
            const axisProj = b.sub(a).normal().unit();
            let min1 = Number.MAX_VALUE;
            let max1 = -Number.MAX_VALUE;
            for (let j = 0; j < p1.pts.length; j++) {
                const q = p1.pts[j].dot(axisProj);
                min1 = Math.min(min1, q);
                max1 = Math.max(max1, q);
            }
            let min2 = Number.MAX_VALUE;
            let max2 = -Number.MAX_VALUE;
            for (let j = 0; j < p2.pts.length; j++) {
                const q = p2.pts[j].dot(axisProj);
                min2 = Math.min(min2, q);
                max2 = Math.max(max2, q);
            }
            const o = Math.min(max1, max2) - Math.max(min1, min2);
            if (o < 0) { // This should be <= 0 !!!!
                return null;
            }
            if (o < Math.abs(overlap)) {
                const o1 = max2 - min1;
                const o2 = min2 - max1;
                overlap = Math.abs(o1) < Math.abs(o2) ? o1 : o2;
                if (!result) {
                    result = {
                        normal: overlap !== 0
                            ? axisProj.scale(Math.sign(overlap))
                            : axisProj.scale(Math.sign(min1 - max2)),
                        distance: Math.abs(overlap),
                    };
                }
                else {
                    const s = overlap !== 0
                        ? Math.sign(overlap)
                        : Math.sign(min1 - max2);
                    result.normal.x = s * axisProj.x;
                    result.normal.y = s * axisProj.y;
                    result.distance = Math.abs(overlap);
                }
            }
        }
    }
    return result;
}

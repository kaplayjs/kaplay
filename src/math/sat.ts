import { type Polygon, Vec2, vec2 } from "./math";

export type SatResult = {
    normal: Vec2;
    distance: number;
};

export function sat(p1: Polygon, p2: Polygon): SatResult | null {
    let overlap = Number.MAX_VALUE;
    let result: SatResult = { normal: vec2(0), distance: 0 };
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
            if (o < 0) {
                return null;
            }
            if (o < Math.abs(overlap)) {
                const o1 = max2 - min1;
                const o2 = min2 - max1;
                overlap = Math.abs(o1) < Math.abs(o2) ? o1 : o2;
                result.normal = axisProj;
                result.distance = overlap;
            }
        }
    }
    return result;
}

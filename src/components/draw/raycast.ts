import { getKaboomContext } from "../../kaboom";
import type { RaycastResult, Vec2 } from "../../math";

// this is not a component lol
export function raycast(origin: Vec2, direction: Vec2, exclude?: string[]) {
    const k = getKaboomContext(this);
    let minHit: RaycastResult;

    const shapes = k.get("area");

    shapes.forEach(s => {
        if (exclude && exclude.some(tag => s.is(tag))) return;
        const shape = s.worldArea();
        const hit = shape.raycast(origin, direction);
        if (hit) {
            if (minHit) {
                if (hit.fraction < minHit.fraction) {
                    minHit = hit;
                    minHit.object = s;
                }
            } else {
                minHit = hit;
                minHit.object = s;
            }
        }
    });
    return minHit;
}

import { clampAngle } from "./various";
import { Vec2 } from "./Vec2";

export function lerpAngle<V extends number | Vec2>(a: V, b: V, t: number): V {
    if (
        typeof a === "number"
        && typeof b === "number"
        && typeof t === "number"
    ) {
        return clampAngle(a + clampAngle(b - a) * t) as V;
    }
    else if (a instanceof Vec2 && b instanceof Vec2) {
        return a.slerp(b, t) as V;
    }

    throw new Error(
        `Bad value for lerpAngle(): ${a}, ${b}, ${t}. Only number or Vec2 is supported.`,
    );
}

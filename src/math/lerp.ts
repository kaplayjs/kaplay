import { Color } from "./color";
import { Vec2 } from "./Vec2";

/**
 * A valid value for lerp.
 *
 * @group Math
 */
export type LerpValue = number | Vec2 | Color;

export function lerp<V extends LerpValue>(
    a: V,
    b: V,
    t: number,
): V {
    if (typeof a === "number" && typeof b === "number") {
        // we don't call lerpNumber just for performance, but should be the same
        return a + (b - a) * t as V;
    }
    // check for Vec2
    else if (a instanceof Vec2 && b instanceof Vec2) {
        return a.lerp(b, t) as V;
    }
    else if (a instanceof Color && b instanceof Color) {
        return a.lerp(b, t) as V;
    }

    throw new Error(
        `Bad value for lerp(): ${a}, ${b}. Only number, Vec2 and Color is supported.`,
    );
}

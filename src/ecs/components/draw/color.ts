import { type Color, type ColorArgs, rgb } from "../../../math/color.js";
import type { Comp } from "../../../types.js";

/**
 * The {@link color `color()`} component.
 *
 * @group Component Types
 */
export interface ColorComp extends Comp {
    color: Color;
}

export function color(...args: ColorArgs): ColorComp {
    return {
        id: "color",
        color: rgb(...args),
        inspect() {
            return `color: ${this.color.toString()}`;
        },
    };
}

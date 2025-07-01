import { type Color, type ColorArgs, rgb, type RGBValue } from "../../../math/color";
import type { Comp } from "../../../types";

/**
 * The {@link color `color()`} component.
 *
 * @group Component Types
 */
export interface ColorComp extends Comp {
    color: Color;
    serialize(): { r: number, g: number, b: number }
}

export function color(...args: ColorArgs): ColorComp {
    return {
        id: "color",
        color: rgb(...args),
        inspect() {
            return `color: ${this.color.toString()}`;
        },
        serialize() {
            return { r: this.color.r, g: this.color.b, b: this.color.b }
        },
    };
}

export function colorFactory(data: ReturnType<ColorComp["serialize"]>) {
    return color(data.r, data.g, data.b);
}
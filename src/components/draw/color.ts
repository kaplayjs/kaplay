import { type Color, rgb } from "../../math";
import type { Comp } from "../../types";

/**
 * The {@link color `color()`} component.
 *
 * @group Component Types
 */
export interface ColorComp extends Comp {
    color: Color;
}

type ARGcase = [number, number, number];

type Colorcase = Color
type RBGcase = ARGcase
type STRcase = string
type NONEcase = void

type ColorArgs = [Colorcase | RBGcase | STRcase | NONEcase] | ARGcase;

export function color(...args: ColorArgs): ColorComp {
    return {
        id: "color",
        color: rgb(...args),
        inspect() {
            return `color: ${this.color.toString()}`;
        },
    };
}

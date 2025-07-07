import { Color, type ColorArgs, rgb, type RGBValue } from "../../../math/color";
import type { Comp } from "../../../types";

/**
 * The serialized {@link color `color()`} component.
 *
 * @group Component Serialization
 */
export interface SerializeColorComp {
    color: { r: number; g: number; b: number };
}

/**
 * The {@link color `color()`} component.
 *
 * @group Component Types
 */
export interface ColorComp extends Comp {
    color: Color;
    serialize(): SerializeColorComp;
}

export function color(...args: ColorArgs): ColorComp {
    return {
        id: "color",
        color: rgb(...args),
        inspect() {
            return `color: ${this.color.toString()}`;
        },
        serialize() {
            return {
                color: this.color.serialize(),
            };
        },
    };
}

export function colorFactory(data: any) {
    return color(Color.deserialize(data));
}

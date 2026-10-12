import type { Comp } from "../../../types";

/**
 * The serialized {@link fill `fill()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedFillComp {
    fill?: boolean;
}

/**
 * The {@link fill `fill()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface FillComp extends Comp {
    /**
     * If the obj is unaffected by camera
     */
    fill: boolean;

    serialize(): SerializedFillComp;
}

export function fill(fill = true): FillComp {
    return {
        id: "fill",
        fill: fill,
        serialize() {
            return { fill: this.fill };
        },
    };
}

export function fillFactory(data: SerializedFillComp) {
    return fill(data.fill);
}

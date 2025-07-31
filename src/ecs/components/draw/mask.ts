import type { Comp, Mask } from "../../../types";

/**
 * The serialized {@link mask `mask()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedMaskComp {
    mask: Mask;
}

/**
 * The {@link mask `mask()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface MaskComp extends Comp {
    mask: Mask;
    serialize(): SerializedMaskComp;
}

export function mask(m: Mask = "intersect"): MaskComp {
    return {
        id: "mask",
        mask: m,
        serialize() {
            return { mask: this.mask };
        },
    };
}

export function maskFactory(data: SerializedMaskComp) {
    return mask(data.mask);
}

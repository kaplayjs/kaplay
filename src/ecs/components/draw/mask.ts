import type { Comp, Mask } from "../../../types";

/**
 * The serialized {@link mask `mask()`} component.
 *
 * @group Component Serialization
 */
export interface SerializeMaskComp {
    mask: Mask;
}

/**
 * The {@link mask `mask()`} component.
 *
 * @group Component Types
 */
export interface MaskComp extends Comp {
    mask: Mask;
    serialize(): SerializeMaskComp;
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

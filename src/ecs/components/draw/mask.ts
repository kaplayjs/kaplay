import type { Comp, Mask } from "../../../types.js";

/**
 * The {@link mask `mask()`} component.
 *
 * @group Component Types
 */
export interface MaskComp extends Comp {
    mask: Mask;
}

export function mask(m: Mask = "intersect"): MaskComp {
    return {
        id: "mask",
        mask: m,
    };
}

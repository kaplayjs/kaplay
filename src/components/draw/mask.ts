import type { Comp, Mask } from "../../types";

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

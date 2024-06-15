import type { Mask, MaskComp } from "../../types";

export function mask(m: Mask = "intersect"): MaskComp {
    return {
        id: "mask",
        mask: m,
    };
}

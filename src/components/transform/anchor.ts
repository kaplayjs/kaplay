import type { Vec2 } from "../../math";
import type { Anchor, Comp } from "../../types";

/**
 * The {@link anchor `anchor()`} component.
 *
 * @group Component Types
 */
export interface AnchorComp extends Comp {
    /**
     * Anchor point for render.
     */
    anchor: Anchor | Vec2;
}

export function anchor(o: Anchor | Vec2): AnchorComp {
    if (!o) {
        throw new Error("Please define an anchor");
    }
    return {
        id: "anchor",
        anchor: o,
        inspect() {
            if (typeof this.anchor === "string") {
                return this.anchor;
            } else {
                return this.anchor.toString();
            }
        },
    };
}

import { AreaDirty } from "../../game";
import type { Vec2 } from "../../math/math";
import type { Anchor, Comp, GameObj } from "../../types";

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
    let _anchor = o;
    return {
        id: "anchor",

        get anchor() {
            return _anchor;
        },
        set anchor(value) {
            _anchor = value;
            (this as unknown as GameObj).dirtyFlags |= AreaDirty;
        },

        inspect() {
            if (typeof this.anchor === "string") {
                return `anchor: ` + this.anchor;
            }
            else {
                return `anchor: ` + this.anchor.toString();
            }
        },
    };
}

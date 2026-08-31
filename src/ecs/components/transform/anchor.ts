import { anchorPt } from "../../../gfx/anchor";
import { Vec2, type Vec2Like } from "../../../math/Vec2";
import type { Anchor, Comp } from "../../../types";

/**
 * The serialized {@link anchor `anchor()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedAnchorComp {
    anchor: Vec2Like;
}

/**
 * The {@link anchor `anchor()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface AnchorComp extends Comp {
    /**
     * Anchor point for render.
     */
    anchor: Anchor | Vec2;

    serialize(): SerializedAnchorComp;
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
                return `anchor: ` + this.anchor;
            }
            else {
                return `anchor: ` + this.anchor.toString();
            }
        },
        serialize() {
            return {
                anchor: this.anchor instanceof Vec2
                    ? this.anchor.serialize()
                    : anchorPt(this.anchor).serialize(),
            };
        },
    };
}

export function anchorFactory(data: SerializedAnchorComp) {
    return anchor(new Vec2(data.anchor.x, data.anchor.y));
}

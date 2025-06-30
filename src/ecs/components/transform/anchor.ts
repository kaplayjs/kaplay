import { vec2 } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import type { Anchor, Comp } from "../../../types";

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

    serialize(): any;
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
                    ? { x: this.anchor.x, y: this.anchor.y }
                    : this.anchor,
            };
        },
    };
}

export function anchorFactory(data: any) {
    return anchor(
        typeof data.anchor === "string"
            ? data.anchor
            : vec2(data.anchor.x, data.anchor.y),
    );
}

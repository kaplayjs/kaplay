import type { Vec2 } from "@/math";
import type { Anchor, AnchorComp } from "@/types";

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

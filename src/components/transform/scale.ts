import { getInternalContext, getKaboomContext } from "@/kaboom";
import { vec2 } from "@/math";
import type { ScaleComp, Vec2Args } from "@/types";

// TODO: allow single number assignment
export function scale(...args: Vec2Args): ScaleComp {
    const k = getKaboomContext(this);
    const internal = getInternalContext(k);

    if (args.length === 0) {
        return scale(1);
    }
    return {
        id: "scale",
        scale: vec2(...args),
        scaleTo(...args: Vec2Args) {
            this.scale = vec2(...args);
        },
        scaleBy(...args: Vec2Args) {
            this.scale.scale(vec2(...args));
        },
        inspect() {
            return `(${internal.toFixed(this.scale.x, 2)}, ${
                internal.toFixed(this.scale.y, 2)
            })`;
        },
    };
}

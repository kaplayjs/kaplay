import { getKaboomContext } from "../../kaboom";
import { type Vec2, vec2 } from "../../math";
import type { Comp, Vec2Args } from "../../types";

/**
 * The {@link scale `scale()`} component.
 *
 * @group Component Types
 */
export interface ScaleComp extends Comp {
    scale: Vec2;
    scaleTo(s: number): void;
    scaleTo(s: Vec2): void;
    scaleTo(sx: number, sy: number): void;
    scaleBy(s: number): void;
    scaleBy(s: Vec2): void;
    scaleBy(sx: number, sy: number): void;
}

// TODO: allow single number assignment
export function scale(...args: Vec2Args): ScaleComp {
    const k = getKaboomContext(this);
    const { toFixed } = k._k;

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
            return `(${toFixed(this.scale.x, 2)}, ${toFixed(this.scale.y, 2)})`;
        },
    };
}

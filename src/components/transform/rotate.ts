import { AllDirty, LocalTransformDirty } from "../../game/make";
import type { Comp, GameObj } from "../../types";

/**
 * The {@link rotate `rotate()`} component.
 *
 * @group Component Types
 */
export interface RotateComp extends Comp {
    /**
     * Angle in degrees.
     */
    angle: number;
    /**
     * Rotate in degrees.
     */
    rotateBy(angle: number): void;
    /**
     * Rotate to a degree (like directly assign to .angle)
     *
     * @since v3000.0
     */
    rotateTo(s: number): void;
}

export function rotate(r: number): RotateComp {
    let _angle: number = r ?? 0;
    return {
        id: "rotate",

        get angle() {
            return _angle;
        },
        set angle(value) {
            _angle = value;
            (this as unknown as GameObj).dirtyFlags = AllDirty;
        },

        rotateBy(angle: number) {
            this.angle += angle;
        },
        rotateTo(angle: number) {
            this.angle = angle;
        },
        inspect() {
            return `angle: ${Math.round(this.angle)}`;
        },
    };
}

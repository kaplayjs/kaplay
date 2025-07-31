import type { Comp } from "../../../types";

/**
 * The serialized {@link rotate `rotate()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedRotateComp {
    angle: number;
}

/**
 * The {@link rotate `rotate()`} component.
 *
 * @group Components
 * @subgroup Component Types
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

    serialize(): { angle: number };
}

export function rotate(a?: number): RotateComp {
    return {
        id: "rotate",
        angle: a ?? 0,
        rotateBy(angle: number) {
            this.angle += angle;
        },
        rotateTo(angle: number) {
            this.angle = angle;
        },
        inspect() {
            return `angle: ${Math.round(this.angle)}`;
        },
        serialize() {
            return { angle: this.angle };
        },
    };
}

export function rotateFactory(data: SerializedRotateComp) {
    return rotate(data.angle);
}

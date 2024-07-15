import type { Color } from "../../math/color";
import type { Vec2 } from "../../math/math";
import type { Anchor, RenderProps } from "../../types";
import { drawEllipse } from "./drawEllipse";

/**
 * How the circle should look like.
 */
export type DrawCircleOpt = Omit<RenderProps, "angle"> & {
    /**
     * Radius of the circle.
     */
    radius: number;
    /**
     * Starting angle.
     */
    start?: number;
    /**
     * Ending angle.
     */
    end?: number;
    /**
     * If fill the shape with color (set this to false if you only want an outline).
     */
    fill?: boolean;
    /**
     * Use gradient instead of solid color.
     *
     * @since v3000.0
     */
    gradient?: [Color, Color];
    /**
     * Multiplier for circle vertices resolution (default 1)
     */
    resolution?: number;
    /**
     * The anchor point, or the pivot point. Default to "topleft".
     */
    anchor?: Anchor | Vec2;
};

export function drawCircle(opt: DrawCircleOpt) {
    if (typeof opt.radius !== "number") {
        throw new Error("drawCircle() requires property \"radius\".");
    }

    if (opt.radius === 0) {
        return;
    }

    drawEllipse(Object.assign({}, opt, {
        radiusX: opt.radius,
        radiusY: opt.radius,
        angle: 0,
    }));
}

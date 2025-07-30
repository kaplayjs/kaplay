import type { Color } from "../../math/color";
import { getArcPts } from "../../math/various";
import { Vec2 } from "../../math/Vec2";
import type { Anchor, RenderProps } from "../../types";
import { anchorToVec2 } from "../anchor";
import { drawPolygon } from "./drawPolygon";

/**
 * How the ellipse should look like.
 *
 * @group Draw
 * @subgroup Types
 */
export type DrawEllipseOpt = RenderProps & {
    /**
     * The horizontal radius.
     */
    radiusX: number;
    /**
     * The vertical radius.
     */
    radiusY: number;
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

export function drawEllipse(opt: DrawEllipseOpt) {
    if (opt.radiusX === undefined || opt.radiusY === undefined) {
        throw new Error(
            "drawEllipse() requires properties \"radiusX\" and \"radiusY\".",
        );
    }

    if (opt.radiusX === 0 || opt.radiusY === 0) {
        return;
    }

    const start = opt.start ?? 0;
    const end = opt.end ?? 360;
    const offset = anchorToVec2(opt.anchor ?? "center").scale(
        new Vec2(-opt.radiusX, -opt.radiusY),
    );

    const pts = getArcPts(
        offset,
        opt.radiusX,
        opt.radiusY,
        start,
        end,
        opt.resolution,
    );

    // center
    pts.unshift(offset);

    const polyOpt = Object.assign({}, opt, {
        pts,
        radius: 0,
        ...(opt.gradient
            ? {
                colors: [
                    opt.gradient[0],
                    ...Array(pts.length - 1).fill(opt.gradient[1]),
                ],
            }
            : {}),
    });

    // full circle with outline shouldn't have the center point
    if (end - start >= 360 && opt.outline) {
        if (opt.fill !== false) {
            drawPolygon(Object.assign({}, polyOpt, {
                outline: null,
            }));
        }
        drawPolygon(Object.assign({}, polyOpt, {
            pts: pts.slice(1),
            fill: false,
        }));
        return;
    }

    drawPolygon(polyOpt);
}

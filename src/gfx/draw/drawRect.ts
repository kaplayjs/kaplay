import { DEF_ANCHOR } from "../../constants";
import type { Color } from "../../math/color";
import { Vec2, vec2 } from "../../math/math";
import { getArcPts } from "../../math/various";
import type { Anchor, RenderProps } from "../../types";
import { anchorPt } from "../anchor";
import { drawPolygon } from "./drawPolygon";

/**
 * How the rectangle should look like.
 */
export type DrawRectOpt = RenderProps & {
    /**
     * Width of the rectangle.
     */
    width: number;
    /**
     * Height of the rectangle.
     */
    height: number;
    /**
     * Use gradient instead of solid color.
     *
     * @since v3000.0
     */
    gradient?: [Color, Color];
    /**
     * If the gradient should be horizontal.
     *
     * @since v3000.0
     */
    horizontal?: boolean;
    /**
     * If fill the shape with color (set this to false if you only want an outline).
     */
    fill?: boolean;
    /**
     * The radius of each corner.
     */
    radius?: number | number[];
    /**
     * The anchor point, or the pivot point. Default to "topleft".
     */
    anchor?: Anchor | Vec2;
};

export function drawRect(opt: DrawRectOpt) {
    if (opt.width === undefined || opt.height === undefined) {
        throw new Error(
            "drawRect() requires property \"width\" and \"height\".",
        );
    }

    if (opt.width <= 0 || opt.height <= 0) {
        return;
    }

    const w = opt.width;
    const h = opt.height;
    const anchor = anchorPt(opt.anchor || DEF_ANCHOR).add(1, 1);
    const offset = anchor.scale(new Vec2(w, h).scale(-0.5));

    let pts = [
        new Vec2(0, 0),
        new Vec2(w, 0),
        new Vec2(w, h),
        new Vec2(0, h),
    ];

    // TODO: gradient for rounded rect
    // TODO: drawPolygon should handle generic rounded corners
    if (opt.radius) {
        // maximum radius is half the shortest side
        const maxRadius = Math.min(w, h) / 2;
        const r = Array.isArray(opt.radius)
            ? opt.radius.map(r => Math.min(maxRadius, r))
            : new Array(4).fill(Math.min(maxRadius, opt.radius));

        pts = [
            new Vec2(r[0], 0),
            ...(r[1]
                ? getArcPts(new Vec2(w - r[1], r[1]), r[1], r[1], 270, 360)
                : [vec2(w, 0)]),
            ...(r[2]
                ? getArcPts(new Vec2(w - r[2], h - r[2]), r[2], r[2], 0, 90)
                : [vec2(w, h)]),
            ...(r[3]
                ? getArcPts(new Vec2(r[3], h - r[3]), r[3], r[3], 90, 180)
                : [vec2(0, h)]),
            ...(r[0]
                ? getArcPts(new Vec2(r[0], r[0]), r[0], r[0], 180, 270)
                : []),
        ];
    }

    drawPolygon(Object.assign({}, opt, {
        offset,
        pts,
        ...(opt.gradient
            ? {
                colors: opt.horizontal
                    ? [
                        opt.gradient[0],
                        opt.gradient[1],
                        opt.gradient[1],
                        opt.gradient[0],
                    ]
                    : [
                        opt.gradient[0],
                        opt.gradient[0],
                        opt.gradient[1],
                        opt.gradient[1],
                    ],
            }
            : {}),
    }));
}

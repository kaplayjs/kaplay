import type { Vec2 } from "../../math/math";
import type { RenderProps } from "../../types";
import { drawPolygon } from "./drawPolygon";

/**
 * How the triangle should look like.
 */
export type DrawTriangleOpt = RenderProps & {
    /**
     * First point of triangle.
     */
    p1: Vec2;
    /**
     * Second point of triangle.
     */
    p2: Vec2;
    /**
     * Third point of triangle.
     */
    p3: Vec2;
    /**
     * If fill the shape with color (set this to false if you only want an outline).
     */
    fill?: boolean;
    /**
     * The radius of each corner.
     */
    radius?: number;
};

export function drawTriangle(opt: DrawTriangleOpt) {
    if (!opt.p1 || !opt.p2 || !opt.p3) {
        throw new Error(
            "drawTriangle() requires properties \"p1\", \"p2\" and \"p3\".",
        );
    }

    return drawPolygon(Object.assign({}, opt, {
        pts: [opt.p1, opt.p2, opt.p3],
    }));
}

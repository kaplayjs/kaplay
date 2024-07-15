import type { Vec2 } from "../../math/math";
import type { RenderProps } from "../../types";
import { drawLines } from "./drawLine";

export type DrawCurveOpt = RenderProps & {
    /**
     * The amount of line segments to draw.
     */
    segments?: number;
    /**
     * The width of the line.
     */
    width?: number;
};

export function drawCurve(curve: (t: number) => Vec2, opt: DrawCurveOpt) {
    const segments = opt.segments ?? 16;
    const p: Vec2[] = [];

    for (let i = 0; i <= segments; i++) {
        p.push(curve(i / segments));
    }

    drawLines({
        pts: p,
        width: opt.width || 1,
        pos: opt.pos,
        color: opt.color,
        opacity: opt.opacity,
    });
}

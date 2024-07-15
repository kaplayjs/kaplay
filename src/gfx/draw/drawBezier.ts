import { evaluateBezier, type Vec2 } from "../../math/math";
import { drawCurve, type DrawCurveOpt } from "./drawCurve";

export type DrawBezierOpt = DrawCurveOpt & {
    /**
     * The first point.
     */
    pt1: Vec2;
    /**
     * The the first control point.
     */
    pt2: Vec2;
    /**
     * The the second control point.
     */
    pt3: Vec2;
    /**
     * The second point.
     */
    pt4: Vec2;
};

export function drawBezier(opt: DrawBezierOpt) {
    drawCurve(
        t => evaluateBezier(opt.pt1, opt.pt2, opt.pt3, opt.pt4, t),
        opt,
    );
}

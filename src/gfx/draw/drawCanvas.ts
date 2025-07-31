import { vec2 } from "../../math/math";
import type { Canvas } from "../../types";
import { height } from "../stack";
import { drawUVQuad, type DrawUVQuadOpt } from "./drawUVQuad";

/**
 * @group Draw
 * @subgroup Types
 */
export type DrawCanvasOpt = DrawUVQuadOpt & {
    canvas: Canvas;
};

export function drawCanvas(opt: DrawCanvasOpt) {
    const fb = opt.canvas.fb;
    drawUVQuad(Object.assign({}, opt, {
        tex: fb.tex,
        width: opt.width || fb.width,
        height: opt.height || fb.height,
        pos: (opt.pos || vec2()).add(0, height()),
        scale: (opt.scale || vec2(1)).scale(1, -1),
    }));
}

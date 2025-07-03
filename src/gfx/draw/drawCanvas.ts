import { vec2 } from "../../math/math.js";
import type { Canvas, DrawUVQuadOpt, RenderProps } from "../../types.js";
import { height } from "../stack.js";
import { drawUVQuad } from "./drawUVQuad.js";

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

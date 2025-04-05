import type { Canvas, DrawUVQuadOpt, RenderProps } from "../../types";
import { drawUVQuad } from "./drawUVQuad";

export type DrawCanvasOpt = DrawUVQuadOpt & {
    canvas: Canvas;
};

export function drawCanvas(opt: DrawCanvasOpt) {
    const fb = opt.canvas.fb;
    drawUVQuad(Object.assign({}, opt, {
        tex: fb.tex,
        width: opt.width || fb.width,
        height: opt.height || fb.height,
    }));
}

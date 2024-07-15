import { gfx } from "../kaplay";
import { type ColorArgs, rgb } from "../math";

export function setBackground(...args: ColorArgs) {
    const color = rgb(...args);
    const alpha = args[3] ?? 1;

    gfx.bgColor = color;
    gfx.bgAlpha = alpha;

    gfx.ggl.gl.clearColor(
        color.r / 255,
        color.g / 255,
        color.b / 255,
        alpha,
    );
}

export function getBackground() {
    return gfx.bgColor?.clone?.() ?? null;
}

import { _k } from "../kaplay";
import { type ColorArgs, rgb } from "../math/color";

export function setBackground(...args: ColorArgs) {
    const color = rgb(...args);
    const alpha = args[3] ?? 1;

    _k.gfx.bgColor = color;
    _k.gfx.bgAlpha = alpha;

    _k.gfx.ggl.gl.clearColor(
        color.r / 255,
        color.g / 255,
        color.b / 255,
        alpha,
    );
}

export function getBackground() {
    return _k.gfx.bgColor?.clone?.() ?? null;
}

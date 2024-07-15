import type { Color } from "../../math/color";
import type { Quad, Vec2 } from "../../math/math";
import { anchorPt } from "../anchor";
import type { Texture } from "../gfx";
import {
    popTransform,
    pushRotate,
    pushTransform,
    pushTranslate,
} from "../stack";
import type { DrawTextOpt } from "./drawText";
import { drawUVQuad } from "./drawUVQuad";

/**
 * Formatted text with info on how and where to render each character.
 */
export type FormattedText = {
    width: number;
    height: number;
    chars: FormattedChar[];
    opt: DrawTextOpt;
};

/**
 * One formated character.
 */
export interface FormattedChar {
    ch: string;
    tex: Texture;
    width: number;
    height: number;
    quad: Quad;
    pos: Vec2;
    scale: Vec2;
    angle: number;
    color: Color;
    opacity: number;
}

export function drawFormattedText(ftext: FormattedText) {
    pushTransform();
    pushTranslate(ftext.opt.pos!);
    pushRotate(ftext.opt.angle!);
    pushTranslate(
        anchorPt(ftext.opt.anchor ?? "topleft").add(1, 1).scale(
            ftext.width,
            ftext.height,
        ).scale(-0.5),
    );

    ftext.chars.forEach((ch) => {
        drawUVQuad({
            tex: ch.tex,
            width: ch.width,
            height: ch.height,
            pos: ch.pos,
            scale: ch.scale,
            angle: ch.angle,
            color: ch.color,
            opacity: ch.opacity,
            quad: ch.quad,
            anchor: "center",
            uniform: ftext.opt.uniform,
            shader: ftext.opt.shader,
            fixed: ftext.opt.fixed,
        });
    });
    popTransform();
}

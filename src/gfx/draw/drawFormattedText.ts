import type { FontData } from "../../assets/font";
import type { Uniform } from "../../assets/shader";
import type { Color } from "../../math/color";
import type { Quad, Vec2 } from "../../math/math";
import { anchorPt } from "../anchor";
import type { Texture } from "../gfx";
import {
    multRotate,
    multTranslateV,
    popTransform,
    pushTransform,
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
    renderedText: string;
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
    font?: string | FontData;
    stretchInPlace: boolean;
    shader?: string;
    uniform?: Uniform;
}

export function drawFormattedText(ftext: FormattedText) {
    pushTransform();
    multTranslateV(ftext.opt.pos!);
    multRotate(ftext.opt.angle!);
    multTranslateV(
        anchorPt(ftext.opt.anchor ?? "topleft").add(1, 1).scale(
            ftext.width,
            ftext.height,
        ).scale(-0.5),
    );

    const charsByTexture = new Map<Texture, FormattedChar[]>();

    ftext.chars.forEach((ch) => {
        if (!charsByTexture.has(ch.tex)) charsByTexture.set(ch.tex, []);
        const chars = charsByTexture.get(ch.tex) ?? [];
        chars.push(ch);
    });

    const sortedChars = Array.from(charsByTexture.values()).flat();

    sortedChars.forEach((ch) => {
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
            uniform: ch.uniform ?? ftext.opt.uniform,
            shader: ch.shader ?? ftext.opt.shader,
            fixed: ftext.opt.fixed,
        });
    });

    popTransform();
}

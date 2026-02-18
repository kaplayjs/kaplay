import type { FontData } from "../../assets/font";
import type { Uniform } from "../../assets/shader";
import { Color } from "../../math/color";
import type { Vec2 } from "../../math/Vec2";
import { anchorPt } from "../anchor";
import type { Texture } from "../gfx";
import {
    multRotate,
    multTranslateV,
    popTransform,
    pushTransform,
} from "../stack";
import type { Frame } from "../TexPacker";
import type { DrawTextOpt } from "./drawText";
import { drawUVQuad } from "./drawUVQuad";

/**
 * Formatted text with info on how and where to render each character.
 *
 * @group Rendering
 * @subgroup Text
 */
export type FormattedText = {
    width: number;
    height: number;
    chars: FormattedChar[];
    opt: DrawTextOpt;
    renderedText: string;
};

/**
 * One formatted character.
 *
 * @group Rendering
 * @subgroup Text
 */
export interface FormattedChar {
    ch: string;
    frame: Frame;
    width: number;
    height: number;
    pos: Vec2;
    scale: Vec2;
    skew: Vec2;
    angle: number;
    color: Color;
    opacity: number;
    font?: string | FontData;
    stretchInPlace: boolean;
    shader?: string;
    uniform?: Uniform;
}

// cSpell: ignore ftext
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
        const chars = charsByTexture.get(ch.frame.tex) ?? [];
        chars.push(ch);
        charsByTexture.set(ch.frame.tex, chars);
    });

    const sortedChars = Array.from(charsByTexture.values()).flat();

    sortedChars.forEach((ch) => {
        drawUVQuad({
            tex: ch.frame.tex,
            quad: ch.frame.q,
            width: ch.width,
            height: ch.height,
            pos: ch.pos,
            scale: ch.scale,
            angle: ch.angle,
            color: ch.color,
            skew: ch.skew,
            opacity: ch.opacity,
            anchor: "center",
            uniform: ch.uniform ?? ftext.opt.uniform,
            shader: ch.shader ?? ftext.opt.shader,
            fixed: ftext.opt.fixed,
        });
    });

    popTransform();
}

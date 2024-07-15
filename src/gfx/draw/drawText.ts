import type { Asset, BitmapFontData } from "../../assets";
import type { FontData } from "../../assets/font";
import type { Color } from "../../math/color";
import type { Vec2 } from "../../math/math";
import type { Anchor, RenderProps } from "../../types";
import { formatText } from "../formatText";
import { drawFormattedText } from "./drawFormattedText";

/**
 * How the text should look like.
 *
 * @group Draw
 */
export type DrawTextOpt = RenderProps & {
    /**
     * The text to render.
     */
    text: string;
    /**
     * The name of font to use.
     */
    font?:
        | string
        | FontData
        | Asset<FontData>
        | BitmapFontData
        | Asset<BitmapFontData>;
    /**
     * The size of text (the height of each character).
     */
    size?: number;
    /**
     * Text alignment (default "left")
     *
     * @since v3000.0
     */
    align?: TextAlign;
    /**
     * The maximum width. Will wrap word around if exceed.
     */
    width?: number;
    /**
     * The gap between each line (only available for bitmap fonts).
     *
     * @since v2000.2
     */
    lineSpacing?: number;
    /**
     * The gap between each character (only available for bitmap fonts).
     *
     * @since v2000.2
     */
    letterSpacing?: number;
    /**
     * The anchor point, or the pivot point. Default to "topleft".
     */
    anchor?: Anchor | Vec2;
    /**
     * Transform the pos, scale, rotation or color for each character based on the index or char (only available for bitmap fonts).
     *
     * @since v2000.1
     */
    transform?: CharTransform | CharTransformFunc;
    /**
     * Stylesheet for styled chunks, in the syntax of "this is a [stylename]styled[/stylename] word" (only available for bitmap fonts).
     *
     * @since v2000.2
     */
    styles?: Record<string, CharTransform | CharTransformFunc>;
};

/**
 * A function that returns a character transform config. Useful if you're generating dynamic styles.
 */
export type CharTransformFunc = (idx: number, ch: string) => CharTransform;

/**
 * Describes how to transform each character.
 *
 * @group Options
 */
export interface CharTransform {
    pos?: Vec2;
    scale?: Vec2 | number;
    angle?: number;
    color?: Color;
    opacity?: number;
}

/**
 * How the text should be aligned.
 *
 * @group Draw
 */
export type TextAlign =
    | "center"
    | "left"
    | "right";

export function drawText(opt: DrawTextOpt) {
    drawFormattedText(formatText(opt));
}

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
    /**
     * Offset to apply to the position of the text character.
     * Shifts the character's position by the specified 2D vector.
     */
    pos?: Vec2;

    /**
     * Scale transformation to apply to the text character's current scale.
     * When a number, it is scaled uniformly.
     * Given a 2D vector, it is scaled independently along the X and Y axis.
     */
    scale?: Vec2 | number;

    /**
     * Increases the amount of degrees to rotate the text character.
     */
    angle?: number;

    /**
     * Color transformation applied to the text character.
     * Multiplies the current color with this color.
     */
    color?: Color;

    /**
     * Opacity multiplication applied to the text character.
     * For example, an opacity of 0.4 with 2 set in the transformation, the resulting opacity will be 0.8 (0.4 × 2).
     */
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

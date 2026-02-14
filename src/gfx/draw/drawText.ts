import type { Asset } from "../../assets/asset";
import type { BitmapFontData } from "../../assets/bitmapFont";
import type { FontData } from "../../assets/font";
import type { Uniform } from "../../assets/shader";
import type { Color } from "../../math/color";
import type { Vec2 } from "../../math/Vec2";
import type { Anchor, RenderProps } from "../../types";
import { formatText } from "../formatText";
import { drawFormattedText } from "./drawFormattedText";

/**
 * How the text should look like.
 *
 * @group Draw
 * @subgroup Types
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
    /**
     * If true, any (whitespace) indent on the first line of the paragraph
     * will be copied to all of the lines for those parts that text-wrap.
     */
    indentAll?: boolean;
    /**
     * Locale for text segmentation (e.g., 'hi' for Hindi, 'ar' for Arabic, 'bn' for Bengali).
     * Helps with proper grapheme cluster detection for complex scripts.
     * Only used when Intl.Segmenter is available in the browser.
     *
     * @since v4000.0
     */
    locale?: string;
};

/**
 * A function that returns a character transform config. Useful if you're generating dynamic styles.
 *
 * @group Rendering
 * @subgroup Text
 */
export type CharTransformFunc = (
    idx: number,
    ch: string,
    param: string,
) => CharTransform;

/**
 * Describes how to transform each character.
 *
 * @group Rendering
 * @subgroup Text
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
     * Skew transformation to skew each of the characters, in degrees of tilt.
     * When a number, it skews the text to the right as with italic text.
     * Given a 2D vector, it affects the skew of the horizontal and vertical sides.
     */
    skew?: Vec2 | number;

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

    /**
     * If true, the styles applied by this specific {@link DrawTextOpt.styles} entry transform
     * will override, rather than compose with, the default styles given in {@link DrawTextOpt.transform} and by other
     * components' styles.
     */
    override?: boolean;

    /**
     * If the font for this character should be different from the default font
     * or the one specified in {@link DrawTextOpt.font}.
     * Because the font can't be composed like the other properties,
     * this will override the font even if {@link CharTransform.override} is false.
     */
    font?: string | FontData;

    /**
     * If true, characters that have a X scale that is not 1 won't have the bounding box stretched to fit the character,
     * and may end up overlapping with adjacent characters.
     *
     * @default true
     */
    stretchInPlace?: boolean;

    /**
     * A name for a shader that will be applied to this character only.
     */
    shader?: string;

    /**
     * Values to use for the shader's uniform inputs.
     * If there is no shader set (by this character's transform or an entire-text
     * transform), this is not used.
     */
    uniform?: Uniform;
}

/**
 * How the text should be aligned.
 *
 * @group Rendering
 * @subgroup Text
 */
export type TextAlign =
    | "center"
    | "left"
    | "right";

export function drawText(opt: DrawTextOpt) {
    drawFormattedText(formatText(opt));
}

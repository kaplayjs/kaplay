import type { BitmapFontData } from "../../assets";
import { DEF_TEXT_SIZE } from "../../constants";
import { onLoad } from "../../game";
import { getRenderProps } from "../../game/utils";
import {
    type CharTransform,
    type CharTransformFunc,
    compileStyledText,
    drawFormattedText,
    formatText,
    type TextAlign,
} from "../../gfx";
import { k } from "../../kaplay";
import { Rect, vec2 } from "../../math/math";
import type { Comp, GameObj, KAPLAYCtx } from "../../types";

/**
 * The {@link text `text()`} component.
 *
 * @group Component Types
 */
export interface TextComp extends Comp {
    draw: Comp["draw"];
    /**
     * The text to render.
     */
    text: string;
    /**
     * The text after formatting.
     */
    renderedText: string;
    /**
     * The text size.
     */
    textSize: number;
    /**
     * The font to use.
     */
    font: string | BitmapFontData;
    /**
     * Width of text.
     */
    width: number;
    /**
     * Height of text.
     */
    height: number;
    /**
     * Text alignment ("left", "center" or "right", default "left").
     *
     * @since v3000.0
     */
    align: TextAlign;
    /**
     * The gap between each line.
     *
     * @since v2000.2
     */
    lineSpacing: number;
    /**
     * The gap between each character.
     *
     * @since v2000.2
     */
    letterSpacing: number;
    /**
     * Transform the pos, scale, rotation or color for each character based on the index or char.
     *
     * @since v2000.1
     */
    textTransform: CharTransform | CharTransformFunc;
    /**
     * Stylesheet for styled chunks, in the syntax of "this is a [style]text[/style] word".
     *
     * @since v2000.2
     */
    textStyles: Record<string, CharTransform | CharTransformFunc>;
    /**
     * @since v3000.0
     */
    renderArea(): Rect;
}

/**
 * Options for the {@link text `text()`} component.
 *
 * @group Component Types
 */
export interface TextCompOpt {
    /**
     * Height of text.
     */
    size?: number;
    /**
     * The font to use.
     */
    font?: string | BitmapFontData;
    /**
     * Wrap text to a certain width.
     */
    width?: number;
    /**
     * Text alignment ("left", "center" or "right", default "left").
     *
     * @since v3000.0
     */
    align?: TextAlign;
    /**
     * The gap between each line.
     *
     * @since v2000.2
     */
    lineSpacing?: number;
    /**
     * The gap between each character.
     *
     * @since v2000.2
     */
    letterSpacing?: number;
    /**
     * Transform the pos, scale, rotation or color for each character based on the index or char.
     *
     * @since v2000.1
     */
    transform?: CharTransform | CharTransformFunc;
    /**
     * Stylesheet for styled chunks, in the syntax of "this is a [style]text[/style] word".
     *
     * @since v2000.2
     */
    styles?: Record<string, CharTransform | CharTransformFunc>;
}

export function text(t: string, opt: TextCompOpt = {}): TextComp {
    function update(obj: GameObj<TextComp | any>) {
        const ftext = formatText(Object.assign(getRenderProps(obj), {
            text: obj.text + "",
            size: obj.textSize,
            font: obj.font,
            width: opt.width && obj.width,
            align: obj.align,
            letterSpacing: obj.letterSpacing,
            lineSpacing: obj.lineSpacing,
            // TODO: shouldn't run when object / ancestor is paused
            transform: obj.textTransform,
            styles: obj.textStyles,
        }));

        if (!opt.width) {
            obj.width = ftext.width / (obj.scale?.x || 1);
        }

        obj.height = ftext.height / (obj.scale?.y || 1);

        return ftext;
    }

    const obj = {
        id: "text",
        set text(nt) {
            t = nt;
            // @ts-ignore
            update(this);
            this.renderedText = compileStyledText(t).text;
        },
        get text() {
            return t;
        },
        textSize: opt.size ?? DEF_TEXT_SIZE,
        font: opt.font,
        width: opt.width ?? 0,
        height: 0,
        align: opt.align,
        lineSpacing: opt.lineSpacing,
        letterSpacing: opt.letterSpacing,
        textTransform: opt.transform,
        textStyles: opt.styles,
        renderedText: t ? compileStyledText(t).text : "",

        add(this: GameObj<TextComp>) {
            onLoad(() => update(this));
        },

        draw(this: GameObj<TextComp>) {
            drawFormattedText(update(this));
        },

        renderArea() {
            return new Rect(vec2(0), this.width, this.height);
        },
    };

    // @ts-ignore
    update(obj);

    // @ts-ignore Deep check in text related methods
    return obj;
}

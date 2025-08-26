import type { BitmapFontData } from "../../../assets/bitmapFont";
import { DEF_TEXT_SIZE } from "../../../constants/general";
import { onLoad } from "../../../events/globalEvents";
import { getRenderProps } from "../../../game/utils";
import {
    drawFormattedText,
    type FormattedText,
} from "../../../gfx/draw/drawFormattedText";
import type {
    CharTransform,
    CharTransformFunc,
    TextAlign,
} from "../../../gfx/draw/drawText";
import { formatText } from "../../../gfx/formatText";
import { Rect, vec2 } from "../../../math/math";
import type { Comp, GameObj } from "../../../types";

/**
 * The serialized {@link text `text()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedTextComp {
    text: string;
    size?: number;
    font?: string;
    width?: number;
    align?: TextAlign;
    lineSpacing?: number;
    letterSpacing?: number;
    indentAll?: boolean;
}

/**
 * The {@link text `text()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface TextComp extends Comp {
    draw: Comp["draw"];
    /**
     * The text to render.
     */
    text: string;
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
    /**
     * The text data object after formatting, that contains the
     * renering info as well as the parse data of the formatting tags.
     */
    formattedText(): FormattedText;

    serialize(): SerializedTextComp;
}

/**
 * Options for the {@link text `text()`} component.
 *
 * @group Components
 * @subgroup Component Types
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
    /**
     * If true, any (whitespace) indent on the first line of the paragraph
     * will be copied to all of the lines for those parts that text-wrap.
     */
    indentAll?: boolean;
}

export function text(t: string, opt: TextCompOpt = {}): TextComp {
    let theFormattedText: FormattedText;
    function update(obj: GameObj<TextComp | any>) {
        theFormattedText = formatText(Object.assign(getRenderProps(obj), {
            text: obj.text + "",
            size: obj.textSize,
            font: obj.font,
            width: opt.width && obj.width,
            align: obj.align,
            letterSpacing: obj.letterSpacing,
            lineSpacing: obj.lineSpacing,
            transform: obj.textTransform,
            styles: obj.textStyles,
            indentAll: opt.indentAll,
        }));

        if (!opt.width) {
            obj.width = theFormattedText.width / (obj.scale?.x || 1);
        }

        obj.height = theFormattedText.height / (obj.scale?.y || 1);
    }

    let _shape: Rect | undefined;
    let _width = opt.width ?? 0;
    let _height = 0;

    const obj: TextComp = {
        id: "text",
        set text(nt) {
            t = nt;
            // @ts-expect-error
            update(this);
        },
        get text() {
            return t;
        },
        textSize: opt.size ?? DEF_TEXT_SIZE,
        font: opt.font!,
        get width() {
            return _width;
        },
        set width(value) {
            _width = value;
            if (_shape) _shape.width = value;
        },
        get height() {
            return _height;
        },
        set height(value) {
            _height = value;
            if (_shape) _shape.height = value;
        },
        align: opt.align!,
        lineSpacing: opt.lineSpacing!,
        letterSpacing: opt.letterSpacing!,
        textTransform: opt.transform!,
        textStyles: opt.styles!,

        formattedText(this: GameObj<TextComp>) {
            return theFormattedText;
        },

        add(this: GameObj<TextComp>) {
            onLoad(() => update(this));
        },

        draw(this: GameObj<TextComp>) {
            drawFormattedText(theFormattedText);
        },

        update(this: GameObj<TextComp>) {
            update(this);
        },

        renderArea() {
            if (!_shape) {
                _shape = new Rect(vec2(0), _width, _height);
            }
            return _shape;
        },

        serialize() {
            return {
                text: this.text,
                size: this.textSize,
                font: typeof this.font === "string" ? this.font : undefined,
                width: this.width,
                align: this.align,
                lineSpacing: this.lineSpacing,
                letterSpacing: this.letterSpacing,
                indentAll: opt.indentAll,
            };
        },
    };

    // @ts-expect-error
    update(obj);

    // @ts-ignore Deep check in text related methods
    return obj;
}

export function textFactory(data: SerializedTextComp) {
    return text(data.text, {
        align: data.align,
        font: data.font,
        width: data.width,
        size: data.size,
        indentAll: data.indentAll,
        letterSpacing: data.letterSpacing,
        lineSpacing: data.letterSpacing,
    });
}

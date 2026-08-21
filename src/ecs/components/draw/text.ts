import type { BitmapFontData } from "../../../assets/bitmapFont";
import { DEF_TEXT_SIZE } from "../../../constants/general";
import { defineReactiveProps, getRenderProps } from "../../../game/utils";
import { anchorPt } from "../../../gfx/anchor";
import {
    drawFormattedText,
    type FormattedChar,
    type FormattedText,
} from "../../../gfx/draw/drawFormattedText";
import {
    beginPicture,
    drawPicture,
    endPicture,
    Picture,
} from "../../../gfx/draw/drawPicture";
import { drawRect } from "../../../gfx/draw/drawRect";
import type {
    CharTransform,
    CharTransformFunc,
    DrawTextOpt,
    TextAlign,
} from "../../../gfx/draw/drawText";
import { formatText, transformFormattedText } from "../../../gfx/formatText";
import { Color } from "../../../math/color";
import { Rect, testRectPoint, vec2 } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp, GameObj, RenderProps } from "../../../types";
import { nextRenderAreaVersion } from "../physics/area";

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
     * Stylesheet for styled chunks, using BBCode syntax "this is some [style]different formatting[/style] text".
     *
     * @since v2000.2
     */
    textStyles: Record<string, CharTransform | CharTransformFunc>;
    /**
     * @since v3000.0
     */
    renderArea(): Rect;
    _renderAreaVersion: number;
    /**
     * The text data object after formatting, that contains the
     * rendering info as well as the parse data of the formatting tags.
     */
    formattedText(): FormattedText;

    serialize(): SerializedTextComp;

    /**
     * Given a point (in local coordinates), returns the formatted character
     * data of the rendered character that the point is over, or null if none
     * are touched.
     * You can access the character (string) itself using `obj.pointToChar(...)?.ch`.
     */
    pointToChar(point: Vec2): FormattedChar | null;

    /**
     * Given a point (in local coordinates), returns the index of the rendered
     * character that the point is over, or -1 if none are touched.
     * You can also access the character data manually, e.g. `obj.formattedText().chars[index]?.styles`.
     */
    pointToCharIndex(point: Vec2): number;
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
    let objRef: GameObj<TextComp | any> | null = null;
    let theFormattedText: FormattedText;

    let _shape: Rect | undefined;
    let _width = opt.width ?? 0;
    let _height = 0;
    let _isDynamic = false;
    let _inspectChars = true;
    let _inspectCharRects: Picture | null;

    // obj props that are checked on update and trigger transform or reformat
    let _renderProps:
        | RenderProps & Record<"anchor", DrawTextOpt["anchor"]>
        | null = null;

    // props that call update with reformat once on set
    const _props = {
        textSize: opt.size ?? DEF_TEXT_SIZE,
        font: opt.font!,
        align: opt.align!,
        lineSpacing: opt.lineSpacing!,
        letterSpacing: opt.letterSpacing!,
    };

    // dynamic props that update with transform instead, reformat only if _renderProps changed
    const _proxiedProps = {
        textStyles: proxifyProp(opt.styles!),
        textTransform: proxifyProp(opt.transform!),
    };

    function update(obj: GameObj<TextComp | any>, reformat?: boolean) {
        const updateType = refreshRenderProps(obj);
        if (!reformat) {
            if (!_isDynamic && !updateType) return;
            reformat = updateType === 2;
        }

        const fOpt = {
            ..._renderProps,
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
        };

        theFormattedText = reformat
            ? formatText(fOpt)
            : transformFormattedText(theFormattedText, fOpt, _isDynamic);

        if (!opt.width) obj.width = theFormattedText.width;
        obj.height = theFormattedText.height;

        if (_k.debug.inspect && _inspectChars) updateCharInspect();
    }

    function refreshRenderProps(obj: GameObj<TextComp | any>): 0 | 1 | 2 {
        if (!_renderProps) {
            _renderProps = getRenderProps(obj);
            return 2;
        }

        const reformat = obj.anchor !== _renderProps.anchor;

        const transform = obj.color !== _renderProps.color
            || obj.opacity !== _renderProps.opacity
            || obj.shader !== _renderProps.shader
            || obj.uniform !== _renderProps.uniform;

        if (!reformat && !transform) return 0;

        _renderProps = getRenderProps(obj);

        return reformat ? 2 : 1;
    }

    function updateDynamic() {
        const prev = _isDynamic;
        _isDynamic = Object.values(_proxiedProps).some(value => (
            typeof value === "function"
            || (
                value
                && typeof value === "object"
                && Object.values(value).some(v => typeof v === "function")
            )
        ));

        if (prev && !_isDynamic && objRef) update(objRef, true);
    }

    function proxifyProp(value: Object | Function) {
        return value && typeof value === "object"
            ? new Proxy(value, {
                set(target, key, val) {
                    Reflect.set(target, key, val);
                    updateDynamic();
                    return true;
                },
            })
            : value;
    }

    function anchorPoint() {
        return anchorPt(theFormattedText.opt.anchor ?? "topleft").add(1, 1)
            .scale(theFormattedText.width, theFormattedText.height).scale(-0.5);
    }

    function updateCharInspect() {
        beginPicture(_inspectCharRects ?? new Picture());
        const p = anchorPoint();
        const gray = new Color(142, 142, 142);
        for (const fc of theFormattedText.chars) {
            const hsl = fc.color.lerp(gray, 0.25).toHSL();
            drawRect({
                pos: fc.pos.add(p),
                width: fc.width * fc.scale.x,
                height: fc.height * fc.scale.y,
                fill: false,
                anchor: "center",
                outline: {
                    color: Color.fromHSL(hsl[0], hsl[1], 0.75),
                    opacity: 0.5,
                    width: 2,
                    join: "miter",
                },
            });
        }
        _inspectCharRects = endPicture();
    }

    const tempRectForPointTest = new Rect(vec2(), 0, 0);

    const obj = {
        id: "text",
        set text(nt) {
            if (t === nt) return;
            t = nt;
            update(this as any as GameObj<TextComp>, true);
        },
        get text() {
            return t;
        },
        get width() {
            return _width;
        },
        set width(value) {
            if (_width === value) return;
            _width = value;
            if (_shape) _shape.width = value;
            this._renderAreaVersion = nextRenderAreaVersion();
            update(this as any as GameObj<TextComp>, true);
        },
        get height() {
            return _height;
        },
        set height(value) {
            if (_height === value) return;
            _height = value;
            if (_shape) _shape.height = value;
            this._renderAreaVersion = nextRenderAreaVersion();
            update(this as any as GameObj<TextComp>, true);
        },

        formattedText(this: GameObj<TextComp>) {
            return theFormattedText;
        },

        add(this: GameObj<TextComp | any>) {
            objRef = this;
            updateDynamic();
        },

        update(this: GameObj<TextComp>) {
            update(this);
        },

        draw(this: GameObj<TextComp>) {
            drawFormattedText(theFormattedText);
        },

        drawInspect(this: GameObj<TextComp>) {
            if (!_inspectChars) return;
            if (_inspectCharRects) {
                drawPicture(_inspectCharRects, {});
            }
            else {
                _k.game.root.nextFrame(updateCharInspect);
            }
        },

        pointToCharIndex(this: GameObj<TextComp>, point) {
            const offset = anchorPoint();
            if (!testRectPoint(this.renderArea(), point.sub(offset))) return -1;
            const chars = theFormattedText.chars;
            let minDist = Infinity;
            let minIndex = -1;
            for (let i = 0; i < chars.length; i++) {
                const fc = chars[i];
                const w = fc.width * fc.scale.x;
                const h = fc.height * fc.scale.y;
                Vec2.copy(fc.pos, tempRectForPointTest.pos);
                Vec2.add(
                    tempRectForPointTest.pos,
                    offset,
                    tempRectForPointTest.pos,
                );
                Vec2.addc(
                    tempRectForPointTest.pos,
                    -w / 2,
                    -h / 2,
                    tempRectForPointTest.pos,
                );
                tempRectForPointTest.width = w;
                tempRectForPointTest.height = h;
                if (testRectPoint(tempRectForPointTest, point)) {
                    const dist = Vec2.dist(point, fc.pos);
                    if (dist < minDist) {
                        minDist = dist;
                        minIndex = i;
                    }
                }
            }
            return minIndex;
        },

        pointToChar(this: GameObj<TextComp>, point) {
            return theFormattedText.chars[this.pointToCharIndex(point)] ?? null;
        },

        renderArea() {
            if (!_shape) {
                _shape = new Rect(vec2(0), _width, _height);
                this._renderAreaVersion = nextRenderAreaVersion();
            }
            return _shape;
        },

        _renderAreaVersion: 0,

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
    } as TextComp;

    // define _props as obj props that call update once with reformat
    defineReactiveProps(obj, _props, {
        set(prop, value) {
            _props[prop] = value;
            update(this as any as GameObj<TextComp>, true);
        },
    });

    // define _proxiedProps as obj props that update with transform only if dynamic
    defineReactiveProps(obj, _proxiedProps, {
        set(prop, value) {
            _proxiedProps[prop] = proxifyProp(value);
            updateDynamic();
        },
    });

    _k.k.onLoad(() => {
        // @ts-expect-error
        update(obj, true);
        _inspectChars = opt.transform !== undefined
            || opt.styles !== undefined
            || theFormattedText.chars.some(fc => fc.styles.length);
        return _k.k.cancel();
    });

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

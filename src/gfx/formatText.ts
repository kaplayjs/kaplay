import { Asset } from "../assets/asset";
import type { BitmapFontData, GfxFont } from "../assets/bitmapFont";
import { FontData, resolveFont } from "../assets/font";
import {
    DEF_FONT_FILTER,
    DEF_TEXT_CACHE_SIZE,
    FONT_ATLAS_HEIGHT,
    FONT_ATLAS_WIDTH,
} from "../constants/general";
import { Color } from "../math/color";
import { Quad, vec2 } from "../math/math";
import { Vec2 } from "../math/Vec2";
import { _k } from "../shared";
import type { Outline, TexFilter } from "../types";
import { runes } from "../utils/runes";
import { alignPt } from "./anchor";
import type { FormattedChar, FormattedText } from "./draw/drawFormattedText";
import type { CharTransform, DrawTextOpt } from "./draw/drawText";
import { Texture } from "./gfx";

/**
 * @group Rendering
 * @subgroup Text
 */
export type FontAtlas = {
    font: BitmapFontData;
    cursor: Vec2;
    maxHeight: number;
    maxActualBoundingBoxAscent: number;
    outline: Outline | null;
};

/**
 * @group Rendering
 * @subgroup Text
 */
export type StyledTextInfo = {
    charStyleMap: Record<number, [string, string][]>;
    text: string;
};

function applyCharTransform(fchar: FormattedChar, tr: CharTransform) {
    if (tr.font) fchar.font = tr.font;
    if (tr.stretchInPlace !== undefined) {
        fchar.stretchInPlace = tr.stretchInPlace;
    }
    if (tr.shader !== undefined) fchar.shader = tr.shader;
    if (tr.uniform !== undefined) fchar.uniform = tr.uniform;
    if (typeof tr.skew === "number") tr.skew = vec2(-tr.skew, 0);
    if (tr.override) {
        Object.assign(fchar, tr);
        return;
    }
    if (tr.pos) fchar.pos = fchar.pos.add(tr.pos);
    if (tr.scale) fchar.scale = fchar.scale.scale(vec2(tr.scale));
    if (tr.skew) fchar.skew = fchar.skew.add(vec2(tr.skew));
    if (tr.angle) fchar.angle += tr.angle;
    if (tr.color && fchar.ch.length === 1) {
        fchar.color = fchar.color.mult(tr.color);
    }
    // attention to type coercion, 0 is a valid value, only null & undefined are not
    if (tr.opacity != null) fchar.opacity *= tr.opacity;
}

export function compileStyledText(txt: any): StyledTextInfo {
    const charStyleMap = {} as Record<number, [string, string][]>;
    let renderText = "";
    let styleStack: [string, string][] = [];
    let text = String(txt);

    const emit = (ch: string) => {
        if (styleStack.length > 0) {
            charStyleMap[renderText.length] = styleStack.slice();
        }
        renderText += ch;
    };

    while (text !== "") {
        if (text[0] === "\\") {
            if (text.length === 1) {
                throw new Error("Styled text error: \\ at end of string");
            }
            emit(text[1]);
            text = text.slice(2);
            continue;
        }
        if (text[0] === "[") {
            const execResult = /^\[(\/)?(\w+?)(?:=(.+?))?\]/.exec(text);
            if (!execResult) {
                // xxx: should throw an error here?
                emit(text[0]);
                text = text.slice(1);
                continue;
            }
            const [m, endSlash, theTagName, tagParam] = execResult;
            if (endSlash !== undefined) {
                if (tagParam) {
                    throw new Error(
                        `Styled text error: cannot use param in close tag [/${theTagName}]`,
                    );
                }
                if (styleStack.length === 0) {
                    throw new Error(
                        `Styled text error: stray end tag [/${theTagName}]`,
                    );
                }
                const [expectedTagName, arg] = styleStack.pop()!;
                if (expectedTagName !== theTagName) {
                    throw new Error(
                        `Styled text error: mismatched tags. Expected [/${expectedTagName}], got [/${theTagName}]`,
                    );
                }
            }
            else styleStack.push([theTagName, tagParam]);
            text = text.slice(m.length);
            continue;
        }
        emit(text[0]);
        text = text.slice(1);
    }

    if (styleStack.length > 0) {
        throw new Error(
            `Styled text error: unclosed tags ${styleStack.join(", ")}`,
        );
    }

    return {
        charStyleMap,
        text: renderText,
    };
}

function getFontName(font: FontData | string): string {
    return font instanceof FontData
        ? font.fontface.family
        : font;
}

function getFontAtlasForFont(font: FontData | string): FontAtlas {
    const fontName = getFontName(font);
    let atlas = _k.gfx.fontAtlases[fontName];
    if (!atlas) {
        // create a new atlas
        const opts: {
            outline: Outline | null;
            filter: TexFilter;
        } = font instanceof FontData
            ? {
                outline: font.outline,
                filter: font.filter,
            }
            : {
                outline: null,
                filter: DEF_FONT_FILTER,
            };

        // TODO: customizable font tex filter
        atlas = {
            font: {
                tex: new Texture(
                    _k.gfx.ggl,
                    FONT_ATLAS_WIDTH,
                    FONT_ATLAS_HEIGHT,
                    {
                        filter: opts.filter,
                    },
                ),
                map: {},
                size: DEF_TEXT_CACHE_SIZE,
            },
            cursor: new Vec2(0),
            maxHeight: 0,
            maxActualBoundingBoxAscent: 0,
            outline: opts.outline,
        };

        _k.gfx.fontAtlases[fontName] = atlas;
    }
    return atlas;
}

const allChars = () => {
    const renderableChars: string[] = [];
    for (let i = 32; i <= 128; i++) { // Common Unicode range
        renderableChars.push(String.fromCharCode(i));
    }
    return renderableChars.join("");
};

function updateFontAtlas(font: FontData | string, ch: string) {
    const atlas = getFontAtlasForFont(font);
    const fontName = getFontName(font);
    if (!atlas.font.map[ch]) {
        // TODO: use assets.packer to pack font texture
        const c2d = _k.fontCacheC2d;
        if (!c2d) throw new Error("fontCacheC2d is not defined.");

        if (!_k.fontCacheCanvas) {
            throw new Error("fontCacheCanvas is not defined.");
        }

        c2d.clearRect(
            0,
            0,
            _k.fontCacheCanvas.width,
            _k.fontCacheCanvas.height,
        );

        c2d.font = `${atlas.font.size}px ${fontName}`;
        c2d.textBaseline = "top";
        c2d.textAlign = "left";
        c2d.fillStyle = "#fff";

        if (atlas.maxActualBoundingBoxAscent === 0) {
            atlas.maxActualBoundingBoxAscent =
                c2d.measureText(allChars()).actualBoundingBoxAscent;
        }
        const maxActualBoundingBoxAscent = atlas.maxActualBoundingBoxAscent;
        const m = c2d.measureText(ch);
        let w = Math.ceil(m.width);
        if (!w) return;
        let h = maxActualBoundingBoxAscent
                + Math.ceil(Math.abs(m.actualBoundingBoxAscent))
                + Math.ceil(Math.abs(m.actualBoundingBoxDescent))
            || atlas.font.size;

        // TODO: Test if this works with the verification of width and color
        if (
            atlas.outline && atlas.outline.width
            && atlas.outline.color
        ) {
            c2d.lineJoin = "round";
            c2d.lineWidth = atlas.outline.width * 2;
            c2d.strokeStyle = atlas.outline.color.toHex();
            c2d.strokeText(
                ch,
                atlas.outline.width,
                atlas.outline.width,
            );

            w += atlas.outline.width * 2;
            h += atlas.outline.width * 3;
        }

        c2d.fillText(
            ch,
            atlas.outline?.width ?? 0,
            (atlas.outline?.width ?? 0) + maxActualBoundingBoxAscent,
        );

        const img = c2d.getImageData(
            0,
            0,
            w,
            h,
        );

        // if we are about to exceed the X axis of the texture, go to another line
        if (atlas.cursor.x + w > FONT_ATLAS_WIDTH) {
            atlas.cursor.x = 0;
            atlas.cursor.y += atlas.maxHeight;
            atlas.maxHeight = 0;
            if (atlas.cursor.y > FONT_ATLAS_HEIGHT) {
                // TODO: create another atlas
                throw new Error(
                    "Font atlas exceeds character limit",
                );
            }
        }

        atlas.font.tex.update(img, atlas.cursor.x, atlas.cursor.y);

        atlas.font.map[ch] = new Quad(
            atlas.cursor.x,
            atlas.cursor.y,
            w,
            h + maxActualBoundingBoxAscent,
        );

        atlas.cursor.x += w + 1;
        atlas.maxHeight = Math.max(atlas.maxHeight, h);
    }
}

export function formatText(opt: DrawTextOpt): FormattedText {
    if (opt.text === undefined) {
        throw new Error("formatText() requires property \"text\".");
    }

    let font = resolveFont(opt.font);

    // if it's still loading
    if (!opt.text || opt.text === "" || font instanceof Asset || !font) {
        return {
            width: 0,
            height: 0,
            chars: [],
            opt: opt,
            renderedText: "",
        };
    }

    const { charStyleMap, text } = compileStyledText(opt.text + "");
    const chars = runes(text, opt.locale);

    let defGfxFont = (font instanceof FontData || typeof font === "string")
        ? getFontAtlasForFont(font).font
        : font;

    const size = opt.size || defGfxFont.size;
    const scale = vec2(opt.scale ?? 1).scale(size / defGfxFont.size);
    const lineSpacing = opt.lineSpacing ?? 0;
    const letterSpacing = opt.letterSpacing ?? 0;
    let curX: number = 0;
    let tw = 0;
    const lines: Array<{
        width: number;
        chars: { ch: FormattedChar; font: GfxFont }[];
    }> = [];
    let curLine: typeof lines[number]["chars"] = [];
    let cursor = 0;
    let lastSpace: number | null = null;
    let lastSpaceWidth: number = 0;
    let paraIndentX: number | undefined = undefined;

    // TODO: word break
    while (cursor < chars.length) {
        let ch = chars[cursor];

        // always new line on '\n'
        if (ch === "\n") {
            lines.push({
                width: curX - letterSpacing,
                chars: curLine,
            });

            lastSpace = null;
            lastSpaceWidth = 0;
            curX = 0;
            curLine = [];
            paraIndentX = undefined;
        }
        else {
            const defaultFontValue =
                (font instanceof FontData || typeof font === "string")
                    ? font
                    : undefined;
            type PartialBy<T, K extends keyof T> =
                & Omit<T, K>
                & Partial<Pick<T, K>>;
            const theFChar: PartialBy<
                FormattedChar,
                "width" | "height" | "quad"
            > = {
                tex: defGfxFont.tex,
                ch: ch,
                pos: vec2(curX, 0),
                opacity: opt.opacity ?? 1,
                color: opt.color ?? Color.WHITE,
                scale: vec2(scale),
                skew: vec2(0),
                angle: 0,
                font: defaultFontValue,
                stretchInPlace: true,
            };

            if (opt.transform) {
                const tr = typeof opt.transform === "function"
                    ? opt.transform(cursor, ch, "")
                    : opt.transform;
                if (tr) {
                    applyCharTransform(theFChar as any, tr);
                }
            }

            if (charStyleMap[cursor]) {
                const styles = charStyleMap[cursor];
                for (const [name, param] of styles) {
                    const style = opt.styles?.[name];
                    const tr = typeof style === "function"
                        ? style(cursor, ch, param)
                        : style;

                    if (tr) {
                        applyCharTransform(theFChar as any, tr);
                    }
                }
            }

            const requestedFont = theFChar.font;
            const resolvedFont = resolveFont(requestedFont);
            if (resolvedFont instanceof Asset || !resolvedFont) {
                // abort, not all fonts have loaded yet
                return {
                    width: 0,
                    height: 0,
                    chars: [],
                    opt: opt,
                    renderedText: "",
                };
            }
            var requestedFontData = defGfxFont;
            if (requestedFont && requestedFont !== defaultFontValue) {
                if (
                    resolvedFont instanceof FontData
                    || typeof resolvedFont === "string"
                ) {
                    requestedFontData = getFontAtlasForFont(requestedFont).font;
                }
                else requestedFontData = resolvedFont;
                theFChar.tex = requestedFontData.tex;
            }
            if (
                requestedFont
                && (resolvedFont instanceof FontData
                    || typeof resolvedFont === "string")
            ) updateFontAtlas(requestedFont, ch);

            let q = requestedFontData.map[ch];

            // TODO: leave space if character not found?
            if (q) {
                let gw = q.w
                    * (theFChar.stretchInPlace
                        ? scale
                        : theFChar.scale).x;

                if (opt.width && curX + gw > opt.width && curX > 0) {
                    // new line on last word if width exceeds
                    if (lastSpace != null) {
                        cursor -= curLine.length - lastSpace;
                        // omit trailing space
                        curLine = curLine.slice(0, lastSpace - 1);
                        curX = lastSpaceWidth;
                    }
                    lastSpace = null;
                    lastSpaceWidth = 0;

                    lines.push({
                        width: curX - letterSpacing,
                        chars: curLine,
                    });

                    curX = paraIndentX ?? 0;
                    curLine = [];
                    continue;
                }

                theFChar.width = q.w;
                theFChar.height = q.h;
                theFChar.quad = new Quad(
                    q.x / requestedFontData.tex.width,
                    q.y / requestedFontData.tex.height,
                    q.w / requestedFontData.tex.width,
                    q.h / requestedFontData.tex.height,
                );

                theFChar.pos = theFChar.pos.add(
                    gw * 0.5,
                    q.h * theFChar.scale.y * 0.5,
                );

                // push char
                curLine.push({
                    ch: theFChar as FormattedChar,
                    font: requestedFontData,
                });

                if (ch === " ") {
                    lastSpace = curLine.length;
                    lastSpaceWidth = curX;
                }
                if (
                    opt.indentAll
                    && paraIndentX === undefined
                    && /\S/.test(ch)
                ) {
                    paraIndentX = curX;
                }

                curX += gw;
                tw = Math.max(tw, curX);
                curX += letterSpacing;
            }
        }

        cursor++;
    }

    lines.push({
        width: curX - letterSpacing,
        chars: curLine,
    });

    if (opt.width) {
        tw = opt.width;
    }

    const formattedChars: FormattedChar[] = [];

    let th = 0;

    for (let i = 0; i < lines.length; i++) {
        if (i > 0) th += lineSpacing;
        const ox = (tw - lines[i].width) * alignPt(opt.align ?? "left");
        var thisLineHeight = size;
        for (const { ch } of lines[i].chars) {
            ch.pos = ch.pos.add(ox, th);
            formattedChars.push(ch);
            thisLineHeight = Math.max(
                thisLineHeight,
                size * (ch.stretchInPlace ? scale : ch.scale).y / scale.y,
            );
        }
        th += thisLineHeight;
    }

    return {
        width: tw,
        height: th,
        chars: formattedChars,
        opt,
        renderedText: text,
    };
}

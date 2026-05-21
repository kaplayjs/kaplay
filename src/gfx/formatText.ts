import { Asset } from "../assets/asset";
import type { BitmapFontData, GfxFont } from "../assets/bitmapFont";
import { FontData, resolveFont } from "../assets/font";
import { DEF_TEXT_CACHE_SIZE } from "../constants/general";
import { Color, rgb } from "../math/color";
import { vec2 } from "../math/math";
import { _k } from "../shared";
import type { Outline } from "../types";
import { runes } from "../utils/runes";
import { alignPt } from "./anchor";
import type { FormattedChar, FormattedText } from "./draw/drawFormattedText";
import type { CharTransform, DrawTextOpt } from "./draw/drawText";

/**
 * @group Rendering
 * @subgroup Text
 */
export type FontAtlas = {
    font: BitmapFontData;
    maxHeight: number;
    outline: Outline | null;
    ascent: number;
    descent: number;
    lineHeight: number;
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
        const f = font instanceof FontData ? font : null;
        _k.gfx.fontAtlases[fontName] = atlas = {
            font: {
                map: {},
                size: f?.size ?? DEF_TEXT_CACHE_SIZE,
                filter: f?.filter ?? _k.globalOpt.fontFilter ?? "linear",
            },
            maxHeight: 0,
            ascent: 0,
            descent: 0,
            lineHeight: 0,
            outline: f?.outline ?? null,
        };
    }
    return atlas;
}

const allChars = (() => {
    const renderableChars: string[] = [];
    for (let i = 33; i <= 126; i++) { // ASCII printables, excluding space which is often ridiculously tall
        renderableChars.push(String.fromCharCode(i));
    }
    return renderableChars.join("") + "ÅÁÂÄÃĄ"; // extended support for tall accents
})();

function updateFontAtlas(font: FontData | string, ch: string) {
    const atlas = getFontAtlasForFont(font);
    const fontName = getFontName(font);
    if (!atlas.font.map[ch]) {
        const c2d = _k.fontCacheC2d;
        if (!c2d) {
            throw new Error(
                "error generating font texture: _k.fontCacheC2d is null",
            );
        }

        if (!_k.fontCacheCanvas) {
            throw new Error(
                "error generating font texture: _k.fontCacheCanvas is missing",
            );
        }

        c2d.clearRect(
            0,
            0,
            _k.fontCacheCanvas.width,
            _k.fontCacheCanvas.height,
        );

        c2d.font = `${atlas.font.size}px ${fontName}, sans-serif`; // generic-family fallback stabilizes ascent of missing glyphs
        c2d.textBaseline = "alphabetic"; // more accurate across browsers and easier to calculate baseline
        c2d.textAlign = "left";
        c2d.fillStyle = "#fff";

        if (!atlas.lineHeight) {
            const m = c2d.measureText(allChars);
            const ascent = m.actualBoundingBoxAscent;
            const descent = m.actualBoundingBoxDescent;
            const safeOffset = 2;

            atlas.ascent =
                Math.ceil(ascent > 0 ? ascent : atlas.font.size * 0.78)
                + safeOffset;
            atlas.descent =
                Math.ceil(descent > 0 ? descent : atlas.font.size * 0.22)
                + safeOffset;
            atlas.lineHeight = Math.ceil(atlas.ascent + atlas.descent);
        }

        let w = Math.ceil(c2d.measureText(ch).width);
        if (!w) return;

        let h = atlas.lineHeight;

        const p = (atlas.outline?.width ?? 0)
            * (_k.globalOpt.pixelDensity || 1);
        const x = p;
        const y = p + atlas.ascent;

        w += p * 2;
        h += p * 2;

        if (atlas.outline?.width) {
            c2d.lineJoin = "round";
            c2d.lineWidth = atlas.outline.width * 2;
            c2d.strokeStyle = rgb(atlas.outline?.color || 0).toHex();
            c2d.strokeText(ch, x, y);
        }

        c2d.fillText(ch, x, y);

        const img = c2d.getImageData(0, 0, w, h);

        atlas.font.map[ch] = _k.assets.packer.add(img, atlas.font.filter);
        _k.assets.packer.syncIfPending();

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

    const fontAtlas = font instanceof FontData || typeof font === "string"
        ? (() => {
            const atlas = getFontAtlasForFont(font);
            if (atlas.maxHeight == 0) updateFontAtlas(font, chars[0]);
            return atlas;
        })()
        : null;
    const defGfxFont = fontAtlas ? fontAtlas.font : font as GfxFont;

    const size = opt.size || defGfxFont.size;
    const sizeScale = size / defGfxFont.size;
    const scale = vec2(opt.scale ?? 1).scale(sizeScale);
    const lineSpacing = opt.lineSpacing ?? 0;
    const letterSpacing = opt.letterSpacing ?? 0;
    const baselineCenterOffset = fontAtlas
        ? Math.round((fontAtlas.maxHeight * sizeScale - size) / 2)
        : 0;

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
                "width" | "height" | "frame"
            > = {
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
            let requestedFontData = defGfxFont;
            let requestedFontScale = 1;
            if (requestedFont && requestedFont !== defaultFontValue) {
                if (
                    resolvedFont instanceof FontData
                    || typeof resolvedFont === "string"
                ) {
                    requestedFontData = getFontAtlasForFont(requestedFont).font;
                }
                else requestedFontData = resolvedFont;
                requestedFontScale = defGfxFont.size / requestedFontData.size;
            }
            if (
                requestedFont
                && (resolvedFont instanceof FontData
                    || typeof resolvedFont === "string")
            ) updateFontAtlas(requestedFont, ch);

            let f = theFChar.frame = requestedFontData.map[ch];

            // TODO: leave space if character not found?
            if (f) {
                let charWidth = f.q.w * f.tex.width * requestedFontScale
                    * (theFChar.stretchInPlace
                        ? scale
                        : theFChar.scale).x;

                if (opt.width && curX + charWidth > opt.width && curX > 0) {
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

                theFChar.width = f.q.w * f.tex.width * requestedFontScale;
                theFChar.height = f.q.h * f.tex.height * requestedFontScale;

                theFChar.pos = theFChar.pos.add(
                    charWidth * 0.5,
                    theFChar.height * theFChar.scale.y * 0.5,
                );

                // queue char to be drawn
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

                curX += charWidth;
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
        let thisLineHeight = size;
        for (const { ch } of lines[i].chars) {
            ch.pos = ch.pos.add(ox, th - baselineCenterOffset);
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

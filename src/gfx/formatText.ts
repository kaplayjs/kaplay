import { Asset, type BitmapFontData, FontData, resolveFont } from "../assets";
import {
    DEF_FONT_FILTER,
    DEF_TEXT_CACHE_SIZE,
    FONT_ATLAS_HEIGHT,
    FONT_ATLAS_WIDTH,
    MULTI_WORD_RE,
} from "../constants";
import { fontCacheC2d, fontCacheCanvas, gfx } from "../kaplay";
import { Color } from "../math/color";
import { Quad, Vec2, vec2 } from "../math/math";
import { type Outline, type TexFilter } from "../types";
import { runes } from "../utils";
import { alignPt } from "./anchor";
import type {
    CharTransform,
    DrawTextOpt,
    FormattedChar,
    FormattedText,
} from "./draw";
import { Texture } from "./gfx";

type FontAtlas = {
    font: BitmapFontData;
    cursor: Vec2;
    outline: Outline | null;
};

const fontAtlases: Record<string, FontAtlas> = {};

function applyCharTransform(fchar: FormattedChar, tr: CharTransform) {
    if (tr.pos) fchar.pos = fchar.pos.add(tr.pos);
    if (tr.scale) fchar.scale = fchar.scale.scale(vec2(tr.scale));
    if (tr.angle) fchar.angle += tr.angle;
    if (tr.color && fchar.ch.length === 1) {
        fchar.color = fchar.color.mult(tr.color);
    }
    if (tr.opacity) fchar.opacity *= tr.opacity;
}

function compileStyledText(text: string): {
    charStyleMap: Record<number, string[]>;
    text: string;
} {
    const charStyleMap = {} as Record<number, string[]>;
    let renderText = "";
    let styleStack: [string, number][] = [];
    let lastIndex = 0;
    let skipCount = 0;

    for (let i = 0; i < text.length; i++) {
        if (i !== lastIndex + 1) skipCount += i - lastIndex;
        lastIndex = i;

        if (text[i] === "\\" && text[i + 1] === "[") continue;

        if ((i === 0 || text[i - 1] !== "\\") && text[i] === "[") {
            const start = i;

            i++;

            let isClosing = text[i] === "/";
            let style = "";

            if (isClosing) i++;

            while (i < text.length && text[i] !== "]") {
                style += text[i++];
            }

            if (
                !MULTI_WORD_RE.test(style)
                || i >= text.length
                || text[i] !== "]"
                || (isClosing
                    && (styleStack.length === 0
                        || styleStack[styleStack.length - 1][0] !== style))
            ) {
                i = start;
            }
            else {
                if (!isClosing) styleStack.push([style, start]);
                else styleStack.pop();

                continue;
            }
        }

        renderText += text[i];
        if (styleStack.length > 0) {
            charStyleMap[i - skipCount] = styleStack.map(([name]) => name);
        }
    }

    if (styleStack.length > 0) {
        while (styleStack.length > 0) {
            const [_, start] = styleStack.pop()!;
            text = text.substring(0, start) + "\\" + text.substring(start);
        }

        return compileStyledText(text);
    }

    return {
        charStyleMap: charStyleMap,
        text: renderText,
    };
}

export function formatText(opt: DrawTextOpt): FormattedText {
    if (opt.text === undefined) {
        throw new Error("formatText() requires property \"text\".");
    }

    let font = resolveFont(opt.font);

    // if it's still loading
    if (opt.text === "" || font instanceof Asset || !font) {
        return {
            width: 0,
            height: 0,
            chars: [],
            opt: opt,
        };
    }

    const { charStyleMap, text } = compileStyledText(opt.text + "");
    const chars = runes(text);

    // if it's not bitmap font, we draw it with 2d canvas or use cached image
    if (font instanceof FontData || typeof font === "string") {
        const fontName = font instanceof FontData
            ? font.fontface.family
            : font;
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
        const atlas: FontAtlas = fontAtlases[fontName] ?? {
            font: {
                tex: new Texture(gfx.ggl, FONT_ATLAS_WIDTH, FONT_ATLAS_HEIGHT, {
                    filter: opts.filter,
                }),
                map: {},
                size: DEF_TEXT_CACHE_SIZE,
            },
            cursor: new Vec2(0),
            outline: opts.outline,
        };

        if (!fontAtlases[fontName]) {
            fontAtlases[fontName] = atlas;
        }

        font = atlas.font;

        for (const ch of chars) {
            if (!atlas.font.map[ch]) {
                // TODO: use assets.packer to pack font texture
                const c2d = fontCacheC2d;
                if (!c2d) throw new Error("fontCacheC2d is not defined.");

                if (!fontCacheCanvas) {
                    throw new Error("fontCacheCanvas is not defined.");
                }

                c2d.clearRect(
                    0,
                    0,
                    fontCacheCanvas.width,
                    fontCacheCanvas.height,
                );
                c2d.font = `${font.size}px ${fontName}`;
                c2d.textBaseline = "top";
                c2d.textAlign = "left";
                c2d.fillStyle = "#ffffff";
                const m = c2d.measureText(ch);
                let w = Math.ceil(m.width);
                if (!w) continue;
                let h = font.size;

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
                    atlas.outline?.width ?? 0,
                );

                const img = c2d.getImageData(0, 0, w, h);

                // if we are about to exceed the X axis of the texture, go to another line
                if (atlas.cursor.x + w > FONT_ATLAS_WIDTH) {
                    atlas.cursor.x = 0;
                    atlas.cursor.y += h;
                    if (atlas.cursor.y > FONT_ATLAS_HEIGHT) {
                        // TODO: create another atlas
                        throw new Error(
                            "Font atlas exceeds character limit",
                        );
                    }
                }

                font.tex.update(img, atlas.cursor.x, atlas.cursor.y);
                font.map[ch] = new Quad(
                    atlas.cursor.x,
                    atlas.cursor.y,
                    w,
                    h,
                );
                atlas.cursor.x += w;
            }
        }
    }

    const size = opt.size || font.size;
    const scale = vec2(opt.scale ?? 1).scale(size / font.size);
    const lineSpacing = opt.lineSpacing ?? 0;
    const letterSpacing = opt.letterSpacing ?? 0;
    let curX: number = 0;
    let tw = 0;
    let th = 0;
    const lines: Array<{
        width: number;
        chars: FormattedChar[];
    }> = [];
    let curLine: FormattedChar[] = [];
    let cursor = 0;
    let lastSpace: number | null = null;
    let lastSpaceWidth: number = 0;

    // TODO: word break
    while (cursor < chars.length) {
        let ch = chars[cursor];

        // always new line on '\n'
        if (ch === "\n") {
            th += size + lineSpacing;

            lines.push({
                width: curX - letterSpacing,
                chars: curLine,
            });

            lastSpace = null;
            lastSpaceWidth = 0;
            curX = 0;
            curLine = [];
        }
        else {
            let q = font.map[ch];

            // TODO: leave space if character not found?
            if (q) {
                let gw = q.w * scale.x;

                if (opt.width && curX + gw > opt.width) {
                    // new line on last word if width exceeds
                    th += size + lineSpacing;
                    if (lastSpace != null) {
                        cursor -= curLine.length - lastSpace;
                        ch = chars[cursor];
                        q = font.map[ch];
                        gw = q.w * scale.x;
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

                    curX = 0;
                    curLine = [];
                }

                // push char
                curLine.push({
                    tex: font.tex,
                    width: q.w,
                    height: q.h,
                    // without some padding there'll be visual artifacts on edges
                    quad: new Quad(
                        q.x / font.tex.width,
                        q.y / font.tex.height,
                        q.w / font.tex.width,
                        q.h / font.tex.height,
                    ),
                    ch: ch,
                    pos: new Vec2(curX, th),
                    opacity: opt.opacity ?? 1,
                    color: opt.color ?? Color.WHITE,
                    scale: vec2(scale),
                    angle: 0,
                });

                if (ch === " ") {
                    lastSpace = curLine.length;
                    lastSpaceWidth = curX;
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

    th += size;

    if (opt.width) {
        tw = opt.width;
    }

    const fchars: FormattedChar[] = [];

    for (let i = 0; i < lines.length; i++) {
        const ox = (tw - lines[i].width) * alignPt(opt.align ?? "left");

        for (const fchar of lines[i].chars) {
            const q = font.map[fchar.ch];
            const idx = fchars.length + i;

            fchar.pos = fchar.pos.add(ox, 0).add(
                q.w * scale.x * 0.5,
                q.h * scale.y * 0.5,
            );

            if (opt.transform) {
                const tr = typeof opt.transform === "function"
                    ? opt.transform(idx, fchar.ch)
                    : opt.transform;
                if (tr) {
                    applyCharTransform(fchar, tr);
                }
            }

            if (charStyleMap[idx]) {
                const styles = charStyleMap[idx];
                for (const name of styles) {
                    const style = opt.styles?.[name];
                    const tr = typeof style === "function"
                        ? style(idx, fchar.ch)
                        : style;
                    if (tr) {
                        applyCharTransform(fchar, tr);
                    }
                }
            }

            fchars.push(fchar);
        }
    }

    return {
        width: tw,
        height: th,
        chars: fchars,
        opt: opt,
    };
}

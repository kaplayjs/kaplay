import {
    DEF_FONT,
    DEF_FONT_FILTER,
    DEF_TEXT_CACHE_SIZE,
    MAX_TEXT_CACHE_SIZE,
} from "../constants";
import type { Texture } from "../gfx";
import type { DrawTextOpt } from "../gfx/draw/drawText";
import { assets, globalOpt } from "../kaplay";
import { rgb } from "../math/color";
import { Quad } from "../math/math";
import type { LoadFontOpt, Outline, TexFilter } from "../types";
import { Asset, loadProgress } from "./asset";
import { type BitmapFontData, getBitmapFont, type GfxFont } from "./bitmapFont";

export class FontData {
    fontface: FontFace;
    filter: TexFilter = DEF_FONT_FILTER;
    outline: Outline | null = null;
    size: number = DEF_TEXT_CACHE_SIZE;
    constructor(face: FontFace, opt: LoadFontOpt = {}) {
        this.fontface = face;
        this.filter = opt.filter ?? DEF_FONT_FILTER;
        this.size = opt.size ?? DEF_TEXT_CACHE_SIZE;
        if (this.size > MAX_TEXT_CACHE_SIZE) {
            throw new Error(`Max font size: ${MAX_TEXT_CACHE_SIZE}`);
        }
        if (opt.outline) {
            this.outline = {
                width: 1,
                color: rgb(0, 0, 0),
            };
            if (typeof opt.outline === "number") {
                this.outline.width = opt.outline;
            }
            else if (typeof opt.outline === "object") {
                if (opt.outline.width) {
                    this.outline.width = opt.outline.width;
                }
                if (opt.outline.color) {
                    this.outline.color = opt.outline.color;
                }
            }
        }
    }
}

export function resolveFont(
    src: DrawTextOpt["font"],
):
    | FontData
    | Asset<FontData>
    | BitmapFontData
    | Asset<BitmapFontData>
    | string
    | null
    | void
{
    if (!src) {
        return resolveFont(globalOpt.font ?? DEF_FONT);
    }
    if (typeof src === "string") {
        const bfont = getBitmapFont(src);
        const font = getFont(src);
        if (bfont) {
            return bfont.data ?? bfont;
        }
        else if (font) {
            return font.data ?? font;
        }
        else if (
            document.fonts.check(`${DEF_TEXT_CACHE_SIZE}px ${src}`)
        ) {
            return src;
        }
        else if (loadProgress() < 1) {
            return null;
        }
        else {
            throw new Error(`Font not found: ${src}`);
        }
    }
    else if (src instanceof Asset) {
        return src.data ? src.data : src;
    }

    return src;
}

export function getFont(name: string): Asset<FontData> | null {
    return assets.fonts.get(name) ?? null;
}

// TODO: pass in null src to store opt for default fonts like "monospace"
export function loadFont(
    name: string,
    src: string | BinaryData,
    opt: LoadFontOpt = {},
): Asset<FontData> {
    const font = new FontFace(
        name,
        typeof src === "string" ? `url(${src})` : src,
    );
    document.fonts.add(font);

    return assets.fonts.add(
        name,
        font.load().catch((err) => {
            throw new Error(`Failed to load font from "${src}": ${err}`);
        }).then((face) => new FontData(face, opt)),
    );
}

export function makeFont(
    tex: Texture,
    gw: number,
    gh: number,
    chars: string,
): GfxFont {
    const cols = tex.width / gw;
    const map: Record<string, Quad> = {};
    const charMap = chars.split("").entries();

    for (const [i, ch] of charMap) {
        map[ch] = new Quad(
            (i % cols) * gw,
            Math.floor(i / cols) * gh,
            gw,
            gh,
        );
    }

    return {
        tex: tex,
        map: map,
        size: gh,
    };
}

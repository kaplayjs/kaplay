import {
    DEF_FONT,
    DEF_TEXT_CACHE_SIZE,
    MAX_TEXT_CACHE_SIZE,
} from "../constants/general";
import type { DrawTextOpt } from "../gfx/draw/drawText";
import type { Frame } from "../gfx/TexPacker";
import { rgb } from "../math/color";
import { Quad } from "../math/math";
import { _k } from "../shared";
import type { ImageSource, LoadFontOpt, Outline } from "../types";
import { Asset, loadProgress } from "./asset";
import { type BitmapFontData, getBitmapFont, type GfxFont } from "./bitmapFont";

/**
 * @group Assets
 * @subgroup Data
 */
export class FontData {
    outline: Outline | null = null;
    size: number = DEF_TEXT_CACHE_SIZE;
    constructor(
        public fontface: FontFace,
        opt: LoadFontOpt = {},
    ) {
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
        return resolveFont(_k.globalOpt.font ?? DEF_FONT);
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
    return _k.assets.fonts.get(name) ?? null;
}

// TODO: pass in null src to store opt for default fonts like "monospace"
export function loadFont(
    name: string,
    src: string | ArrayBuffer | ArrayBufferView,
    opt: LoadFontOpt = {},
): Asset<FontData> {
    const font = new FontFace(
        name,
        typeof src === "string" ? `url(${src})` : src,
    );
    document.fonts.add(font);

    return _k.assets.fonts.add(
        name,
        font.load().catch((err) => {
            throw new Error(`Failed to load font from "${src}": ${err}`);
        }).then((face) => new FontData(face, opt)),
    );
}

export function makeFont(
    tex: ImageSource,
    gw: number,
    gh: number,
    chars: string,
): GfxFont {
    const w = tex.width;
    const h = tex.height;
    const cols = w / gw;
    const map: Record<string, Frame> = {};
    const charMap = chars.split("").entries();

    for (const [i, ch] of charMap) {
        map[ch] = _k.assets.packer.add(
            tex,
            new Quad(
                (i % cols) * gw / w,
                Math.floor(i / cols) * gh / h,
                gw / w,
                gh / h,
            ),
        );
    }
    _k.assets.packer.refreshIfPending();

    return {
        map,
        size: gh,
    };
}

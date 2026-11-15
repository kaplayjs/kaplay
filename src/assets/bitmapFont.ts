import { ASCII_CHARS } from "../constants/general";
import type { Frame } from "../gfx/TexPacker";
import { _k } from "../shared";
import type { TexFilter } from "../types";
import { type Asset, loadImg } from "./asset";
import { makeFont } from "./font";
import {
    type FontGlyphs,
    multiGraphemeGlyphs,
    readFontGlyphs,
} from "./fontGlyphs";
import { fixURL } from "./utils";

/**
 * @group Assets
 * @subgroup Types
 */
export interface GfxFont {
    map: Record<string, Frame>;
    /** Explicit multi-grapheme entries rendered as one glyph. */
    ligatures?: readonly string[];
    size: number;
    filter: TexFilter;
}

/**
 * @group Assets
 * @subgroup Data
 */
export type BitmapFontData = GfxFont;

export function getBitmapFont(name: string): Asset<BitmapFontData> | null {
    return _k.assets.bitmapFonts.get(name) ?? null;
}

/**
 * @group Assets
 * @subgroup Types
 */
export interface LoadBitmapFontOpt {
    /**
     * A string of characters to map to every sprite in the characters grid
     *
     * @default " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
     */
    chars?: FontGlyphs;
    /**
     * Rasterization filter to use, if different than the global font filter.
     */
    filter?: TexFilter;
}

// TODO: support LoadSpriteSrc
export function loadBitmapFont(
    name: string | null,
    src: string,
    gw: number,
    gh: number,
    opt: LoadBitmapFontOpt = {},
): Asset<BitmapFontData> {
    const chars = readFontGlyphs(opt.chars ?? ASCII_CHARS, true);
    const fontSrc = fixURL(src);

    return _k.assets.bitmapFonts.add(
        name,
        loadImg(fontSrc)
            .then((img) => {
                return makeFont(
                    img,
                    gw,
                    gh,
                    chars,
                    opt.filter ?? _k.globalOpt.fontFilter ?? "nearest",
                );
            }),
    );
}

export function loadBitmapFontFromSprite(
    spriteID: string,
    chars: FontGlyphs,
): Asset<BitmapFontData> {
    const glyphs = readFontGlyphs(chars, false);
    return _k.assets.bitmapFonts.add(
        spriteID,
        (async () => {
            const spr = await _k.assets.sprites.waitFor(
                spriteID,
                _k.globalOpt.loadTimeout ?? 3000,
            );
            const frames = spr.frames;
            if (frames.length < glyphs.length) {
                throw new Error(
                    `Tried to define ${glyphs.length} characters for sprite font "${spriteID}", but there are only ${frames.length} frames defined`,
                );
            }
            const h = spr.height;
            return {
                map: Object.fromEntries(
                    glyphs.map((c, i) => [c, frames[i]]),
                ),
                size: h,
                ligatures: multiGraphemeGlyphs(glyphs),
                filter: null as any,
            };
        })(),
    );
}

// loading happiness...
export function loadHappy(
    fontName: string = "happy",
    opt?: LoadBitmapFontOpt,
) {
    if (!_k.game.defaultAssets.happy) {
        throw new Error("You can't use loadHappy with kaplay/mini");
    }

    return loadBitmapFont(fontName, _k.game.defaultAssets.happy, 28, 36, {
        filter: "nearest",
        ...opt,
    });
}

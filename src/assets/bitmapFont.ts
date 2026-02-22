import { ASCII_CHARS } from "../constants/general";
import type { Frame } from "../gfx/TexPacker";
import { _k } from "../shared";
import { type Asset, loadImg } from "./asset";
import { makeFont } from "./font";
import { fixURL } from "./utils";

/**
 * @group Assets
 * @subgroup Types
 */
export interface GfxFont {
    map: Record<string, Frame>;
    size: number;
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
    chars?: string;
}

// TODO: support LoadSpriteSrc
export function loadBitmapFont(
    name: string | null,
    src: string,
    gw: number,
    gh: number,
    opt: LoadBitmapFontOpt = {},
): Asset<BitmapFontData> {
    const fontSrc = fixURL(src);

    return _k.assets.bitmapFonts.add(
        name,
        loadImg(fontSrc)
            .then((img) => {
                return makeFont(
                    img,
                    gw,
                    gh,
                    opt.chars ?? ASCII_CHARS,
                );
            }),
    );
}

export function loadBitmapFontFromSprite(
    spriteID: string,
    chars: string,
): Asset<BitmapFontData> {
    return _k.assets.bitmapFonts.add(
        spriteID,
        (async () => {
            if (/[\n ]/.test(chars)) {
                throw new Error(
                    `While defining sprite font "${spriteID}": spaces are not allowed in chars`,
                );
            }
            const splittedChars = chars.split("");
            if (new Set(splittedChars).size !== splittedChars.length) {
                throw new Error(
                    `Duplicate characters given when defining sprite font "${spriteID}": ${chars}`,
                );
            }
            const spr = await _k.assets.sprites.waitFor(
                spriteID,
                _k.globalOpt.loadTimeout ?? 3000,
            );
            const frames = spr.frames;
            if (frames.length < splittedChars.length) {
                throw new Error(
                    `Tried to define ${splittedChars.length} characters for sprite font "${spriteID}", but there are only ${frames.length} frames defined`,
                );
            }
            const h = Math.max(...frames.map(({ tex, q }) => tex.height * q.h));
            return {
                map: Object.fromEntries(
                    splittedChars.map((c, i) => [c, frames[i]]),
                ),
                size: h,
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

    return loadBitmapFont(fontName, _k.game.defaultAssets.happy, 28, 36, opt);
}

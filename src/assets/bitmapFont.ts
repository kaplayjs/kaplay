import { ASCII_CHARS } from "../constants/general.js";
import { Texture } from "../gfx/gfx.js";
import { Quad } from "../math/math.js";
import { _k } from "../shared.js";
import type { TexFilter } from "../types.js";
import { type Asset, loadImg } from "./asset.js";
import { makeFont } from "./font.js";
import { fixURL } from "./utils.js";

export interface GfxFont {
    tex: Texture;
    map: Record<string, Quad>;
    size: number;
}

export type BitmapFontData = GfxFont;

export function getBitmapFont(name: string): Asset<BitmapFontData> | null {
    return _k.assets.bitmapFonts.get(name) ?? null;
}

export interface LoadBitmapFontOpt {
    /**
     * A string of characters to map to every sprite in the characters grid
     *
     * @default " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
     */
    chars?: string;
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
    const fontSrc = fixURL(src);

    return _k.assets.bitmapFonts.add(
        name,
        loadImg(fontSrc)
            .then((img) => {
                return makeFont(
                    Texture.fromImage(_k.gfx.ggl, img, opt),
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
            const tex = spr.tex;
            const h = Math.max(...frames.map(q => q.h)) * tex.height;
            return {
                tex,
                map: Object.fromEntries(
                    splittedChars.map((c, i) => {
                        const q = frames[i];
                        const q2 = new Quad(
                            q.x * tex.width,
                            q.y * tex.height,
                            q.w * tex.width,
                            q.h * tex.height,
                        );
                        return [c, q2];
                    }),
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

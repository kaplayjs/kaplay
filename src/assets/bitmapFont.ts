import { _k } from "../_k";
import { ASCII_CHARS } from "../constants/general";
import { Texture } from "../gfx/gfx";
import type { Quad } from "../math/math";
import type { TexFilter } from "../types";
import { type Asset, loadImg } from "./asset";
import { makeFont } from "./font";
import { fixURL } from "./utils";

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
    chars?: string;
    filter?: TexFilter;
    outline?: number;
}

// TODO: support outline
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

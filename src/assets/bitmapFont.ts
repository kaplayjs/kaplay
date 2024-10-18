import { ASCII_CHARS } from "../constants";
import { Texture } from "../gfx";
import { assets, gfx } from "../kaplay";
import type { Quad } from "../math/math";
import type { TexFilter } from "../types";
import { type Asset, loadImage } from "./asset";
import { makeFont } from "./font";

export interface GfxFont {
    tex: Texture;
    map: Record<string, Quad>;
    size: number;
}

export type BitmapFontData = GfxFont;

export function getBitmapFont(name: string): Asset<BitmapFontData> | null {
    return assets.bitmapFonts.get(name) ?? null;
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
    return assets.bitmapFonts.add(
        name,
        loadImage(src)
            .then((img) => {
                return makeFont(
                    Texture.fromImage(gfx.ggl, img, opt),
                    gw,
                    gh,
                    opt.chars ?? ASCII_CHARS,
                );
            }),
    );
}

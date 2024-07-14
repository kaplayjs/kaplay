import type { Texture } from "../gfx";
import { assets } from "../kaboom";
import type { Quad } from "../math";
import type { Asset } from "./asset";

export interface GfxFont {
    tex: Texture;
    map: Record<string, Quad>;
    size: number;
}

export type BitmapFontData = GfxFont;

export function getBitmapFont(name: string): Asset<BitmapFontData> | null {
    return assets.bitmapFonts.get(name) ?? null;
}

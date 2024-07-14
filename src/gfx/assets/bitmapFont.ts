import type { Asset } from "../gfx/assets";
import { assets, type BitmapFontData } from "../kaboom";

export function getBitmapFont(name: string): Asset<BitmapFontData> | null {
    return assets.bitmapFonts.get(name) ?? null;
}

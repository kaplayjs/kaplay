import { runes } from "../utils/runes";

/** A bitmap cell or sprite frame can represent one or several graphemes. */
export type FontGlyphs = string | readonly string[];

export function readFontGlyphs(
    chars: FontGlyphs,
    allowSpace: boolean,
): string[] {
    const glyphs = typeof chars === "string" ? runes(chars) : [...chars];
    const seen = new Set<string>();
    for (let i = 0; i < glyphs.length; i++) {
        let glyph = glyphs[i];
        if (
            typeof glyph !== "string" || glyph.length === 0
            || (/\s/u.test(glyph) && !(allowSpace && glyph === " "))
        ) {
            throw new Error(
                "Font glyphs must be nonempty and contain no whitespace",
            );
        }
        glyph = glyphs[i] = runes(glyph).join("");
        if (seen.has(glyph)) {
            throw new Error(`Duplicate font glyph: ${glyph}`);
        }
        seen.add(glyph);
    }
    return glyphs;
}

export function readLigatures(ligatures: readonly string[] = []): string[] {
    const result = readFontGlyphs(ligatures, false);
    if (result.some(glyph => runes(glyph).length < 2)) {
        throw new Error("Ligatures must contain at least two graphemes");
    }
    return result;
}

export function multiGraphemeGlyphs(glyphs: readonly string[]): string[] {
    return glyphs.filter(glyph => runes(glyph).length > 1);
}

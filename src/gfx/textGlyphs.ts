import { Asset } from "../assets/asset";
import type { GfxFont } from "../assets/bitmapFont";
import { FontData, resolveFont } from "../assets/font";
import { runes, runeSegments } from "../utils/runes";
import type { CharTransform, DrawTextOpt } from "./draw/drawText";
import type { StyledTextInfo } from "./formatText";

type Styles = StyledTextInfo["charStyleMap"][number];
type ResolvedFont = FontData | GfxFont | string;

export interface TextGlyph {
    text: string;
    index: number;
    styles: Styles;
}

function sameStyles(a: Styles, b: Styles): boolean {
    return a.length === b.length
        && a.every(([name, value], i) => name === b[i][0] && value === b[i][1]);
}

function staticFont(
    font: DrawTextOpt["font"],
    transform: CharTransform | undefined,
): DrawTextOpt["font"] {
    return transform?.font || font;
}

/** Select glyphs before layout, keeping indices in the source grapheme sequence. */
export function textGlyphs(
    text: string,
    charStyleMap: StyledTextInfo["charStyleMap"],
    opt: DrawTextOpt,
    baseFont: ResolvedFont,
): TextGlyph[] | null {
    const segments = runeSegments(text, opt.locale);
    const chars = segments.map(segment => segment.text);
    const styles: Styles[] = [];
    const fonts: ResolvedFont[] = [];
    const enabled: boolean[] = [];
    const resolved = new Map<DrawTextOpt["font"], ResolvedFont>();
    const declarations = new Map<ResolvedFont, string[][]>();

    for (const segment of segments) {
        const stack = charStyleMap[segment.index] ?? [];
        styles.push(stack);
        let dynamic = typeof opt.transform === "function";
        let requested = opt.font;
        if (!dynamic) {
            requested = staticFont(requested, opt.transform as CharTransform);
        }
        for (const [name] of stack) {
            const style = opt.styles?.[name];
            if (typeof style === "function") dynamic = true;
            else requested = staticFont(requested, style);
        }
        let font = baseFont;
        if (!dynamic && requested !== opt.font) {
            const cached = resolved.get(requested);
            if (cached) font = cached;
            else {
                const value = resolveFont(requested);
                if (!value || value instanceof Asset) return null;
                font = value;
                resolved.set(requested, font);
            }
        }
        fonts.push(font);
        enabled.push(!dynamic);
        if (!declarations.has(font)) {
            const ligatures = typeof font === "string"
                ? []
                : font.ligatures ?? [];
            declarations.set(
                font,
                ligatures.map(value => runes(value, opt.locale))
                    .sort((a, b) => b.length - a.length),
            );
        }
    }

    const result: TextGlyph[] = [];
    for (let index = 0; index < chars.length;) {
        let count = 1;
        if (enabled[index] && !/\s/u.test(chars[index])) {
            for (const candidate of declarations.get(fonts[index])!) {
                if (
                    candidate.length < 2
                    || index + candidate.length > chars.length
                ) continue;
                const matches = candidate.every((ch, j) =>
                    chars[index + j] === ch
                    && !/\s/u.test(ch)
                    && enabled[index + j]
                    && fonts[index + j] === fonts[index]
                    && sameStyles(styles[index], styles[index + j])
                );
                if (matches) {
                    count = candidate.length;
                    break;
                }
            }
        }
        result.push({
            text: chars.slice(index, index + count).join(""),
            index,
            styles: styles[index],
        });
        index += count;
    }
    return result;
}

import { expect, test } from "vitest";
import { compileStyledText } from "../../src/gfx/formatText";
import { runes } from "../../src/utils/runes";

// compileStyledText() should key charStyleMap by grapheme index, the same way
// formatText() walks the rendered text. Keying by UTF-16 code unit desyncs
// every style after an emoji, ZWJ sequence or astral character.

// the styled graphemes of `input`, resolved through the same rune array
// that formatText() consumes to apply styles
function styledGraphemes(input: string): (string | undefined)[] {
    const { charStyleMap, runes } = compileStyledText(input);
    return Object.keys(charStyleMap)
        .map(Number)
        .sort((a, b) => a - b)
        .map(i => runes[i]);
}

test("compileStyledText keeps ASCII style indices unchanged", () => {
    const { charStyleMap } = compileStyledText("a[c]b[/c]c");
    expect(charStyleMap).toEqual({ 1: [["c", undefined]] });
});

test("compileStyledText aligns styles after an emoji", () => {
    expect(styledGraphemes("\u{1F600}[c]x[/c]")).toEqual(["x"]);
});

test("compileStyledText aligns styles after an astral CJK character", () => {
    // U+20BB7 (a CJK Extension B ideograph) is a surrogate pair, so .length
    // counts it as two code units
    expect(styledGraphemes("\u{20BB7}[c]a[/c]")).toEqual(["a"]);
});

test("compileStyledText aligns styles after a ZWJ emoji sequence", () => {
    const family = "\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}";
    expect(styledGraphemes(`${family}[c]z[/c]`)).toEqual(["z"]);
});

test("compileStyledText maps every style key to a real grapheme", () => {
    const { charStyleMap, runes: segmented } = compileStyledText(
        "[c]\u{1F600}b[/c]",
    );
    for (const key of Object.keys(charStyleMap).map(Number)) {
        expect(segmented[key]).toBeDefined();
    }
    expect(styledGraphemes("[c]\u{1F600}b[/c]")).toEqual(["\u{1F600}", "b"]);
});

test("compileStyledText returns the rune array formatText consumes", () => {
    const family = "\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}";
    const input = `a[c]\u{1F600}[/c]\\[x] ${family}b`;
    const { text, runes: segmented } = compileStyledText(input);
    // the array must match what a second runes() pass over the rendered text
    // would produce, so formatText can consume it without segmenting again
    expect(segmented).toEqual(runes(text));
    expect(segmented.join("")).toBe(text);
});

test("compileStyledText keeps escaped characters as single runes", () => {
    const { text, runes: segmented } = compileStyledText("\\[c]\\\\x");
    expect(text).toBe("[c]\\x");
    expect(segmented).toEqual(["[", "c", "]", "\\", "x"]);
});

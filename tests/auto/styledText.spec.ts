import { expect, test } from "vitest";
import { compileStyledText } from "../../src/gfx/formatText";
import { runes } from "../../src/utils/runes";

// compileStyledText() should key charStyleMap by grapheme index, the same way
// formatText() walks the rendered text via runes(). Keying by UTF-16 code unit
// desyncs every style after an emoji, ZWJ sequence or astral character.

// the styled graphemes of `input`, resolved through the same runes() indexing
// that formatText() uses to apply styles
function styledGraphemes(input: string): (string | undefined)[] {
    const { charStyleMap, text } = compileStyledText(input);
    const graphemes = runes(text);
    return Object.keys(charStyleMap)
        .map(Number)
        .sort((a, b) => a - b)
        .map(i => graphemes[i]);
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
    const { charStyleMap, text } = compileStyledText("[c]\u{1F600}b[/c]");
    const graphemes = runes(text);
    for (const key of Object.keys(charStyleMap).map(Number)) {
        expect(graphemes[key]).toBeDefined();
    }
    expect(styledGraphemes("[c]\u{1F600}b[/c]")).toEqual(["\u{1F600}", "b"]);
});

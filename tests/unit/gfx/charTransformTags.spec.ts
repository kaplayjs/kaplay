import { expect, test } from "@playwright/test";
import type {
    FormattedChar,
    FormattedText,
} from "../../../src/gfx/draw/drawFormattedText";
import type {
    CharTransformFunc,
    DrawTextOpt,
} from "../../../src/gfx/draw/drawText";
import { transformFormattedText } from "../../../src/gfx/formatText";
import { Color } from "../../../src/math/color";
import { vec2 } from "../../../src/math/math";

// CharTransformFunc gained two context parameters, allTags and tagIndex, so
// style functions can react to the tags a character is nested in (#1181).
// transformFormattedText() is the exported entry point that applies
// opt.transform and opt.styles to every formatted character, so these tests
// pin the contract without needing a canvas or a loaded font.

type TagList = readonly [string, string][];

function makeChar(styles: [string, string][], ch = "x"): FormattedChar {
    return {
        ch,
        frame: null as any,
        width: 10,
        height: 10,
        initPos: vec2(0, 0),
        pos: vec2(0, 0),
        initScale: vec2(1, 1),
        scale: vec2(1, 1),
        skew: vec2(0, 0),
        angle: 0,
        color: Color.WHITE,
        opacity: 1,
        stretchInPlace: true,
        textCursor: 0,
        styles,
    };
}

function makeText(...chars: FormattedChar[]): FormattedText {
    return {
        width: 0,
        height: 0,
        chars,
        opt: {} as DrawTextOpt,
        renderedText: chars.map(c => c.ch).join(""),
    };
}

test("whole-text transform receives the active tag list and tagIndex -1", () => {
    const calls: [number, string, string, TagList, number][] = [];
    transformFormattedText(
        makeText(makeChar([["outer", "o"], ["inner", "i"]])),
        {
            text: "x",
            transform: (idx, ch, param, allTags, tagIndex) => {
                calls.push([idx, ch, param, allTags, tagIndex]);
                return {};
            },
        },
    );
    expect(calls).toEqual([
        [0, "x", "", [["outer", "o"], ["inner", "i"]], -1],
    ]);
});

test("transform of an unstyled character receives an empty tag list", () => {
    let seen: { allTags: TagList; tagIndex: number } | null = null;
    transformFormattedText(makeText(makeChar([])), {
        text: "x",
        transform: (idx, ch, param, allTags, tagIndex) => {
            seen = { allTags, tagIndex };
            return {};
        },
    });
    expect(seen).toEqual({ allTags: [], tagIndex: -1 });
});

test("style functions receive the full tag list and their own index", () => {
    const seen: Record<
        string,
        { param: string; allTags: TagList; tagIndex: number }
    > = {};
    transformFormattedText(
        makeText(makeChar([["outer", "o"], ["inner", "i"]])),
        {
            text: "x",
            styles: {
                outer: (idx, ch, param, allTags, tagIndex) => {
                    seen.outer = { param, allTags, tagIndex };
                    return { color: Color.RED };
                },
                inner: (idx, ch, param, allTags, tagIndex) => {
                    seen.inner = { param, allTags, tagIndex };
                    return { opacity: 0.5 };
                },
            },
        },
    );
    expect(seen.outer).toEqual({
        param: "o",
        allTags: [["outer", "o"], ["inner", "i"]],
        tagIndex: 0,
    });
    expect(seen.inner).toEqual({
        param: "i",
        allTags: [["outer", "o"], ["inner", "i"]],
        tagIndex: 1,
    });
});

test("a style can tell that it is nested inside another tag", () => {
    // the motivating use case from #1181: special behavior for nested tags
    const descriptions: string[] = [];
    const describe: CharTransformFunc = (idx, ch, param, allTags, tagIndex) => {
        const parents = allTags
            .slice(0, tagIndex)
            .map(([name]) => name)
            .join(">");
        descriptions.push(
            parents
                ? `${parents}>${allTags[tagIndex][0]}`
                : allTags[tagIndex][0],
        );
        return {};
    };
    transformFormattedText(
        makeText(makeChar([["outer", "o"], ["inner", "i"]])),
        {
            text: "x",
            styles: { outer: describe, inner: describe },
        },
    );
    expect(descriptions).toEqual(["outer", "outer>inner"]);
});

test("style calls still follow the tag order of the character", () => {
    const order: string[] = [];
    transformFormattedText(
        makeText(makeChar([["a", ""], ["b", ""], ["c", ""]])),
        {
            text: "abc",
            styles: {
                a: (idx, ch, param, allTags, tagIndex) => {
                    order.push(`a:${tagIndex}`);
                    return {};
                },
                b: (idx, ch, param, allTags, tagIndex) => {
                    order.push(`b:${tagIndex}`);
                    return {};
                },
                c: (idx, ch, param, allTags, tagIndex) => {
                    order.push(`c:${tagIndex}`);
                    return {};
                },
            },
        },
    );
    expect(order).toEqual(["a:0", "b:1", "c:2"]);
});

test("tags without a matching style entry are skipped but still reported", () => {
    const seen: TagList[] = [];
    transformFormattedText(
        makeText(makeChar([["styled", "s"], ["unstyled", "u"]])),
        {
            text: "x",
            styles: {
                styled: (idx, ch, param, allTags, tagIndex) => {
                    seen.push(allTags);
                    expect(tagIndex).toBe(0);
                    return {};
                },
            },
        },
    );
    // the unstyled tag is not applied, but the styled one still sees both
    expect(seen).toEqual([[["styled", "s"], ["unstyled", "u"]]]);
});

test("legacy three-parameter functions keep receiving idx, ch and param", () => {
    const got: string[] = [];
    transformFormattedText(makeText(makeChar([["c", "red"]])), {
        text: "x",
        transform: (idx, ch, param) => {
            got.push(`transform:${idx}:${ch}:${param}`);
            return {};
        },
        styles: {
            c: (idx, ch, param) => {
                got.push(`style:${idx}:${ch}:${param}`);
                return {};
            },
        },
    });
    expect(got).toEqual(["transform:0:x:", "style:0:x:red"]);
});

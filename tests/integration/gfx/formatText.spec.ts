import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
});

test.describe("zero-width space wrapping", () => {
    for (
        const { text, width, lines } of [
            { text: "AB\u200BCDEF", width: 150, lines: ["AB", "CDEF"] },
            { text: "AB\u200BCDEF", width: 180, lines: ["ABCDEF"] },
            {
                text: "\u200BAB\u200B\u200BCDEF\u200B",
                width: 150,
                lines: ["AB", "CDEF"],
            },
            {
                text: "AB\u200BCD\nEF\u200BGHIJ",
                width: 150,
                lines: ["ABCD", "EF", "GHIJ"],
            },
            { text: "AB CDEF", width: 150, lines: ["AB", "CDEF"] },
            { text: "AB \u200B\u200BCDEF", width: 150, lines: ["AB", "CDEF"] },
        ]
    ) {
        test(`wraps ${JSON.stringify(text)} at width ${width}`, async ({ page }) => {
            const result = await page.evaluate(async ({ text, width }) => {
                const k = kaplay();
                k.loadHappy();
                await new Promise<void>(resolve => k.onLoad(resolve));
                const formatted = k.formatText({
                    text,
                    font: "happy",
                    size: 36,
                    width,
                });
                const lines: Record<number, string> = {};
                for (const char of formatted.chars) {
                    lines[char.pos.y] = (lines[char.pos.y] ?? "") + char.ch;
                }
                return {
                    lines: Object.values(lines),
                    text: formatted.renderedText,
                };
            }, { text, width });

            expect(result.lines).toEqual(lines);
            expect(result.text).toBe(text);
        });
    }

    test("preserves character indices, styles and spacing after wrapping", async ({ page }) => {
        const result = await page.evaluate(async () => {
            const k = kaplay();
            k.loadHappy();
            await new Promise<void>(resolve => k.onLoad(resolve));
            return k.formatText({
                text: "AB\u200B[red]CDEF[/red]",
                font: "happy",
                size: 36,
                width: 150,
                letterSpacing: 2,
                align: "center",
                styles: { red: { color: k.RED } },
            }).chars.map(char => ({
                ch: char.ch,
                cursor: char.textCursor,
                x: char.pos.x,
                y: char.pos.y,
                red: char.color.eq(k.RED),
            }));
        });

        expect(result.map(char => char.cursor)).toEqual([0, 1, 3, 4, 5, 6]);
        expect(result.map(char => char.ch).join("")).toBe("ABCDEF");
        expect(result.map(char => char.red)).toEqual([
            false,
            false,
            true,
            true,
            true,
            true,
        ]);
        expect(result.map(char => char.x)).toEqual([60, 90, 30, 60, 90, 120]);
        expect(result.map(char => char.y)).toEqual([18, 18, 54, 54, 54, 54]);
    });

    test("wraps system-font text without rendering the separator", async ({ page }) => {
        const result = await page.evaluate(() => {
            const k = kaplay();
            const opt = { font: "sans-serif", size: 24, locale: "ja" };
            return [
                { text: "AB\u200BCDEF", measure: "ABCDE" },
                { text: "日本\u200B語表示例", measure: "日本語表示" },
            ].map(({ text, measure }) => {
                const width = k.formatText({ ...opt, text: measure }).width;
                const formatted = k.formatText({ ...opt, text, width });
                const lines: Record<number, string> = {};
                for (const char of formatted.chars) {
                    lines[char.pos.y] = (lines[char.pos.y] ?? "") + char.ch;
                }
                return Object.values(lines);
            });
        });

        expect(result).toEqual([["AB", "CDEF"], ["日本", "語表示例"]]);
    });

    for (const prefix of ["", "\n"]) {
        test(`keeps first system-font layout with a leading separator before ${JSON.stringify(prefix)}`, async ({ page }) => {
            const result = await page.evaluate(prefix => {
                const k = kaplay();
                const opt = { font: "monospace", size: 24 };
                const positions = (text: string) =>
                    k.formatText({ ...opt, text }).chars
                        .map(char => ({
                            ch: char.ch,
                            x: char.pos.x,
                            y: char.pos.y,
                        }));
                return {
                    marked: positions("\u200B" + prefix + "ABCD"),
                    plain: positions(prefix + "ABCD"),
                };
            }, prefix);

            expect(result.marked).toEqual(result.plain);
        });
    }

    test("renders wrapped text components like explicit line breaks", async ({ page }) => {
        async function render(text: string) {
            await page.evaluate(async (text) => {
                const k = kaplay({
                    width: 200,
                    height: 100,
                    background: "black",
                    debug: false,
                });
                k.loadHappy();
                await new Promise<void>(resolve => k.onLoad(resolve));
                k.add([k.text(text, { font: "happy", size: 36, width: 150 })]);
                await new Promise<void>(resolve => {
                    const event = k.onDraw(() => {
                        event.cancel();
                        requestAnimationFrame(() => resolve());
                    });
                });
            }, text);
            return page.locator("canvas").screenshot();
        }

        const wrapped = await render("AB\u200BCDEF");
        await page.reload();
        await page.addScriptTag({ path: "dist/kaplay.js" });
        const explicit = await render("AB\nCDEF");

        expect(wrapped).toEqual(explicit);
    });
});

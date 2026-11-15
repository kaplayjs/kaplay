import { expect, type Page, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

async function setup(page: Page, font?: string) {
    await page.addScriptTag({ path: "dist/kaplay.js" });
    await page.evaluate(font => {
        const k = kaplay({ global: false, width: 160, height: 100, font });
        const image = (count: number) => {
            const c = document.createElement("canvas");
            c.width = count * 10;
            c.height = 10;
            const ctx = c.getContext("2d")!;
            for (let i = 0; i < count; i++) {
                ctx.fillStyle =
                    ["#ff0000", "#00ff00", "#0000ff", "#ffffff"][i % 4];
                ctx.fillRect(i * 10, 0, 10, 10);
            }
            return c.toDataURL();
        };
        const loaded = (asset: any) =>
            new Promise<any>((yes, no) => asset.onLoad(yes).onError(no));
        const glyphs = [
            "f",
            "i",
            "fi",
            "ff",
            "ffi",
            "x",
            " ",
            "😀",
            "😀i",
            "é",
            "éi",
        ];
        const bitmap = (name = "glyphs", chars: any = glyphs) =>
            loaded(
                k.loadBitmapFont(name, image(chars.length), 10, 10, { chars }),
            );
        (window as any).fontTest = { k, loaded, image, glyphs, bitmap };
    }, font);
}

for (const source of ["bitmap", "sprite"]) {
    test(`${source} fonts select longest glyphs and preserve source indices`, async ({ page }) => {
        await setup(page);
        const result = await page.evaluate(async source => {
            const { k, bitmap, image, loaded } = (window as any).fontTest;
            if (source === "bitmap") await bitmap();
            else {
                await loaded(k.loadSprite("glyphs", image(6), { sliceX: 6 }));
                await loaded(
                    k.loadBitmapFontFromSprite("glyphs", [
                        "f",
                        "i",
                        "fi",
                        "ff",
                        "ffi",
                        "x",
                    ]),
                );
            }
            const f = k.formatText({
                text: "ffifix",
                font: "glyphs",
                size: 10,
            });
            const direct = k.formatText({
                text: "fifi",
                font: k.getBitmapFont("glyphs").data,
                size: 10,
            });
            return {
                chars: f.chars.map((c: any) => [c.ch, c.textCursor]),
                width: f.width,
                direct: direct.chars.map((c: any) => c.ch),
            };
        }, source);
        expect(result).toEqual({
            chars: [["ffi", 0], ["fi", 3], ["x", 5]],
            width: 30,
            direct: ["fi", "fi"],
        });
    });
}

test("grapheme boundaries and indices survive combining marks, emoji and missing glyphs", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap();
        return k.formatText({ text: "🦄😀iéifi", font: "glyphs", size: 10 })
            .chars.map((c: any) => [c.ch, c.textCursor]);
    });
    expect(result).toEqual([["😀i", 1], ["éi", 3], ["fi", 5]]);
});

for (const source of ["bitmap", "sprite"]) {
    test(`${source} string declarations map whole graphemes`, async ({ page }) => {
        await setup(page);
        const result = await page.evaluate(async source => {
            const { k, image, loaded } = (window as any).fontTest;
            if (source === "bitmap") {
                await loaded(
                    k.loadBitmapFont("unicode", image(3), 10, 10, {
                        chars: "😀éx",
                    }),
                );
            }
            else {
                await loaded(k.loadSprite("unicode", image(3), { sliceX: 3 }));
                await loaded(k.loadBitmapFontFromSprite("unicode", "😀éx"));
            }
            return k.formatText({ text: "😀éx", font: "unicode", size: 10 })
                .chars.map((c: any) => [c.ch, c.textCursor]);
        }, source);
        expect(result).toEqual([["😀", 0], ["é", 1], ["x", 2]]);
    });
}

test("tag-stack boundaries prevent merging while static transforms affect complete glyphs", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap();
        const f = k.formatText({
            text: "😀[red]fi[/red]f[red]i[/red]",
            font: "glyphs",
            size: 10,
            styles: { red: { color: k.rgb(128, 64, 32), opacity: 0.5 } },
        });
        return {
            text: f.renderedText,
            chars: f.chars.map((
                c: any,
            ) => [c.ch, c.textCursor, c.color.r, c.opacity]),
        };
    });
    expect(result).toEqual({
        text: "😀fifi",
        chars: [["😀", 0, 255, 1], ["fi", 1, 128, 0.5], ["f", 3, 255, 1], [
            "i",
            4,
            128,
            0.5,
        ]],
    });
});

test("static font overrides select the overridden font's declarations", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap("plain", ["f", "i"]);
        await bitmap();
        const f = k.formatText({
            text: "fi[alt]fi[/alt]fi",
            font: "plain",
            size: 10,
            styles: { alt: { font: "glyphs" } },
        });
        return f.chars.map((c: any) => [c.ch, c.textCursor]);
    });
    expect(result).toEqual([["f", 0], ["i", 1], ["fi", 2], ["f", 4], ["i", 5]]);
});

test("function-valued styles disable matching only in their styled span", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap();
        const seen: any[] = [];
        const f = k.formatText({
            text: "fi[dyn]fi[/dyn]fi",
            font: "glyphs",
            size: 10,
            styles: {
                dyn: (i: number, ch: string) => {
                    seen.push([i, ch]);
                    return { opacity: 0.4 };
                },
            },
        });
        return { chars: f.chars.map((c: any) => c.ch), seen };
    });
    expect(result).toEqual({
        chars: ["fi", "f", "i", "fi"],
        seen: [[2, "f"], [3, "i"]],
    });
});

test("function transforms retain per-grapheme callbacks and source indices", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap();
        const seen: any[] = [];
        const f = k.formatText({
            text: "😀fi",
            font: "glyphs",
            size: 10,
            transform: (i: number, ch: string) => {
                seen.push([i, ch]);
                return { angle: i };
            },
        });
        return { seen, chars: f.chars.map((c: any) => c.ch) };
    });
    expect(result).toEqual({
        seen: [[0, "😀"], [1, "f"], [2, "i"]],
        chars: ["😀", "f", "i"],
    });
});

for (const width of [5, 10, 20, 25]) {
    test(`ligatures remain atomic under width ${width} wrapping`, async ({ page }) => {
        await setup(page);
        const result = await page.evaluate(async width => {
            const { k, bitmap } = (window as any).fontTest;
            await bitmap();
            const f = k.formatText({
                text: "fififi",
                font: "glyphs",
                size: 10,
                width,
                letterSpacing: 2,
            });
            return {
                chars: f.chars.map((c: any) => [c.ch, c.textCursor]),
                rows: f.chars.map((c: any) => c.pos.y),
                height: f.height,
            };
        }, width);
        expect(result.chars).toEqual([["fi", 0], ["fi", 2], ["fi", 4]]);
        expect(result.height).toBe(width < 22 ? 30 : 20);
        expect(new Set(result.rows).size).toBe(width < 22 ? 3 : 2);
    });
}

test("word wrapping, newlines and glyph spacing preserve source positions", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap();
        const f = k.formatText({
            text: "fi ffi\nfix",
            font: "glyphs",
            size: 10,
            width: 24,
            letterSpacing: 2,
        });
        const { loaded, image } = (window as any).fontTest;
        await loaded(
            k.loadBitmapFont("wide", image(2), 20, 10, { chars: ["fi"] }),
        );
        const indented = k.formatText({
            text: " x[wide]fifi[/wide]",
            font: "glyphs",
            size: 10,
            width: 25,
            indentAll: true,
            styles: { wide: { font: "wide" } },
        });
        const simple = k.formatText({
            text: "fifi",
            font: "glyphs",
            size: 10,
            letterSpacing: 3,
        });
        return {
            chars: f.chars.map((c: any) => [c.ch, c.textCursor]),
            rows: f.chars.map((c: any) => c.pos.y),
            height: f.height,
            indented: indented.chars.filter((c: any) => c.ch !== " ").map((
                c: any,
            ) => [c.ch, c.textCursor]),
            width: simple.width,
            gap: simple.chars[1].pos.x - simple.chars[0].pos.x,
        };
    });
    expect(result.chars).toEqual([["fi", 0], ["ffi", 3], ["fi", 7], ["x", 9]]);
    expect(result.height).toBe(30);
    expect(result.rows).toEqual([5, 15, 25, 25]);
    expect(result.indented).toEqual([["x", 1], ["fi", 2], ["fi", 4]]);
    expect(result.width).toBe(23);
    expect(result.gap).toBe(13);
});

test("pending image and sprite loads capture glyph arrays at invocation", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, loaded, image } = (window as any).fontTest;
        const bitmapChars = ["f", "i", "fi"];
        const b = k.loadBitmapFont("bitmap-copy", image(3), 10, 10, {
            chars: bitmapChars,
        });
        bitmapChars[2] = "xx";
        const spriteChars = ["f", "i", "fi"];
        const s = k.loadBitmapFontFromSprite("sprite-copy", spriteChars);
        spriteChars[2] = "xx";
        await loaded(k.loadSprite("sprite-copy", image(3), { sliceX: 3 }));
        await Promise.all([loaded(b), loaded(s)]);
        return ["bitmap-copy", "sprite-copy"].map(font =>
            k.formatText({ text: "fi", font, size: 10 }).chars.map((c: any) =>
                c.ch
            )
        );
    });
    expect(result).toEqual([["fi"], ["fi"]]);
});

for (const bad of [["fi", "fi"], [""], ["f i"], ["\n"], ["\t"]]) {
    test(`invalid glyph declaration ${JSON.stringify(bad)} preserves an existing font`, async ({ page }) => {
        await setup(page);
        const result = await page.evaluate(async bad => {
            const { k, bitmap, loaded, image } = (window as any).fontTest;
            const old = await bitmap("stable");
            let rejected = false;
            try {
                await loaded(
                    k.loadBitmapFont("stable", image(10), 10, 10, {
                        chars: bad,
                    }),
                );
            } catch {
                rejected = true;
            }
            return {
                rejected,
                preserved: k.getBitmapFont("stable").data === old,
            };
        }, bad);
        expect(result).toEqual({ rejected: true, preserved: true });
    });
}

for (const source of ["bitmap", "sprite"]) {
    test(`${source} rejects more declared glyphs than cells or frames`, async ({ page }) => {
        await setup(page);
        const result = await page.evaluate(async source => {
            const { k, bitmap, loaded, image } = (window as any).fontTest;
            await bitmap();
            try {
                if (source === "bitmap") {
                    await loaded(
                        k.loadBitmapFont("short", image(1), 10, 10, {
                            chars: ["fi", "x"],
                        }),
                    );
                }
                else {
                    await loaded(k.loadSprite("short", image(1)));
                    await loaded(
                        k.loadBitmapFontFromSprite("short", ["fi", "x"]),
                    );
                }
                return false;
            } catch {
                return true;
            }
        }, source);
        expect(result).toBe(true);
    });
}

test("text components reformat on text, font and static style changes", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap();
        await bitmap("plain", ["f", "i"]);
        await new Promise<void>(resolve => k.onLoad(resolve));
        const obj = k.add([k.text("fi", { font: "glyphs", size: 10 })]);
        const widths = [obj.width];
        obj.text = "fifi";
        widths.push(obj.width);
        obj.font = "plain";
        widths.push(obj.width);
        obj.text = "[alt]fi[/alt]";
        obj.textStyles = { alt: { font: "glyphs" } };
        widths.push(obj.width);
        obj.textStyles.alt.font = "plain";
        widths.push(obj.width);
        obj.font = "glyphs";
        delete obj.textStyles.alt;
        widths.push(obj.width);
        return widths;
    });
    expect(result).toEqual([10, 20, 40, 10, 20, 10]);
});

test("drawText renders the ligature's frame", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap();
        await new Promise<void>(resolve =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );
        const canvas = k.makeCanvas(160, 100);
        canvas.draw(() =>
            k.drawText({
                text: "fi",
                font: "glyphs",
                size: 10,
                pos: k.vec2(0),
                color: k.rgb(255),
            })
        );
        const data = canvas.toImageData().data;
        const offset = (5 * 160 + 5) * 4;
        const rgb = Array.from(data.slice(offset, offset + 3));
        canvas.free();
        return rgb;
    });
    expect(result).toEqual([0, 0, 255]);
});

test("vector-font declarations are captured and apply to named and direct font data", async ({ page }) => {
    await setup(page);
    const bytes = readFileSync("examples/fonts/apl386.ttf").toString("base64");
    const result = await page.evaluate(async bytes => {
        const { k, loaded } = (window as any).fontTest;
        const buffer = Uint8Array.from(atob(bytes), c => c.charCodeAt(0));
        const ligatures = ["fi", "ff", "ffi"];
        const asset = k.loadFont("vector-test", buffer, { ligatures });
        ligatures[2] = "xx";
        const font = await loaded(asset);
        return ["vector-test", font].map(font =>
            k.formatText({ text: "ffifix", font }).chars.map((
                c: any,
            ) => [c.ch, c.textCursor])
        );
    }, bytes);
    expect(result).toEqual([[["ffi", 0], ["fi", 3], ["x", 5]], [["ffi", 0], [
        "fi",
        3,
    ], ["x", 5]]]);
});

test("vector declarations reject invalid sequences before replacing a named font", async ({ page }) => {
    await setup(page);
    const bytes = readFileSync("examples/fonts/apl386.ttf").toString("base64");
    const result = await page.evaluate(async bytes => {
        const { k, loaded } = (window as any).fontTest;
        const buffer = Uint8Array.from(atob(bytes), c => c.charCodeAt(0));
        const original = await loaded(
            k.loadFont("stable-vector", buffer, { ligatures: ["fi"] }),
        );
        const results = [];
        for (
            const ligatures of [[""], ["f"], ["é"], ["😀"], ["👩‍💻"], ["f i"], [
                "fi",
                "fi",
            ], [
                "\n",
            ]]
        ) {
            let rejected = false;
            try {
                await loaded(
                    k.loadFont("stable-vector", buffer, { ligatures }),
                );
            } catch {
                rejected = true;
            }
            results.push(
                rejected && k.getFont("stable-vector").data === original,
            );
        }
        return results;
    }, bytes);
    expect(result).toEqual(Array(8).fill(true));
});

test("sprite declarations reject spaces and duplicates without replacing their named font", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, loaded, image } = (window as any).fontTest;
        await loaded(k.loadSprite("sprite-stable", image(3), { sliceX: 3 }));
        const original = await loaded(
            k.loadBitmapFontFromSprite("sprite-stable", ["f", "i", "fi"]),
        );
        const results = [];
        for (const chars of [[" "], ["fi", "fi"], [""], ["f\ti"]]) {
            let rejected = false;
            try {
                await loaded(
                    k.loadBitmapFontFromSprite("sprite-stable", chars),
                );
            } catch {
                rejected = true;
            }
            results.push(
                rejected && k.getBitmapFont("sprite-stable").data === original,
            );
        }
        return results;
    });
    expect(result).toEqual(Array(4).fill(true));
});

test("ordinary multi-character glyph names do not create inherited font entries", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap("keys", ["__proto__", "constructor", "x"]);
        const f = k.formatText({
            text: "__proto__qconstructorx",
            font: "keys",
            size: 10,
        });
        return { chars: f.chars.map((c: any) => c.ch), width: f.width };
    });
    expect(result).toEqual({
        chars: ["__proto__", "constructor", "x"],
        width: 30,
    });
});

test("decomposed source characters keep later style boundaries at grapheme indices", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap();
        return k.formatText({
            text: "é[red]fi[/red]fi",
            font: "glyphs",
            size: 10,
            styles: { red: { opacity: 0.3 } },
        }).chars.map((c: any) => [c.ch, c.textCursor, c.opacity]);
    });
    expect(result).toEqual([["é", 0, 1], ["fi", 1, 0.3], ["fi", 3, 1]]);
});

test("wide vector ligatures rasterize their complete text", async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
    const bytes = readFileSync("examples/fonts/apl386.ttf").toString("base64");
    const result = await page.evaluate(async bytes => {
        const k = kaplay({ global: false, width: 800, height: 100 });
        const sequence = "WWWWWWWWWWWW";
        const buffer = Uint8Array.from(atob(bytes), c => c.charCodeAt(0));
        const asset = k.loadFont("wide-vector", buffer, {
            ligatures: [sequence],
        });
        await new Promise<void>((yes, no) =>
            asset.onLoad(() => yes()).onError(no)
        );
        await new Promise<void>(resolve =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );
        const options = {
            text: sequence,
            font: "wide-vector",
            size: 32,
            pos: k.vec2(0),
        };
        const formatted = k.formatText(options);
        const canvas = k.makeCanvas(800, 100);
        canvas.draw(() => k.drawText(options));
        const pixels = canvas.toImageData().data;
        let visible = false;
        for (let y = 0; y < 60; y++) {
            for (
                let x = Math.ceil(formatted.width * 0.8);
                x < formatted.width * 0.95;
                x++
            ) {
                if (pixels[(y * 800 + x) * 4 + 3] > 0) visible = true;
            }
        }
        canvas.free();
        return { glyphs: formatted.chars.length, visible };
    }, bytes);
    expect(result).toEqual({ glyphs: 1, visible: true });
});

test("public loader declarations accept readonly glyph and ligature arrays", () => {
    const dir = mkdtempSync(join(tmpdir(), "font-types-"));
    try {
        const declaration = resolve(
            JSON.parse(readFileSync("package.json", "utf8")).types,
        ).replace(/\.d\.ts$/, ".js");
        const file = join(dir, "consumer.ts");
        writeFileSync(
            file,
            `import kaplay from ${JSON.stringify(declaration)};
const k = kaplay({ global: false });
const glyphs = ["f", "i", "fi"] as const;
k.loadBitmapFont("icons", "icons.png", 10, 10, { chars: glyphs });
k.loadBitmapFontFromSprite("icons", glyphs);
k.loadFont("body", "body.ttf", { ligatures: ["fi", "ffi"] as const });`,
        );
        try {
            execFileSync(process.execPath, [
                "node_modules/typescript/bin/tsc",
                "--strict",
                "--noEmit",
                "--skipLibCheck",
                "--target",
                "ES2022",
                "--module",
                "ESNext",
                "--moduleResolution",
                "bundler",
                file,
            ], { encoding: "utf8" });
        } catch (error: any) {
            throw new Error(
                [error.message, error.stdout, error.stderr].filter(Boolean)
                    .join("\n"),
            );
        }
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test("whole-text static transforms select fonts and transform complete glyphs", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap("plain", ["f", "i"]);
        await bitmap();
        const f = k.formatText({
            text: "fi",
            font: "plain",
            size: 10,
            transform: {
                font: "glyphs",
                scale: 2,
                stretchInPlace: false,
                angle: 15,
                pos: k.vec2(3, 4),
                skew: k.vec2(5, 6),
            },
        });
        return {
            width: f.width,
            height: f.height,
            chars: f.chars.map((c: any) => ({
                text: c.ch,
                index: c.textCursor,
                scale: [c.scale.x, c.scale.y],
                position: [c.pos.x, c.pos.y],
                skew: [c.skew.x, c.skew.y],
                angle: c.angle,
            })),
        };
    });
    expect(result).toEqual({
        width: 20,
        height: 20,
        chars: [{
            text: "fi",
            index: 0,
            scale: [2, 2],
            position: [13, 14],
            skew: [5, 6],
            angle: 15,
        }],
    });
});

test("sprite ligatures render their declared frame through drawText", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, loaded, image } = (window as any).fontTest;
        await loaded(k.loadSprite("sprite-pixels", image(3), { sliceX: 3 }));
        await loaded(
            k.loadBitmapFontFromSprite("sprite-pixels", ["f", "i", "fi"]),
        );
        await new Promise<void>(resolve =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );
        const canvas = k.makeCanvas(160, 100);
        canvas.draw(() =>
            k.drawText({
                text: "fi",
                font: "sprite-pixels",
                size: 10,
                pos: k.vec2(0),
            })
        );
        const pixels = canvas.toImageData().data;
        const pixel = Array.from(
            pixels.slice((5 * 160 + 5) * 4, (5 * 160 + 5) * 4 + 3),
        );
        canvas.free();
        return pixel;
    });
    expect(result).toEqual([0, 0, 255]);
});

test("text components accept frozen styles and reselect glyphs after transform changes", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap();
        await bitmap("plain", ["f", "i"]);
        await new Promise<void>(resolve => k.onLoad(resolve));
        const obj = k.add([k.text("[alt]fi[/alt]", {
            font: "glyphs",
            size: 10,
            styles: Object.freeze({ alt: Object.freeze({ color: k.RED }) }),
        })]);
        const snapshot = () =>
            obj.formattedText().chars.map((
                c: any,
            ) => [c.ch, c.color.r, c.color.g]);
        const values = [snapshot()];
        obj.textTransform = { font: "plain" };
        values.push(snapshot());
        obj.textTransform.font = "glyphs";
        values.push(snapshot());
        obj.textTransform = () => ({ opacity: 0.5 });
        values.push(snapshot());
        obj.textTransform = {};
        values.push(snapshot());
        return values;
    });
    const one = [["fi", 255, 0]];
    const separate = [["f", 255, 0], ["i", 255, 0]];
    expect(result).toEqual([one, separate, one, separate, one]);
});

test("dynamic styles override pending static fonts before font resolution", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap, loaded, image } = (window as any).fontTest;
        await bitmap();
        const pending = k.loadBitmapFontFromSprite("pending-style", "fi");
        const seen: any[] = [];
        try {
            const f = k.formatText({
                text: "[outer][inner]fi[/inner][/outer]",
                font: "glyphs",
                size: 10,
                styles: {
                    outer: { font: "pending-style" },
                    inner: (i: number, ch: string) => {
                        seen.push([i, ch]);
                        return { font: "glyphs" };
                    },
                },
            });
            return { chars: f.chars.map((c: any) => c.ch), seen };
        } finally {
            await loaded(
                k.loadSprite("pending-style", image(2), { sliceX: 2 }),
            );
            await loaded(pending);
        }
    });
    expect(result).toEqual({ chars: ["f", "i"], seen: [[0, "f"], [1, "i"]] });
});

test("empty static font overrides preserve the selected font and its glyphs", async ({ page }) => {
    await setup(page, "glyphs");
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap();
        await bitmap("plain", ["f", "i"]);
        return [
            { font: "plain", transform: { font: "" } },
            { font: "plain", styles: { empty: { font: "" } } },
            {
                font: "plain",
                transform: { font: "glyphs" },
                styles: { empty: { font: "" } },
            },
        ].map(options => {
            const f = k.formatText({
                text: "[empty]fi[/empty]",
                size: 10,
                ...options,
            });
            return { chars: f.chars.map((c: any) => c.ch), width: f.width };
        });
    });
    expect(result).toEqual([
        { chars: ["f", "i"], width: 20 },
        { chars: ["f", "i"], width: 20 },
        { chars: ["fi"], width: 10 },
    ]);
});

test("mutable styles inside a frozen map update component glyph selection", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap();
        await bitmap("plain", ["f", "i"]);
        await new Promise<void>(resolve => k.onLoad(resolve));
        const obj = k.add([k.text("[alt]fi[/alt]", {
            font: "plain",
            size: 10,
            styles: Object.freeze({ alt: { font: "glyphs" } }),
        })]);
        const snapshot = () => ({
            width: obj.width,
            chars: obj.formattedText().chars.map((c: any) => c.ch),
        });
        const values = [snapshot()];
        obj.textStyles.alt.font = "plain";
        await new Promise<void>(resolve =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );
        values.push(snapshot());
        obj.textStyles.alt.font = "glyphs";
        await new Promise<void>(resolve =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );
        values.push(snapshot());
        return values;
    });
    expect(result).toEqual([
        { width: 10, chars: ["fi"] },
        { width: 20, chars: ["f", "i"] },
        { width: 10, chars: ["fi"] },
    ]);
});

test("ligature color applies without changing ordinary emoji modulation", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, bitmap } = (window as any).fontTest;
        await bitmap();
        const values = [];
        for (const [font, text] of [["glyphs", "😀i"], ["monospace", "😀"]]) {
            const f = k.formatText({
                text: `[red]${text}[/red]`,
                font,
                styles: { red: { color: k.RED } },
            });
            values.push(
                f.chars.map((
                    c: any,
                ) => [c.ch, c.color.r, c.color.g, c.color.b]),
            );
        }
        return values;
    });
    expect(result).toEqual([[["😀i", 255, 0, 0]], [["😀", 255, 255, 255]]]);
});

import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const red = [255, 0, 0, 255];
const blue = [0, 0, 255, 255];
const green = [0, 255, 0, 255];
const yellow = [255, 255, 0, 255];

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
    await page.evaluate(async () => {
        const k = (window as any).kaplay({
            global: false,
            width: 128,
            height: 128,
            pixelDensity: 1,
            background: [0, 0, 0],
            texFilter: "nearest",
            debug: false,
        });
        const picture = (w: number, h: number, colors: string[]) => {
            const c = document.createElement("canvas");
            c.width = w;
            c.height = h;
            const ctx = c.getContext("2d")!;
            colors.forEach((color, i) => {
                ctx.fillStyle = color;
                ctx.fillRect(i * w / colors.length, 0, w / colors.length, h);
            });
            return c;
        };
        k.loadSprite("stripe", picture(16, 8, ["red", "blue"]));
        k.loadSprite(
            "frames",
            picture(24, 8, ["red", "blue", "lime", "yellow"]),
            { sliceX: 2 },
        );
        k.loadSprite("white", picture(8, 8, ["white"]));
        const checker = picture(8, 8, ["red", "blue"]);
        checker.getContext("2d")!.fillStyle = "lime";
        checker.getContext("2d")!.fillRect(0, 4, 8, 4);
        k.loadSprite("checker", checker);
        k.loadSprite("phase", picture(16, 8, ["red", "blue", "lime", "yellow"]));
        await new Promise<void>(resolve => k.onLoad(resolve));
        const render = (action: () => void) => {
            const target = k.makeCanvas(128, 128);
            target.draw(action);
            const data = target.toImageData().data;
            target.free();
            return Array.from(data);
        };
        const pixel = (data: number[], x: number, y: number) =>
            data.slice((y * 128 + x) * 4, (y * 128 + x) * 4 + 4);
        (window as any).fixture = { k, render, pixel, picture };
    });
});

test("public types accept texture options on strokes, curves and outlines", () => {
    const dir = mkdtempSync(join(process.cwd(), ".stroke-types-"));
    try {
        const file = join(dir, "consumer.ts");
        writeFileSync(
            file,
            `
import kaplay, { type Outline, type DrawLineOpt,
    type DrawLinesOpt, type DrawCurveOpt, type DrawBezierOpt } from "../dist/doc";
const k = kaplay({ global: false });
const texture = { sprite: "line", frame: 1, repeatLength: 12 };
const line: DrawLineOpt = { p1: k.vec2(), p2: k.vec2(10), texture };
const lines: DrawLinesOpt = { pts: [k.vec2(), k.vec2(10)], texture };
const curve: DrawCurveOpt = { texture };
const bezier: DrawBezierOpt = { pt1: k.vec2(), pt2: k.vec2(4), pt3: k.vec2(8), pt4: k.vec2(12), texture };
const outline: Outline = { texture };
k.drawLine(line); k.drawLines(lines); k.drawCurve(t => k.vec2(t), curve); k.drawBezier(bezier);
k.drawRect({ width: 20, height: 20, outline });
k.add([k.rect(20, 20), k.outline()]).outline.texture = texture;
`,
        );
        const result = spawnSync(process.execPath, [
            "node_modules/typescript/bin/tsc",
            "--noEmit",
            "--strict",
            "--skipLibCheck",
            "--target",
            "es2022",
            "--moduleResolution",
            "bundler",
            "--module",
            "esnext",
            file,
        ], { encoding: "utf8" });
        expect(result.status, result.stdout + result.stderr).toBe(0);
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test("direct strokes repeat at the frame width or a chosen length", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, render, pixel } = (window as any).fixture;
        const cases = [undefined, 20].map(repeatLength => {
            const image = render(() =>
                k.drawLine({
                    p1: k.vec2(10, 20),
                    p2: k.vec2(110, 20),
                    width: 8,
                    fixed: true,
                    texture: { sprite: "stripe", repeatLength },
                })
            );
            const period = repeatLength ?? 16;
            const samples = Array.from({ length: 6 }, (_, i) => {
                const x = 15 + i * 3;
                return [pixel(image, x, 20), pixel(image, x + period, 20)];
            });
            const colors = new Map<string, number[]>();
            for (let x = 12; x < 108; x++) {
                const value = pixel(image, x, 20);
                if (value[3] > 250) colors.set(value.slice(0, 3).join(","), value);
            }
            return { samples, colors: [...colors.values()] };
        });
        const lineOptions = {
            p1: k.vec2(20, 90),
            p2: k.vec2(80, 90),
            width: 8,
            pos: k.vec2(30, 25),
            fixed: true,
        };
        const solid = render(() => k.drawLine(lineOptions));
        const textured = render(() =>
            k.drawLine({
                ...lineOptions,
                texture: { sprite: "white", repeatLength: 8 },
            })
        );
        let positionMaskDiff = 0;
        for (let i = 3; i < solid.length; i += 4) {
            if ((solid[i] > 0) !== (textured[i] > 0)) positionMaskDiff++;
        }
        return { cases, positionMaskDiff };
    });
    for (const resultCase of result.cases) {
        expect(resultCase.samples.every(([a, b]) =>
            a.every((channel, i) => channel === b[i])
        )).toBe(true);
        expect(resultCase.colors).toEqual(expect.arrayContaining([red, blue]));
    }
    expect(result.positionMaskDiff).toBe(0);
});

test("connected paths retain phase through every join and the closing segment", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, render, pixel } = (window as any).fixture;
        return ["bevel", "round", "miter"].map(join => {
            const open = render(() =>
                k.drawLines({
                    pts: [k.vec2(12, 20), k.vec2(58, 20), k.vec2(58, 100)],
                    width: 6,
                    join,
                    texture: { sprite: "stripe", repeatLength: 16 },
                })
            );
            const closed = render(() =>
                k.drawLines({
                    pts: [
                        k.vec2(40, 40), k.vec2(60, 40), k.vec2(60, 68),
                        k.vec2(40, 68), k.vec2(40, 40),
                    ],
                    width: 6,
                    join,
                    texture: { sprite: "stripe", repeatLength: 16 },
                })
            );
            const openPairs = Array.from({ length: 13 }, (_, i) => {
                const before = i + 2;
                const after = 16 - before;
                return [
                    pixel(open, 58 - before, 20),
                    pixel(open, 58, 20 + after),
                ];
            });
            const closingSegmentRepeatPairs = Array.from({ length: 6 }, (_, i) => [
                pixel(closed, 40, 44 + i),
                pixel(closed, 40, 60 + i),
            ]);
            const seamPixels = [
                pixel(closed, 40, 40),
                pixel(closed, 42, 40),
                pixel(closed, 40, 42),
            ];
            const pathColors = (image: number[], points: [number, number][]) => {
                const colors = new Map<string, number[]>();
                for (const [x, y] of points) {
                    const value = pixel(image, x, y);
                    if (value[3] > 250) colors.set(value.slice(0, 3).join(","), value);
                }
                return [...colors.values()];
            };
            const openColors = pathColors(open, [
                ...Array.from({ length: 41 }, (_, i) => [15 + i, 20] as [number, number]),
                ...Array.from({ length: 71 }, (_, i) => [58, 25 + i] as [number, number]),
            ]);
            const closedColors = pathColors(closed, [
                ...Array.from({ length: 17 }, (_, i) => [42 + i, 40] as [number, number]),
                ...Array.from({ length: 25 }, (_, i) => [60, 42 + i] as [number, number]),
                ...Array.from({ length: 17 }, (_, i) => [58 - i, 68] as [number, number]),
                ...Array.from({ length: 25 }, (_, i) => [40, 66 - i] as [number, number]),
            ]);
            return {
                openPairs,
                closingSegmentRepeatPairs,
                seamPixels,
                openColors,
                closedColors,
            };
        });
    });
    const same = (a: number[], b: number[]) =>
        a.every((channel, i) => channel === b[i]);
    for (const {
        openPairs,
        closingSegmentRepeatPairs,
        seamPixels,
        openColors,
        closedColors,
    } of result) {
        expect(openPairs.every(([before, after]) => same(before, after))).toBe(true);
        expect(closingSegmentRepeatPairs.every(([first, later]) => same(first, later))).toBe(true);
        expect(seamPixels.every(pixel => pixel[3] > 250)).toBe(true);
        expect(openColors).toEqual(expect.arrayContaining([red, blue]));
        expect(closedColors).toEqual(expect.arrayContaining([red, blue]));
    }
});

test("selected atlas frames and both texture axes remain isolated", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, render, pixel } = (window as any).fixture;
        const image = render(() => {
            k.drawLine({
                p1: k.vec2(10, 20), p2: k.vec2(110, 20), width: 8,
                texture: { sprite: "frames", frame: 1 },
            });
            k.drawLine({
                p1: k.vec2(10, 30), p2: k.vec2(110, 30), width: 8,
                texture: { sprite: "frames" },
            });
            k.drawLines({
                pts: [k.vec2(10, 40), k.vec2(110, 40)], width: 8,
                texture: { sprite: "frames" },
            });
            k.drawCurve(t => k.vec2(10 + 90 * t, 60), {
                segments: 24, width: 8,
                texture: { sprite: "frames", frame: 1 },
            });
            k.drawBezier({
                pt1: k.vec2(10, 80), pt2: k.vec2(40, 80),
                pt3: k.vec2(70, 80), pt4: k.vec2(100, 80),
                segments: 24, width: 8,
                texture: { sprite: "frames" },
            });
            k.drawRect({
                pos: k.vec2(10, 98), width: 100, height: 20, fill: false,
                outline: { width: 8, texture: { sprite: "frames", frame: 1 } },
            });
        });
        const colorsAt = (y: number) => {
            const colors = new Map<string, number[]>();
            for (let x = 14; x < 106; x++) {
                const value = pixel(image, x, y);
                if (value[3] > 250) colors.set(value.slice(0, 3).join(","), value);
            }
            return [...colors.values()];
        };
        const checkerImage = render(() => k.drawLine({
            p1: k.vec2(10, 50), p2: k.vec2(110, 50), width: 16,
            texture: { sprite: "checker", repeatLength: 20 },
        }));
        return {
            selectedFrame: [colorsAt(20), colorsAt(60), colorsAt(98)],
            defaultFrame: [colorsAt(30), colorsAt(40), colorsAt(80)],
            acrossWidth: [pixel(checkerImage, 25, 44), pixel(checkerImage, 25, 56)],
        };
    });
    const onlyColors = (pixels: number[][], palette: number[][]) =>
        pixels.length > 0 && pixels.every(pixel =>
            palette.some(color => color.every((channel, i) => channel === pixel[i]))
        );
    for (const pixels of result.selectedFrame) {
        expect(pixels).toEqual(expect.arrayContaining([green, yellow]));
        expect(onlyColors(pixels, [green, yellow])).toBe(true);
    }
    for (const pixels of result.defaultFrame) {
        expect(pixels).toEqual(expect.arrayContaining([red, blue]));
        expect(onlyColors(pixels, [red, blue])).toBe(true);
    }
    expect(result.acrossWidth[0]).not.toEqual(result.acrossWidth[1]);
});

test("curves and bezier calls carry continuous pattern distance", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, render, pixel } = (window as any).fixture;
        const drawCurve = (path: (t: number) => any) => render(() =>
            k.drawCurve(path, {
                segments: 32,
                width: 8,
                texture: { sprite: "stripe", repeatLength: 24 },
            })
        );
        const linearCurve = drawCurve(t => k.vec2(10 + 90 * t, 20));
        const easedCurve = drawCurve(t => k.vec2(10 + 90 * t * t, 20));
        const drawBezier = (control: [number, number, number, number], y: number) =>
            render(() => k.drawBezier({
                pt1: k.vec2(control[0], y), pt2: k.vec2(control[1], y),
                pt3: k.vec2(control[2], y), pt4: k.vec2(control[3], y),
                segments: 32, width: 8,
                texture: { sprite: "stripe", repeatLength: 24 },
            }));
        const linearBezier = drawBezier([10, 40, 70, 100], 60);
        const easedBezier = drawBezier([10, 10, 100, 100], 60);
        const matches = (first: number[], second: number[], y: number) => {
            let same = 0;
            let total = 0;
            for (let x = 14; x < 97; x++) {
                const a = pixel(first, x, y);
                const b = pixel(second, x, y);
                if (a.every((channel, i) => channel === b[i])) same++;
                total++;
            }
            return same / total;
        };
        const palette = (image: number[], y: number) => {
            const colors = new Map<string, number[]>();
            for (let x = 14; x < 97; x++) {
                const value = pixel(image, x, y);
                if (value[3] > 250) colors.set(value.slice(0, 3).join(","), value);
            }
            return [...colors.values()];
        };
        return {
            curveMatch: matches(linearCurve, easedCurve, 20),
            bezierMatch: matches(linearBezier, easedBezier, 60),
            curveColors: palette(linearCurve, 20),
            bezierColors: palette(linearBezier, 60),
        };
    });
    expect(result.curveMatch).toBeGreaterThan(0.9);
    expect(result.bezierMatch).toBeGreaterThan(0.9);
    expect(result.curveColors).toEqual(expect.arrayContaining([red, blue]));
    expect(result.bezierColors).toEqual(expect.arrayContaining([red, blue]));
});

test("primitive outlines carry frame selection, repetition and local transforms", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, render, pixel } = (window as any).fixture;
        const rectImage = render(() => k.drawRect({
            pos: k.vec2(10, 20), width: 36, height: 25, fill: false,
            scale: k.vec2(2, 1),
            outline: { width: 6, texture: { sprite: "frames", frame: 1, repeatLength: 12 } },
        }));
        const polygonImage = render(() => k.drawPolygon({
            pts: [k.vec2(15, 80), k.vec2(70, 80), k.vec2(70, 115)],
            fill: false,
            outline: { width: 6, texture: { sprite: "stripe", repeatLength: 16 } },
        }));
        const object = k.add([
            k.rect(40, 30, { fill: false }),
            k.outline(8, k.WHITE),
        ]);
        object.outline.texture = { sprite: "frames", frame: 1, repeatLength: 12 };
        const componentImage = render(() => object.draw());
        const colorsAt = (image: number[], y: number, x1: number, x2: number) => {
            const colors = new Map<string, number[]>();
            for (let x = x1; x < x2; x++) {
                const value = pixel(image, x, y);
                if (value[3] > 250) colors.set(value.slice(0, 3).join(","), value);
            }
            return [...colors.values()];
        };
        return {
            rect: colorsAt(rectImage, 20, 8, 90),
            polygon: colorsAt(polygonImage, 80, 15, 70),
            polygonPeriod: [pixel(polygonImage, 22, 80), pixel(polygonImage, 38, 80)],
            component: colorsAt(componentImage, 1, 2, 38),
        };
    });
    const onlyColors = (pixels: number[][], palette: number[][]) =>
        pixels.length > 0 && pixels.every(pixel =>
            palette.some(color => color.every((channel, i) => channel === pixel[i]))
        );
    for (const pixels of [result.rect, result.component]) {
        expect(pixels).toEqual(expect.arrayContaining([green, yellow]));
        expect(onlyColors(pixels, [green, yellow])).toBe(true);
    }
    expect(result.polygon).toEqual(expect.arrayContaining([red, blue]));
    expect(result.polygonPeriod[0]).toEqual(result.polygonPeriod[1]);
});

test("texturing preserves stroke silhouettes, tint, opacity and later draws", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, render, pixel } = (window as any).fixture;
        const silhouettes = [];
        for (const join of ["bevel", "round", "miter"]) {
            for (const cap of ["butt", "square", "round"]) {
                const opt = {
                    pts: [k.vec2(15, 20), k.vec2(55, 40), k.vec2(95, 15)],
                    width: 12,
                    join,
                    cap,
                    bias: 0.2,
                };
                const solid = render(() => k.drawLines(opt));
                const textured = render(() =>
                    k.drawLines({
                        ...opt,
                        texture: { sprite: "white", repeatLength: 13 },
                    })
                );
                let matches = true;
                for (let y = 1; y < 127; y++) {
                    for (let x = 1; x < 127; x++) {
                        const center = (y * 128 + x) * 4;
                        const inside = solid[center + 3] > 250;
                        const uniform = [-1, 0, 1].every(dy =>
                            [-1, 0, 1].every(dx =>
                                (solid[((y + dy) * 128 + x + dx) * 4 + 3] > 250)
                                    === inside
                            )
                        );
                        if (
                            uniform && (textured[center + 3] > 250) !== inside
                        ) matches = false;
                    }
                }
                silhouettes.push(matches);
            }
        }
        const sharpTurn = {
            pts: [k.vec2(40, 90), k.vec2(64, 30), k.vec2(88, 90)],
            width: 24,
            join: "round",
            cap: "square",
            bias: 0.2,
        };
        const solidTurn = render(() => k.drawLines(sharpTurn));
        const texturedTurn = render(() =>
            k.drawLines({
                ...sharpTurn,
                texture: { sprite: "white", repeatLength: 3 },
            })
        );
        let turnMatches = true;
        for (let y = 4; y < 124; y++) {
            for (let x = 4; x < 124; x++) {
                const alpha = (px: number, py: number) =>
                    solidTurn[(py * 128 + px) * 4 + 3] > 250;
                const inside = alpha(x, y);
                const awayFromEdge = [-3, -2, -1, 0, 1, 2, 3].every(dy =>
                    [-3, -2, -1, 0, 1, 2, 3].every(dx =>
                        alpha(x + dx, y + dy) === inside
                    )
                );
                if (
                    awayFromEdge
                    && (texturedTurn[(y * 128 + x) * 4 + 3] > 250) !== inside
                ) turnMatches = false;
            }
        }
        silhouettes.push(turnMatches);
        const image = render(() => {
            k.pushTransform();
            k.pushTranslate(k.vec2(10, 5));
            k.pushScale(k.vec2(2, 1));
            k.drawLine({
                p1: k.vec2(5, 25),
                p2: k.vec2(50, 25),
                width: 8,
                color: k.rgb(128, 255, 255),
                opacity: 0.5,
                texture: { sprite: "stripe", repeatLength: 16 },
            });
            k.popTransform();
            k.drawRect({
                pos: k.vec2(10, 60),
                width: 10,
                height: 10,
                color: k.rgb(0, 255, 0),
            });
            k.drawLine({
                p1: k.vec2(10, 90),
                p2: k.vec2(60, 90),
                width: 6,
                color: k.rgb(0, 0, 255),
            });
        });
        return {
            silhouettes,
            pixels: [
                pixel(image, 24, 30),
                pixel(image, 42, 30),
                pixel(image, 15, 65),
                pixel(image, 25, 90),
            ],
        };
    });
    expect(result.silhouettes.every(Boolean)).toBe(true);
    expect(result.pixels[0][0]).toBeGreaterThanOrEqual(62);
    expect(result.pixels[0][0]).toBeLessThanOrEqual(66);
    expect(result.pixels[0][1]).toBe(0);
    expect(result.pixels[1][0]).toBe(0);
    expect(result.pixels[1][2]).toBeGreaterThanOrEqual(125);
    expect(result.pixels.slice(2)).toEqual([green, blue]);

    const tintResult = await page.evaluate(() => {
        const { k, render, pixel } = (window as any).fixture;
        const color = k.rgb(80, 160, 240);
        const draw = (textured: boolean) =>
            render(() => {
                const texture = textured
                    ? { sprite: "white", repeatLength: 1000 }
                    : undefined;
                k.drawLines({
                    pts: [k.vec2(10, 20), k.vec2(90, 20), k.vec2(90, 50)],
                    width: 8,
                    color,
                    opacity: 0.5,
                    join: "bevel",
                    texture,
                });
                k.drawRect({
                    pos: k.vec2(20, 80),
                    width: 80,
                    height: 30,
                    fill: false,
                    opacity: 0.5,
                    outline: { width: 8, color, texture },
                });
            });
        const solid = draw(false);
        const textured = draw(true);
        return [[40, 20], [90, 40], [50, 80], [100, 100]].map(([x, y]) => ({
            solid: pixel(solid, x, y),
            textured: pixel(textured, x, y),
        }));
    });
    for (const sample of tintResult) {
        expect(sample.solid[3]).toBeGreaterThan(0);
        for (let channel = 0; channel < 4; channel++) {
            expect(Math.abs(sample.textured[channel] - sample.solid[channel]))
                .toBeLessThanOrEqual(2);
        }
    }
});

test("curves and Bezier textures keep tint, opacity and transforms", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, render } = (window as any).fixture;
        const color = k.rgb(128, 255, 255);
        const texture = { sprite: "stripe", repeatLength: 16 };
        const bezierOptions = {
            pt1: k.vec2(8, 15),
            pt2: k.vec2(30, 90),
            pt3: k.vec2(75, 5),
            pt4: k.vec2(115, 75),
            segments: 32,
            width: 9,
            color,
            opacity: 0.5,
            texture,
        };
        const curveOptions = {
            segments: 32,
            width: 9,
            color,
            opacity: 0.5,
            texture,
        };
        const transform = (transformed: boolean) => {
            k.pushTransform();
            if (transformed) {
                k.pushTranslate(k.vec2(3, 4));
                k.pushScale(k.vec2(1.04, 0.9));
            }
        };
        const drawBezier = (transformed: boolean) => render(() => {
            transform(transformed);
            k.drawBezier(bezierOptions);
            k.popTransform();
        });
        const drawCurve = (transformed: boolean) => render(() => {
            transform(transformed);
            k.drawCurve(
                t => k.vec2(8 + 107 * t, 20 + 55 * Math.sin(Math.PI * t)),
                curveOptions,
            );
            k.popTransform();
        });
        const stats = (image: number[]) => {
            let red = 0;
            let blue = 0;
            let translucent = 0;
            let minX = 128, maxX = -1, minY = 128, maxY = -1;
            for (let y = 0; y < 128; y++) {
                for (let x = 0; x < 128; x++) {
                    const i = (y * 128 + x) * 4;
                    const [r, g, b, a] = image.slice(i, i + 4);
                    if (a > 0) {
                        minX = Math.min(minX, x);
                        maxX = Math.max(maxX, x);
                        minY = Math.min(minY, y);
                        maxY = Math.max(maxY, y);
                    }
                    if (a >= 100 && a <= 160) translucent++;
                    if (a > 100 && r > 40 && r < 100 && g < 10 && b < 10) red++;
                    if (a > 100 && b > 80 && b < 180 && r < 10 && g < 10) blue++;
                }
            }
            return { red, blue, translucent, bounds: [minX, minY, maxX, maxY] };
        };
        return [
            { plain: stats(drawBezier(false)), transformed: stats(drawBezier(true)) },
            { plain: stats(drawCurve(false)), transformed: stats(drawCurve(true)) },
        ];
    });
    for (const { plain, transformed } of result) {
        for (const image of [plain, transformed]) {
            expect(image.red).toBeGreaterThan(10);
            expect(image.blue).toBeGreaterThan(10);
            expect(image.translucent).toBeGreaterThan(50);
        }
        expect(transformed.bounds).not.toEqual(plain.bounds);
    }
});

test("selected unequal-width frames set the default repetition distance", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const { k, render, pixel, picture } = (window as any).fixture;
        const source = picture(14, 8, ["magenta"]);
        const ctx = source.getContext("2d")!;
        ctx.fillStyle = "lime";
        ctx.fillRect(4, 0, 5, 8);
        ctx.fillStyle = "yellow";
        ctx.fillRect(9, 0, 5, 8);
        await k.loadSprite("unequal", source, {
            frames: [k.quad(0, 0, 4, 8), k.quad(4, 0, 10, 8)],
        });
        const defaultFrame = { sprite: "unequal", frame: 1 };
        const explicitFrame = { sprite: "unequal", frame: 1, repeatLength: 10 };
        const image = render(() => {
            k.drawLine({ p1: k.vec2(10, 20), p2: k.vec2(110, 20), width: 8, texture: defaultFrame });
            k.drawLine({ p1: k.vec2(10, 40), p2: k.vec2(110, 40), width: 8, texture: explicitFrame });
            k.drawLines({
                pts: [k.vec2(10, 60), k.vec2(85, 60), k.vec2(85, 110)],
                width: 8, join: "bevel", texture: defaultFrame,
            });
            k.drawLines({
                pts: [k.vec2(10, 80), k.vec2(85, 80), k.vec2(85, 110)],
                width: 8, join: "bevel", texture: explicitFrame,
            });
        });
        const samples = (y: number) =>
            Array.from({ length: 55 }, (_, i) => pixel(image, 15 + i, y));
        const colors = (y: number) => {
            const found = new Map<string, number[]>();
            for (const value of samples(y)) {
                if (value[3] > 250) found.set(value.slice(0, 3).join(","), value);
            }
            return [...found.values()];
        };
        const matchingFraction = (a: number[][], b: number[][]) =>
            a.filter((value, i) => value.every((channel, c) => channel === b[i][c])).length / a.length;
        return {
            directMatch: matchingFraction(samples(20), samples(40)),
            connectedMatch: matchingFraction(samples(60), samples(80)),
            colors: [colors(20), colors(60)],
        };
    });
    expect(result.directMatch).toBeGreaterThan(0.95);
    expect(result.connectedMatch).toBeGreaterThan(0.95);
    for (const pixels of result.colors) {
        expect(pixels).toEqual(expect.arrayContaining([green, yellow]));
        expect(pixels.every(pixel => [green, yellow].some(color =>
            color.every((channel, i) => channel === pixel[i])
        ))).toBe(true);
    }
});

test("frame and repeat defaults carry through curves and shape outlines", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const { k, render, pixel, picture } = (window as any).fixture;
        const source = picture(14, 8, ["magenta"]);
        const ctx = source.getContext("2d")!;
        ctx.fillStyle = "lime";
        ctx.fillRect(4, 0, 5, 8);
        ctx.fillStyle = "yellow";
        ctx.fillRect(9, 0, 5, 8);
        await k.loadSprite("unequal-defaults", source, {
            frames: [k.quad(0, 0, 4, 8), k.quad(4, 0, 10, 8)],
        });
        const drawLine = (texture: object) =>
            render(() => k.drawLine({
                p1: k.vec2(10, 20),
                p2: k.vec2(110, 20),
                width: 8,
                texture,
            }));
        const drawLines = (texture: object) =>
            render(() => k.drawLines({
                pts: [k.vec2(10, 20), k.vec2(110, 20)],
                width: 8,
                texture,
            }));
        const drawCurve = (texture: object) =>
            render(() => k.drawCurve(t => k.vec2(10 + 100 * t, 20), {
                segments: 32,
                width: 8,
                texture,
            }));
        const drawBezier = (texture: object) =>
            render(() => k.drawBezier({
                pt1: k.vec2(10, 40),
                pt2: k.vec2(40, 40),
                pt3: k.vec2(80, 40),
                pt4: k.vec2(110, 40),
                segments: 32,
                width: 8,
                texture,
            }));
        const drawOutline = (texture: object) =>
            render(() => k.drawRect({
                pos: k.vec2(10, 70),
                width: 100,
                height: 25,
                fill: false,
                outline: { width: 8, texture },
            }));
        const equal = (a: number[], b: number[]) =>
            a.every((channel, index) => channel === b[index]);
        const matchingFraction = (a: number[], b: number[]) => {
            let matches = 0;
            for (let i = 0; i < a.length; i += 4) {
                if (equal(a.slice(i, i + 4), b.slice(i, i + 4))) matches++;
            }
            return matches / (a.length / 4);
        };
        const hasColors = (image: number[], y: number, palette: number[][]) => {
            const seen = new Set<string>();
            for (let x = 10; x < 115; x++) {
                const value = pixel(image, x, y);
                if (value[3] > 250) seen.add(value.slice(0, 3).join(","));
            }
            return palette.map(color => seen.has(color.slice(0, 3).join(",")));
        };
        const defaultLineFrame = drawLine({ sprite: "frames", repeatLength: 12 });
        const defaultLinesFrame = drawLines({ sprite: "frames", repeatLength: 12 });
        const defaultCurveFrame = drawCurve({ sprite: "frames", repeatLength: 12 });
        const defaultBezierFrame = drawBezier({ sprite: "frames", repeatLength: 12 });
        const defaultOutlineFrame = drawOutline({ sprite: "frames", repeatLength: 12 });
        const frameDefaults = [
            matchingFraction(defaultLineFrame, drawLine({ sprite: "frames", frame: 0, repeatLength: 12 })),
            matchingFraction(defaultLinesFrame, drawLines({ sprite: "frames", frame: 0, repeatLength: 12 })),
            matchingFraction(
                defaultCurveFrame,
                drawCurve({ sprite: "frames", frame: 0, repeatLength: 12 }),
            ),
            matchingFraction(defaultBezierFrame, drawBezier({ sprite: "frames", frame: 0, repeatLength: 12 })),
            matchingFraction(
                defaultOutlineFrame,
                drawOutline({ sprite: "frames", frame: 0, repeatLength: 12 }),
            ),
        ];
        const repeatCases = [
            {
                default: drawCurve({ sprite: "unequal-defaults", frame: 1 }),
                explicit: drawCurve({ sprite: "unequal-defaults", frame: 1, repeatLength: 10 }),
                y: 20,
            },
            {
                default: drawBezier({ sprite: "unequal-defaults", frame: 1 }),
                explicit: drawBezier({ sprite: "unequal-defaults", frame: 1, repeatLength: 10 }),
                y: 40,
            },
            {
                default: drawOutline({ sprite: "unequal-defaults", frame: 1 }),
                explicit: drawOutline({ sprite: "unequal-defaults", frame: 1, repeatLength: 10 }),
                y: 70,
            },
        ];
        return {
            frameDefaults,
            frameColors: [
                hasColors(defaultLineFrame, 20, [[255, 0, 0], [0, 0, 255]]),
                hasColors(defaultLinesFrame, 20, [[255, 0, 0], [0, 0, 255]]),
                hasColors(defaultCurveFrame, 20, [[255, 0, 0], [0, 0, 255]]),
                hasColors(defaultBezierFrame, 40, [[255, 0, 0], [0, 0, 255]]),
                hasColors(defaultOutlineFrame, 70, [[255, 0, 0], [0, 0, 255]]),
            ],
            repeatDefaults: repeatCases.map(({ default: a, explicit: b }) =>
                matchingFraction(a, b)
            ),
            repeatColors: repeatCases.map(({ default: image, y }) =>
                hasColors(image, y, [[0, 255, 0], [255, 255, 0]])
            ),
        };
    });
    for (const match of [...result.frameDefaults, ...result.repeatDefaults]) {
        expect(match).toBeGreaterThan(0.995);
    }
    for (const colors of [...result.frameColors, ...result.repeatColors]) {
        expect(colors).toEqual([true, true]);
    }
});

test("degenerate paths and outlines reject invalid texture descriptors", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, render } = (window as any).fixture;
        const draws: Record<string, (texture: any) => void> = {
            polygon: texture =>
                k.drawPolygon({
                    pts: [k.vec2(10), k.vec2(20)],
                    outline: { texture },
                }),
            rectangle: texture =>
                k.drawRect({ width: 0, height: 20, outline: { texture } }),
            ellipse: texture =>
                k.drawEllipse({
                    radiusX: 0,
                    radiusY: 20,
                    outline: { texture },
                }),
            circle: texture =>
                k.drawCircle({ radius: 0, outline: { texture } }),
        };
        const throws = (action: () => void) => {
            try {
                action();
                return false;
            } catch {
                return true;
            }
        };
        const outlines = Object.entries(draws).map(([shape, draw]) => ({
            shape,
            valid: throws(() => draw({ sprite: "stripe" })),
            invalidFrame: throws(() => draw({ sprite: "stripe", frame: 99 })),
            invalidRepeat: throws(() =>
                draw({ sprite: "stripe", repeatLength: 0 })
            ),
        }));
        const pathDraws = [
            {
                name: "line",
                draw: () => k.drawLine({
                    p1: k.vec2(20), p2: k.vec2(20), width: 6,
                    texture: { sprite: "stripe", frame: 99 },
                }),
            },
            {
                name: "connected line",
                draw: () => k.drawLines({
                    pts: [k.vec2(20)], width: 6,
                    texture: { sprite: "stripe", repeatLength: 0 },
                }),
            },
            {
                name: "curve",
                draw: () => k.drawCurve(() => k.vec2(20), {
                    segments: 8, width: 6,
                    texture: { sprite: "stripe", frame: 99 },
                }),
            },
            {
                name: "Bezier",
                draw: () => k.drawBezier({
                    pt1: k.vec2(20), pt2: k.vec2(20),
                    pt3: k.vec2(20), pt4: k.vec2(20),
                    width: 6,
                    texture: { sprite: "stripe", repeatLength: 0 },
                }),
            },
        ];
        const invalidPaths = pathDraws.map(({ name, draw }) => {
            let rejected = false;
            render(() => {
                try {
                    draw();
                } catch (error) {
                    rejected = error instanceof Error;
                }
            });
            return { name, rejected };
        });
        return { outlines, invalidPaths };
    });
    for (const { shape, valid, invalidFrame, invalidRepeat } of result.outlines) {
        expect(valid, `${shape}: valid descriptor`).toBe(false);
        expect.soft(invalidFrame, `${shape}: invalid frame`).toBe(true);
        expect.soft(invalidRepeat, `${shape}: invalid repeat length`).toBe(
            true,
        );
    }
    for (const { name, rejected } of result.invalidPaths) {
        expect(rejected, `${name}: invalid descriptor`).toBe(true);
    }
});

test("invalid descriptors reject while pending and missing names match sprite drawing", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const { k, render, pixel, picture } = (window as any).fixture;
        const rejects = (action: () => void) => {
            try {
                action();
                return false;
            } catch {
                return true;
            }
        };
        const invalid = [
            { frame: -1 },
            { frame: 0.5 },
            { frame: 99 },
            { frame: NaN },
            { repeatLength: 0 },
            { repeatLength: -2 },
            { repeatLength: Infinity },
            { repeatLength: NaN },
        ].map(value =>
            rejects(() =>
                k.drawLine({
                    p1: k.vec2(10),
                    p2: k.vec2(50),
                    texture: { sprite: "stripe", ...value },
                })
            )
        );
        const missingSprite = rejects(() => k.drawSprite({ sprite: "absent" }));
        const missingStroke = rejects(() =>
            k.drawLine({
                p1: k.vec2(10),
                p2: k.vec2(50),
                texture: { sprite: "absent" },
            })
        );
        const loading = k.loadSprite(
            "later",
            picture(8, 8, ["lime"]).toDataURL(),
        );
        const pendingEmptySprite = rejects(() =>
            k.drawLine({
                p1: k.vec2(10),
                p2: k.vec2(50),
                texture: { sprite: "" },
            })
        );
        const pending = render(() => {
            k.drawLine({
                p1: k.vec2(10, 20),
                p2: k.vec2(90, 20),
                width: 8,
                texture: { sprite: "later" },
            });
            k.drawSprite({ sprite: "later", pos: k.vec2(10, 50) });
        });
        await loading;
        const loaded = render(() =>
            k.drawLine({
                p1: k.vec2(10, 20),
                p2: k.vec2(90, 20),
                width: 8,
                texture: { sprite: "later" },
            })
        );
        const otherInvalid = [
            () =>
                k.drawLines({
                    pts: [k.vec2(10)],
                    texture: { sprite: "stripe", frame: -1 },
                }),
            () =>
                k.drawLine({
                    p1: k.vec2(10),
                    p2: k.vec2(50),
                    texture: {},
                }),
            () =>
                k.drawLine({
                    p1: k.vec2(10),
                    p2: k.vec2(50),
                    texture: { sprite: "" },
                }),
            () =>
                k.drawLines({
                    pts: [k.vec2(10), k.vec2(40)],
                    texture: { sprite: "stripe", repeatLength: 0 },
                }),
            () =>
                k.drawCurve(t => k.vec2(t * 40), {
                    texture: { sprite: "stripe", frame: 99 },
                }),
            () =>
                k.drawBezier({
                    pt1: k.vec2(10),
                    pt2: k.vec2(20),
                    pt3: k.vec2(30),
                    pt4: k.vec2(40),
                    texture: { sprite: "stripe", repeatLength: NaN },
                }),
            () =>
                k.drawRect({
                    pos: k.vec2(30),
                    width: 20,
                    height: 20,
                    outline: { texture: { sprite: "stripe", frame: -1 } },
                }),
        ].map(rejects);
        return {
            invalid: [...invalid, ...otherInvalid],
            missingSprite,
            missingStroke,
            pendingEmptySprite,
            pendingStroke: pixel(pending, 12, 20),
            pendingSprite: pixel(pending, 12, 52),
            loaded: pixel(loaded, 12, 20),
        };
    });
    expect(result.invalid.every(Boolean)).toBe(true);
    expect(result.missingStroke).toBe(result.missingSprite);
    expect(result.missingStroke).toBe(true);
    expect(result.pendingEmptySprite).toBe(true);
    expect(result.pendingStroke).toEqual(result.pendingSprite);
    expect(result.loaded).toEqual(green);
});

test("unrepresentably dense finite repetitions fail promptly", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, render, pixel } = (window as any).fixture;
        const ordinary = render(() => k.drawLine({
            p1: k.vec2(10, 20),
            p2: k.vec2(30, 20),
            width: 8,
            texture: { sprite: "white", repeatLength: 2 },
        }));
        const ordinaryPixel = pixel(ordinary, 15, 20);
        const rejected = [Number.MIN_VALUE, 1e-300].map(repeatLength => {
            let threw = false;
            render(() => {
                try {
                    k.drawLine({
                        p1: k.vec2(10, 20),
                        p2: k.vec2(30, 20),
                        width: 8,
                        texture: { sprite: "white", repeatLength },
                    });
                } catch (error) {
                    threw = error instanceof Error;
                }
            });
            return threw;
        });
        let outlineRejected = false;
        render(() => {
            try {
                k.drawRect({
                    pos: k.vec2(50, 50),
                    width: 20,
                    height: 20,
                    fill: false,
                    outline: {
                        texture: {
                            sprite: "white",
                            repeatLength: 1e-300,
                        },
                    },
                });
            } catch (error) {
                outlineRejected = error instanceof Error;
            }
        });
        return { ordinaryPixel, rejected, outlineRejected };
    });
    expect(result.ordinaryPixel[3]).toBeGreaterThan(0);
    expect(result.ordinaryPixel.slice(0, 3)).toEqual([255, 255, 255]);
    expect(result.rejected).toEqual([true, true]);
    expect(result.outlineRejected).toBe(true);
});

test("rounded primitives and nonlinear curves retain textured output", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const { k, render, picture } = (window as any).fixture;
        await k.loadSprite(
            "linear-frames",
            picture(24, 8, ["blue", "blue", "lime", "yellow"]),
            { sliceX: 2, filter: "linear" },
        );
        const texture = {
            sprite: "linear-frames",
            frame: 1,
            repeatLength: 13,
        };
        const outline = { width: 10, texture };
        const pictures = [
            () =>
                k.drawCircle({
                    pos: k.vec2(60, 60),
                    radius: 35,
                    fill: false,
                    outline,
                }),
            () =>
                k.drawEllipse({
                    pos: k.vec2(60, 60),
                    radiusX: 42,
                    radiusY: 23,
                    fill: false,
                    outline,
                }),
            () =>
                k.drawRect({
                    pos: k.vec2(20, 20),
                    width: 80,
                    height: 65,
                    radius: 15,
                    angle: 5,
                    fill: false,
                    outline,
                }),
            () =>
                k.drawCurve(t => k.vec2(15 + t * 95, 30 + 40 * t * t), {
                    segments: 24,
                    width: 10,
                    texture,
                }),
            () =>
                k.drawBezier({
                    pt1: k.vec2(15, 20),
                    pt2: k.vec2(80, 25),
                    pt3: k.vec2(20, 90),
                    pt4: k.vec2(110, 95),
                    segments: 24,
                    width: 10,
                    texture,
                }),
        ];
        return pictures.map(action => {
            const data = render(action);
            let opaque = 0, green = 0, yellow = 0, outside = 0;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] < 250) continue;
                opaque++;
                if (data[i] < 30 && data[i + 1] > 240) green++;
                if (data[i] > 240 && data[i + 1] > 240) yellow++;
                if (data[i + 2] > 1 || data[i + 1] < 240) outside++;
            }
            return { opaque, green, yellow, outside };
        });
    });
    for (const shape of result) {
        expect(shape.opaque).toBeGreaterThan(100);
        expect(shape.green).toBeGreaterThan(10);
        expect(shape.yellow).toBeGreaterThan(10);
        expect(shape.outside).toBe(0);
    }
});
test("sprite texture spans both sides of tessellated strokes", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, render, pixel } = (window as any).fixture;
        const texture = { sprite: "checker", repeatLength: 20 };
        const line = render(() => k.drawLine({
            p1: k.vec2(20, 10), p2: k.vec2(100, 10), width: 12, texture,
        }));
        const lines = render(() => k.drawLines({
            pts: [k.vec2(20, 30), k.vec2(100, 30)], width: 12, texture,
        }));
        const curve = render(() => k.drawCurve(
            t => k.vec2(20 + 80 * t, 50), { segments: 16, width: 12, texture },
        ));
        const bezier = render(() => k.drawBezier({
            pt1: k.vec2(20, 70), pt2: k.vec2(45, 70),
            pt3: k.vec2(75, 70), pt4: k.vec2(100, 70),
            segments: 16, width: 12, texture,
        }));
        const outline = render(() => k.drawRect({
            pos: k.vec2(20, 100), width: 80, height: 20, fill: false,
            outline: { width: 12, texture },
        }));
        const bothSides = (image: number[], y: number) => [
            pixel(image, 30, y - 3), pixel(image, 30, y + 3),
        ];
        return {
            line: bothSides(line, 10),
            lines: bothSides(lines, 30),
            curve: bothSides(curve, 50),
            bezier: bothSides(bezier, 70),
            outline: bothSides(outline, 100),
        };
    });
    for (const sides of Object.values(result)) {
        expect(sides[0]).not.toEqual(sides[1]);
    }
});

test("outline texture survives a prefab round trip", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, render, pixel } = (window as any).fixture;
        const object = k.add([
            k.rect(40, 30, { fill: false }),
            k.outline(8, k.WHITE),
        ]);
        object.outline.texture = {
            sprite: "frames",
            frame: 1,
            repeatLength: 20,
        };
        const sample = (image: number[]) =>
            [4, 14, 24].map(x => pixel(image, x, 1));
        const before = sample(render(() => object.draw()));
        const saved = JSON.parse(JSON.stringify(object.serialize()));
        const restored = k.addPrefab(saved);
        const after = sample(render(() => restored.draw()));
        const circle = k.add([
            k.circle(18),
            k.outline(8, k.WHITE),
            k.pos(48, 48),
        ]);
        circle.outline.texture = {
            sprite: "frames",
            frame: 1,
            repeatLength: 12,
        };
        const circleBefore = render(() => circle.draw());
        const circleRestored = k.addPrefab(
            JSON.parse(JSON.stringify(circle.serialize())),
        );
        const circleAfter = render(() => circleRestored.draw());
        let circleShowsSelectedFrame = false;
        for (let i = 0; i < circleBefore.length; i += 4) {
            const isGreen = circleBefore[i] === 0
                && circleBefore[i + 1] === 255
                && circleBefore[i + 2] === 0;
            const isYellow = circleBefore[i] === 255
                && circleBefore[i + 1] === 255
                && circleBefore[i + 2] === 0;
            if (circleBefore[i + 3] > 0 && (isGreen || isYellow)) {
                circleShowsSelectedFrame = true;
                break;
            }
        }
        return { before, after, circleBefore, circleAfter, circleShowsSelectedFrame };
    });
    expect(result.circleShowsSelectedFrame).toBe(true);
    expect(result.circleAfter).toEqual(result.circleBefore);
    expect(result.after).toEqual(result.before);
    expect(result.before.some(pixel => pixel[3] > 0)).toBe(true);
    expect(result.before.some(pixel =>
        (pixel[1] === 255 && pixel[0] === 0)
        || (pixel[0] === 255 && pixel[1] === 255 && pixel[2] === 0)
    )).toBe(true);
});

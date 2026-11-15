import { expect, test } from "@playwright/test";

// These compatibility cases use only the existing rendering API.
test.describe("layer and render-target compatibility", () => {
    test.beforeEach(async ({ page }) => {
        await page.route("http://**/*", route => route.abort());
        await page.route("https://**/*", route => route.abort());
        await page.evaluate(() => {
            let callbacks = new Map<number, FrameRequestCallback>();
            let next = 0;
            let time = performance.now();
            window.requestAnimationFrame = callback => {
                callbacks.set(++next, callback);
                return next;
            };
            window.cancelAnimationFrame = id => callbacks.delete(id);
            (window as any).advance = (count = 1) => {
                for (let i = 0; i < count; i++) {
                    time += 1000 / 60;
                    const current = callbacks;
                    callbacks = new Map();
                    for (const callback of current.values()) callback(time);
                }
            };
        });
        await page.addScriptTag({ path: "dist/kaplay.js" });
        await page.evaluate(() => {
            (window as any).make = async (options = {}) => {
                const k = kaplay({
                    width: 200,
                    height: 200,
                    pixelDensity: 1,
                    background: [0, 0, 0],
                    global: false,
                    loadingScreen: false,
                    ...options,
                });
                for (let i = 0; i < 2000; i++) {
                    if (k.loadProgress() === 1) break;
                    await new Promise(resolve => setTimeout(resolve, 5));
                }
                if (k.loadProgress() !== 1) {
                    throw new Error("Default assets did not load");
                }
                (window as any).advance(3);
                return k;
            };
            (window as any).pixel = (x: number, y: number) => {
                const canvas = document.querySelector("canvas")!;
                const gl = canvas.getContext("webgl")!;
                const pixel = new Uint8Array(4);
                gl.readPixels(
                    x,
                    canvas.height - y - 1,
                    1,
                    1,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    pixel,
                );
                return Array.from(pixel);
            };
        });
    });

    test("configured layer names render in order without layer hooks", async ({ page }) => {
        const result = await page.evaluate(async () => {
            const k = await (window as any).make();
            k.setLayers(["constructor", "toString"], "constructor");
            const seen: string[] = [];
            k.add([
                k.rect(8, 8),
                k.pos(10, 10),
                k.layer("constructor"),
                k.color(255, 0, 0),
            ]).onDraw(() => seen.push("constructor"));
            k.add([
                k.rect(8, 8),
                k.pos(30, 10),
                k.layer("toString"),
                k.color(0, 255, 0),
            ]).onDraw(() => seen.push("toString"));
            (window as any).advance(2);
            seen.length = 0;
            (window as any).advance();
            return {
                seen,
                red: (window as any).pixel(12, 12)[0],
                green: (window as any).pixel(32, 12)[1],
            };
        });
        expect(result.seen).toEqual(["constructor", "toString"]);
        expect(result.red).toBeGreaterThan(100);
        expect(result.green).toBeGreaterThan(100);
    });

    test("FrameBuffer contents remain independent of surrounding Picture capture", async ({ page }) => {
        const result = await page.evaluate(async () => {
            const k = await (window as any).make();
            k.setLayers(["capture", "display"], "capture");
            const picture = new k.Picture();
            const canvas = k.makeCanvas(32, 32);
            const outer = k.add([k.drawon(picture), k.layer("capture")]);
            outer.add([k.pos(40, 40), k.rect(10, 10), k.color(0, 255, 0)]);
            const inner = outer.add([
                k.drawon(canvas.fb, { childrenOnly: true }),
            ]);
            inner.add([k.pos(4, 4), k.rect(12, 12), k.color(255, 0, 0)]);
            k.add([k.layer("display"), {
                draw() {
                    k.drawPicture(picture, {});
                },
            }]);
            (window as any).advance(2);
            const data = canvas.toImageData().data;
            let red = 0;
            for (let i = 0; i < data.length; i += 4) {
                red = Math.max(red, data[i]);
            }
            return {
                red,
                green: (window as any).pixel(45, 45)[1],
                leak: (window as any).pixel(5, 5)[0],
            };
        });
        expect(result.red).toBeGreaterThan(100);
        expect(result.green).toBeGreaterThan(100);
        expect(result.leak).toBeLessThan(40);
    });
    test("zero shake intensity preserves an existing shake without hooks", async ({ page }) => {
        const result = await page.evaluate(async () => {
            const k = await (window as any).make();
            k.setCamPos(100, 100);
            k.shake(40);
            k.shake(0);
            (window as any).advance();
            const point = k.toScreen(k.vec2(100, 100));
            k.quit();
            (window as any).advance();
            return Math.hypot(point.x - 100, point.y - 100);
        });
        expect(result).toBeGreaterThan(30);
    });
    test("outer masks keep clipping after nested masks and Picture targets", async ({ page }) => {
        for (const picture of [false, true]) {
            const result = await page.evaluate(async picture => {
                const k = await (window as any).make();
                const outer = k.add([k.rect(60, 60), k.mask("intersect")]);
                const target = picture
                    ? outer.add([
                        k.drawon(new k.Picture(), { childrenOnly: true }),
                    ])
                    : outer;
                const inner = target.add([k.rect(12, 12), k.mask("intersect")]);
                inner.add([k.rect(32, 32), k.color(0, 0, 255)]);
                outer.add([k.rect(100, 60), k.color(255, 0, 0)]);
                (window as any).advance(2);
                const pixels = {
                    inside: (window as any).pixel(30, 30)[0],
                    outside: (window as any).pixel(80, 30)[0],
                };
                k.quit();
                (window as any).advance();
                return pixels;
            }, picture);
            expect(result.inside).toBeGreaterThan(100);
            expect(result.outside).toBeLessThan(40);
        }
    });
});

import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

test.beforeEach(async ({ page }) => {
    await page.context().setOffline(true);
    await page.addScriptTag({ path: "dist/kaplay.js" });
    await page.evaluate(() => {
        // Drive frames explicitly so cache assertions do not depend on frame timing.
        let next = 0;
        const frames = new Map<number, FrameRequestCallback>();
        window.requestAnimationFrame = f => {
            frames.set(++next, f);
            return next;
        };
        window.cancelAnimationFrame = n => {
            frames.delete(n);
        };
        const frame = () => {
            const pending = [...frames.values()];
            frames.clear();
            pending.forEach(f => f(performance.now()));
        };
        const k = kaplay({
            global: false,
            width: 64,
            height: 48,
            pixelDensity: 1,
            background: [0, 0, 0],
        });
        const gl = k.canvas.getContext("webgl")!;
        const paint = (canvas: any, color = k.RED) =>
            canvas.draw(() => {
                k.drawRect({ width: k.width(), height: k.height(), color });
            });
        const pixel = (canvas: any) =>
            Array.from(canvas.toImageData().data.slice(0, 4));
        const throws = (action: () => void) => {
            try {
                action();
                return false;
            } catch {
                return true;
            }
        };
        (window as any).canvasTest = { k, gl, paint, pixel, throws, frame };
    });
});

test("fixed resizing rounds dimensions, retains identity, and starts transparent", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, paint, pixel } = (window as any).canvasTest;
        const c = k.makeCanvas(5.2, 3.1), handle = c, first = c.fb;
        const initial = [c.width, c.height];
        paint(c);
        c.resize(5.8, 3.9);
        const unchanged = [c.fb === first, pixel(c)];
        c.resize(9.2, 6.4);
        const larger = [
            c === handle,
            c.fb !== first,
            c.width,
            c.height,
            pixel(c),
        ];
        paint(c, k.BLUE);
        c.resize(2, 1);
        c.syncSize();
        return {
            initial,
            unchanged,
            larger,
            smaller: [c.width, c.height, pixel(c)],
        };
    });
    expect(result).toEqual({
        initial: [6, 4],
        unchanged: [true, [255, 0, 0, 255]],
        larger: [true, true, 10, 7, [0, 0, 0, 0]],
        smaller: [2, 1, [0, 0, 0, 0]],
    });
});

test("live object dimensions are sampled only at synchronization boundaries", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k } = (window as any).canvasTest;
        const source = k.add([k.rect(6.1, 4.2), k.scale(3), k.rotate(45)]);
        const c = k.makeCanvas(source), fb = c.fb;
        source.width = 11.3;
        source.height = 8.7;
        const passive = [c.width, c.height, c.fb === fb];
        c.syncSize();
        return { passive, active: [c.width, c.height, c.fb !== fb] };
    });
    expect(result).toEqual({ passive: [7, 5, true], active: [12, 9, true] });
});

for (
    const operation of [
        "draw",
        "clear",
        "toImageData",
        "toDataURL",
        "drawCanvas",
        "drawon",
    ]
) {
    test(`${operation} synchronizes a changed source before use`, async ({ page }) => {
        const result = await page.evaluate(async operation => {
            const { k, paint } = (window as any).canvasTest;
            const size = { width: 6, height: 4 },
                c = k.makeCanvas(size),
                before = c.fb;
            paint(c);
            size.width = 13.2;
            size.height = 9.1;
            let output: any = null;
            if (operation === "draw") {
                c.draw(() => {
                    output = [c.width, c.height];
                });
            }
            else if (operation === "drawCanvas") k.drawCanvas({ canvas: c });
            else if (operation === "drawon") {
                const obj = k.add([k.drawon(c), {
                    draw() {
                        output = [c.width, c.height];
                    },
                }]);
                obj.draw();
            }
            else if (operation === "toImageData") {
                const data = c.toImageData();
                output = [data.width, data.height];
            }
            else if (operation === "toDataURL") {
                const image = new Image();
                image.src = c.toDataURL();
                await image.decode();
                output = [image.width, image.height];
            }
            else {
                (window as any).canvasTest.gl.clearColor(0, 0, 0, 0);
                c.clear();
            }
            const synchronized = [c.width, c.height];
            const replaced = c.fb !== before;
            const pixels = c.toImageData();
            return {
                size: synchronized,
                replaced,
                output,
                transparent: pixels.data.every((n: number) => n === 0),
            };
        }, operation);
        expect(result.size).toEqual([14, 10]);
        expect(result.replaced).toBe(true);
        expect(result.transparent).toBe(true);
        if (!["clear", "drawCanvas"].includes(operation)) {
            expect(result.output).toEqual([14, 10]);
        }
    });
}

test("screen source follows logical dimensions after a real container resize", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const { frame } = (window as any).canvasTest;
        const root = document.createElement("div");
        root.style.cssText = "width: 120px; height: 80px";
        document.body.append(root);
        const k = kaplay({ global: false, root, pixelDensity: 2 });
        const c = k.makeCanvas("screen");
        const initial = [c.width, c.height, k.width(), k.height()];
        await new Promise<void>(resolve => {
            const observer = new ResizeObserver(entries => {
                if (
                    entries.some(entry =>
                        entry.contentRect.width === 180
                        && entry.contentRect.height === 110
                    )
                ) {
                    observer.disconnect();
                    resolve();
                }
            });
            observer.observe(k.canvas);
            root.style.width = "180px";
            root.style.height = "110px";
        });
        frame();
        frame();
        c.syncSize();
        return { initial, final: [c.width, c.height, k.width(), k.height()] };
    });
    expect(result.initial).toEqual([120, 80, 120, 80]);
    expect(result.final).toEqual([180, 110, 180, 110]);
});

test("explicit same-size resize detaches the source, while failed resize retains it", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, paint, pixel, throws } = (window as any).canvasTest;
        const size = { width: 8, height: 6 }, c = k.makeCanvas(size);
        paint(c);
        const rejected = throws(() => c.resize(12, NaN));
        const preserved = [c.width, c.height, pixel(c)];
        size.width = 10;
        c.syncSize();
        paint(c, k.BLUE);
        const fb = c.fb;
        c.resize(9.1, 5.2);
        size.width = 20;
        size.height = 12;
        c.syncSize();
        return {
            rejected,
            preserved,
            fixed: [c.width, c.height, c.fb === fb, pixel(c)],
        };
    });
    expect(result).toEqual({
        rejected: true,
        preserved: [8, 6, [255, 0, 0, 255]],
        fixed: [10, 6, true, [0, 0, 255, 255]],
    });
});

for (const bad of [0, -1, NaN, Infinity, -Infinity]) {
    test(`invalid dimension ${String(bad)} is atomic on either axis`, async ({ page }) => {
        const result = await page.evaluate(bad => {
            const { k, paint, pixel, throws } = (window as any).canvasTest;
            const size = { width: 7, height: 5 },
                c = k.makeCanvas(size),
                fb = c.fb;
            paint(c);
            const rejected = [
                throws(() => k.makeCanvas(bad, 5)),
                throws(() => k.makeCanvas(7, bad)),
                throws(() => k.makeCanvas({ width: 7, height: bad })),
                throws(() => k.makeCanvas({ width: bad, height: 5 })),
                throws(() => c.resize(bad, 8)),
                throws(() => c.resize(9, bad)),
            ];
            size.height = bad;
            rejected.push(throws(() => c.syncSize()));
            size.height = 5;
            size.width = bad;
            rejected.push(throws(() => c.syncSize()));
            const retained = [c.width, c.height, c.fb === fb];
            size.width = 7;
            const color = pixel(c);
            size.width = 12;
            c.syncSize();
            return { rejected, retained, color, recovered: c.width };
        }, bad);
        expect(result).toEqual({
            rejected: [true, true, true, true, true, true, true, true],
            retained: [7, 5, true],
            color: [255, 0, 0, 255],
            recovered: 12,
        });
    });
}

test("clear isolates its target and nested drawing restores binding and viewport on error", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, gl, paint, pixel } = (window as any).canvasTest;
        const a = k.makeCanvas(16, 12), b = k.makeCanvas(5, 7);
        paint(a);
        paint(b, k.BLUE);
        const binding = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        const viewport = Array.from(gl.getParameter(gl.VIEWPORT));
        let innerRestored = false, propagated = false;
        const error = new Error("drawing stopped");
        try {
            a.draw(() => {
                const outer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
                const vp = Array.from(gl.getParameter(gl.VIEWPORT));
                try {
                    b.draw(() => {
                        gl.clearColor(0, 0, 0, 0);
                        b.clear();
                        throw error;
                    });
                } catch (caught) {
                    innerRestored = caught === error
                        && gl.getParameter(gl.FRAMEBUFFER_BINDING) === outer
                        && String(Array.from(gl.getParameter(gl.VIEWPORT)))
                            === String(vp);
                    throw caught;
                }
            });
        } catch (caught) {
            propagated = caught === error;
        }
        const restored = gl.getParameter(gl.FRAMEBUFFER_BINDING) === binding
            && String(Array.from(gl.getParameter(gl.VIEWPORT)))
                === String(viewport);
        const colors = [pixel(a), pixel(b)];
        paint(a, k.GREEN);
        paint(b, k.BLUE);
        gl.clearColor(0, 0, 0, 0);
        b.clear();
        return {
            innerRestored,
            propagated,
            restored,
            colors,
            later: [pixel(a), pixel(b)],
        };
    });
    expect(result).toEqual({
        innerRestored: true,
        propagated: true,
        restored: true,
        colors: [[255, 0, 0, 255], [0, 0, 0, 0]],
        later: [[0, 255, 0, 255], [0, 0, 0, 0]],
    });
});

test("resize and free reject active outer and inner targets without poisoning either", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, throws, paint, pixel } = (window as any).canvasTest;
        const size = { width: 8, height: 6 },
            a = k.makeCanvas(size),
            b = k.makeCanvas(4, 3);
        const rejected: boolean[] = [];
        a.draw(() =>
            b.draw(() => {
                rejected.push(
                    throws(() => a.resize(9, 7)),
                    throws(() => a.free()),
                    throws(() => b.resize(5, 4)),
                    throws(() => b.free()),
                );
                size.width = 10;
                rejected.push(throws(() => a.syncSize()));
            })
        );
        a.syncSize();
        b.resize(6, 5);
        paint(a);
        paint(b, k.BLUE);
        return {
            rejected,
            dimensions: [a.width, a.height, b.width, b.height],
            colors: [pixel(a), pixel(b)],
        };
    });
    expect(result).toEqual({
        rejected: [true, true, true, true, true],
        dimensions: [10, 6, 6, 5],
        colors: [[255, 0, 0, 255], [0, 0, 255, 255]],
    });
});

test("each cached consumer observes resize, including a change synchronized elsewhere", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, paint, pixel } = (window as any).canvasTest;
        const source = { width: 10, height: 8 }, c = k.makeCanvas(source);
        const counts = [0, 0];
        const consumers = counts.map((_, index) =>
            k.add([k.drawon(c, { refreshOnly: true }), {
                draw() {
                    counts[index]++;
                    k.drawRect({
                        width: 64,
                        height: 48,
                        color: index ? k.BLUE : k.RED,
                    });
                },
            }])
        );
        consumers.forEach(o => o.draw());
        consumers.forEach(o => o.draw());
        const initial = [...counts];
        source.width = 14;
        c.syncSize();
        consumers[0].draw();
        const first = pixel(c);
        consumers[1].draw();
        const second = pixel(c);
        const resized = [...counts];
        source.width = 13.1;
        consumers.forEach(o => o.draw());
        const same = [...counts];
        consumers[0].refresh();
        consumers.forEach(o => o.draw());
        const manual = [...counts];
        consumers[0].destroy();
        paint(c);
        consumers[1].refresh();
        consumers[1].draw();
        return {
            initial,
            resized,
            same,
            manual,
            first,
            second,
            survivor: pixel(c),
        };
    });
    expect(result).toEqual({
        initial: [1, 1],
        resized: [2, 2],
        same: [2, 2],
        manual: [3, 2],
        first: [255, 0, 0, 255],
        second: [0, 0, 255, 255],
        survivor: [0, 0, 255, 255],
    });
});

test("scene traversal routes a target subtree once and childrenOnly keeps the parent outside", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, pixel } = (window as any).canvasTest;
        const c = k.makeCanvas({ width: 8, height: 6 });
        const visits: string[] = [];
        const parent = k.add([
            k.drawon(c, { childrenOnly: true, refreshOnly: true }),
            {
                draw() {
                    visits.push("parent");
                    k.drawRect({ width: 64, height: 48, color: k.BLUE });
                },
            },
        ]);
        parent.add([{
            draw() {
                visits.push("one");
                k.drawRect({ width: 64, height: 48, color: k.RED });
            },
        }]);
        parent.add([{
            draw() {
                visits.push("two");
            },
        }]);
        k.getTreeRoot().draw();
        const first = [...visits];
        visits.length = 0;
        k.getTreeRoot().draw();
        const cached = [...visits];
        visits.length = 0;
        c.resize(11, 9);
        k.getTreeRoot().draw();
        return { first, cached, resized: visits, color: pixel(c) };
    });
    expect(result).toEqual({
        first: ["one", "two", "parent"],
        cached: ["parent"],
        resized: ["one", "two", "parent"],
        color: [255, 0, 0, 255],
    });
});

test("drawon pins the active canvas and restores state after a throwing child", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, gl, throws, paint, pixel } = (window as any).canvasTest;
        const c = k.makeCanvas(10, 8), error = new Error("child stopped");
        let rejectResize = false, rejectFree = false, fail = true, draws = 0;
        const parent = k.add([k.drawon(c, { refreshOnly: true })]);
        parent.add([{
            draw() {
                draws++;
                rejectResize = throws(() => c.resize(12, 10));
                rejectFree = throws(() => c.free());
                if (fail) throw error;
            },
        }]);
        const binding = gl.getParameter(gl.FRAMEBUFFER_BINDING),
            viewport = String(Array.from(gl.getParameter(gl.VIEWPORT)));
        let propagated = false;
        try {
            parent.draw();
        } catch (e) {
            propagated = e === error;
        }
        const restored = gl.getParameter(gl.FRAMEBUFFER_BINDING) === binding
            && String(Array.from(gl.getParameter(gl.VIEWPORT))) === viewport;
        fail = false;
        parent.draw();
        parent.draw();
        c.resize(13, 9);
        paint(c);
        return {
            rejectResize,
            rejectFree,
            propagated,
            restored,
            draws,
            color: pixel(c),
        };
    });
    expect(result).toEqual({
        rejectResize: true,
        rejectFree: true,
        propagated: true,
        restored: true,
        draws: 2,
        color: [255, 0, 0, 255],
    });
});

test("drawCanvas uses the replacement texture, not the retired one", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, paint } = (window as any).canvasTest;
        const src = k.makeCanvas(64, 48), out = k.makeCanvas(64, 48);
        paint(src);
        src.resize(32, 24);
        paint(src, k.BLUE);
        out.draw(() => k.drawCanvas({ canvas: src, width: 64, height: 48 }));
        const pixels = out.toImageData().data;
        let red = 0, blue = 0;
        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i] > 200) red++;
            if (pixels[i + 2] > 200) blue++;
        }
        return { red, blue };
    });
    expect(result.red).toBe(0);
    expect(result.blue).toBeGreaterThan(100);
});

test("resource retirement and repeated free coexist with engine teardown", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, gl, throws, frame } = (window as any).canvasTest;
        const created = new Map<object, number>();
        for (
            const [create, remove] of [["createTexture", "deleteTexture"], [
                "createFramebuffer",
                "deleteFramebuffer",
            ], ["createRenderbuffer", "deleteRenderbuffer"]]
        ) {
            const originalCreate = gl[create].bind(gl),
                originalDelete = gl[remove].bind(gl);
            gl[create] = (...args: any[]) => {
                const obj = originalCreate(...args);
                if (obj) created.set(obj, 0);
                return obj;
            };
            gl[remove] = (obj: object) => {
                if (created.has(obj)) created.set(obj, created.get(obj)! + 1);
                return originalDelete(obj);
            };
        }
        const c = k.makeCanvas(8, 6);
        const first = new Set(created.keys());
        c.resize(10, 8);
        const retired = [...first].every(o => created.get(o)! >= 1);
        c.resize(12, 9);
        c.free();
        c.free();
        const operations = [
            () => c.resize(3, 2),
            () => c.syncSize(),
            () => c.draw(() => {}),
            () => c.clear(),
            () => c.toImageData(),
            () => c.toDataURL(),
            () => k.drawCanvas({ canvas: c }),
            () => k.add([k.drawon(c)]).draw(),
        ];
        const rejected = operations.map(throws);
        const beforeQuit = [...created.values()].every(n => n >= 1);
        const live = k.makeCanvas(7, 5);
        live.resize(11, 7);
        k.quit();
        frame();
        return {
            observedAllocations: first.size > 0,
            retired,
            rejected,
            beforeQuit,
            afterQuit: [...created.values()].every(n => n >= 1),
        };
    });
    expect(result).toEqual({
        observedAllocations: true,
        retired: true,
        rejected: Array(8).fill(true),
        beforeQuit: true,
        afterQuit: true,
    });
});

test("public declarations expose both source forms, sizing methods, and all drawon destinations", () => {
    const dir = mkdtempSync(join(tmpdir(), "canvas-types-"));
    try {
        const declaration = resolve(
            JSON.parse(readFileSync("package.json", "utf8")).types,
        ).replace(/\.d\.ts$/, ".js");
        const file = join(dir, "consumer.ts");
        writeFileSync(
            file,
            `import kaplay from ${JSON.stringify(declaration)};
const k = kaplay({ global: false });
const fixed = k.makeCanvas(8, 6);
const screen = k.makeCanvas("screen");
const object = k.makeCanvas(k.add([k.rect(10, 8)]));
for (const canvas of [fixed, screen, object]) {
    canvas.resize(9, 7); canvas.syncSize();
    k.drawCanvas({ canvas, width: canvas.width, height: canvas.height });
    k.drawon(canvas, { childrenOnly: true, refreshOnly: true });
    k.drawon(canvas.fb);
}
k.drawon(new k.Picture());`,
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

test("a live resize invalidates cached targets without an explicit sync", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, pixel } = (window as any).canvasTest;
        const source = { width: 7, height: 5 }, c = k.makeCanvas(source);
        let calls = 0;
        const o = k.add([k.drawon(c, { refreshOnly: true }), {
            draw() {
                calls++;
                k.drawRect({
                    width: 64,
                    height: 48,
                    color: calls === 1 ? k.RED : k.BLUE,
                });
            },
        }]);
        o.draw();
        const first = pixel(c), fb = c.fb;
        source.width = 6.3;
        o.draw();
        const unchanged = [calls, c.fb === fb, pixel(c)];
        source.height = 11;
        o.draw();
        o.draw();
        return {
            first,
            unchanged,
            final: [calls, c.width, c.height, pixel(c)],
        };
    });
    expect(result).toEqual({
        first: [255, 0, 0, 255],
        unchanged: [1, true, [255, 0, 0, 255]],
        final: [2, 7, 11, [0, 0, 255, 255]],
    });
});

test("nested canvas destinations keep siblings in the outer target", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, pixel } = (window as any).canvasTest;
        const outer = k.makeCanvas(16, 12), inner = k.makeCanvas(5, 3);
        const root = k.add([k.drawon(outer)]);
        root.add([k.drawon(inner), {
            draw() {
                k.drawRect({ width: 64, height: 48, color: k.BLUE });
            },
        }]);
        root.add([{
            draw() {
                k.drawRect({ width: 64, height: 48, color: k.RED });
            },
        }]);
        k.getTreeRoot().draw();
        inner.resize(8, 7);
        outer.resize(20, 15);
        k.getTreeRoot().draw();
        return [pixel(outer), pixel(inner)];
    });
    expect(result).toEqual([[255, 0, 0, 255], [0, 0, 255, 255]]);
});

for (const mode of ["intersect", "subtract"] as const) {
    test(`${mode} masks render into live canvases and refresh after resize`, async ({ page }) => {
        const result = await page.evaluate(mode => {
            const { k } = (window as any).canvasTest;
            const source = { width: 8, height: 6 },
                canvas = k.makeCanvas(source);
            let masks = 0, children = 0;
            const object = k.add([
                k.mask(mode),
                k.drawon(canvas, { refreshOnly: true }),
                {
                    draw() {
                        masks++;
                        k.drawRect({ width: 32, height: 48 });
                    },
                },
            ]);
            object.add([{
                draw() {
                    children++;
                    k.drawRect({ width: 64, height: 48, color: k.RED });
                },
            }]);
            source.width = 12;
            object.draw();
            object.draw();
            const first = [canvas.width, canvas.height, masks, children];
            source.width = 20;
            source.height = 10;
            object.draw();
            object.draw();
            const size = [canvas.width, canvas.height];
            const image = canvas.toImageData();
            const at = (x: number) =>
                Array.from(
                    image.data.slice(
                        (5 * image.width + x) * 4,
                        (5 * image.width + x) * 4 + 4,
                    ),
                );
            return {
                first,
                size,
                counts: [masks, children],
                left: at(4),
                right: at(16),
            };
        }, mode);
        expect(result).toEqual({
            first: [12, 6, 1, 1],
            size: [20, 10],
            counts: [2, 2],
            left: mode === "intersect" ? [255, 0, 0, 255] : [0, 0, 0, 0],
            right: mode === "subtract" ? [255, 0, 0, 255] : [0, 0, 0, 0],
        });
    });
}

test("nested canvases isolate masks and restore the outer mask for later drawing", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k } = (window as any).canvasTest;
        const outer = k.makeCanvas(64, 48), inner = k.makeCanvas(64, 48);
        outer.draw(() =>
            k.drawMasked(() => {
                inner.draw(() =>
                    k.drawRect({ width: 64, height: 48, color: k.BLUE })
                );
                k.drawRect({ width: 64, height: 48, color: k.RED });
            }, () => k.drawRect({ width: 32, height: 48 }))
        );
        const sample = (c: any, x: number) =>
            Array.from(
                c.toImageData().data.slice(
                    (24 * 64 + x) * 4,
                    (24 * 64 + x) * 4 + 4,
                ),
            );
        return {
            outer: [sample(outer, 8), sample(outer, 56)],
            inner: [sample(inner, 8), sample(inner, 56)],
        };
    });
    expect(result).toEqual({
        outer: [[255, 0, 0, 255], [0, 0, 0, 0]],
        inner: [[0, 0, 255, 255], [0, 0, 255, 255]],
    });
});

test("throwing masked children restore canvas state and remain refreshable", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, paint, pixel, gl } = (window as any).canvasTest;
        const canvas = k.makeCanvas(16, 12),
            error = new Error("masked child failed");
        let fail = true, calls = 0;
        const object = k.add([
            k.mask(),
            k.drawon(canvas, { refreshOnly: true }),
            {
                draw() {
                    k.drawRect({ width: 64, height: 48 });
                },
            },
        ]);
        object.add([{
            draw() {
                calls++;
                if (fail) throw error;
                k.drawRect({ width: 64, height: 48, color: k.BLUE });
            },
        }]);
        const before = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        const viewport = String(Array.from(gl.getParameter(gl.VIEWPORT)));
        let propagated = false;
        try {
            object.draw();
        } catch (caught) {
            propagated = caught === error;
        }
        const restored = gl.getParameter(gl.FRAMEBUFFER_BINDING) === before
            && String(Array.from(gl.getParameter(gl.VIEWPORT))) === viewport;
        fail = false;
        object.draw();
        object.draw();
        const rendered = pixel(canvas);
        const independent = k.makeCanvas(8, 6);
        paint(independent);
        return {
            propagated,
            restored,
            calls,
            rendered,
            independent: pixel(independent),
        };
    });
    expect(result).toEqual({
        propagated: true,
        restored: true,
        calls: 2,
        rendered: [0, 0, 255, 255],
        independent: [255, 0, 0, 255],
    });
});

test("changed-size explicit resize permanently detaches an object source", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, paint, pixel } = (window as any).canvasTest;
        const source = { width: 8, height: 6 }, canvas = k.makeCanvas(source);
        canvas.resize(13.2, 9.1);
        const resized = [canvas.width, canvas.height];
        const fb = canvas.fb;
        source.width = 20;
        source.height = 15;
        canvas.syncSize();
        paint(canvas, k.BLUE);
        return {
            resized,
            fixed: [canvas.width, canvas.height],
            retained: canvas.fb === fb,
            color: pixel(canvas),
        };
    });
    expect(result).toEqual({
        resized: [14, 10],
        fixed: [14, 10],
        retained: true,
        color: [0, 0, 255, 255],
    });
});

test("freeing a live canvas does not resample a now-invalid source", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, throws } = (window as any).canvasTest;
        const source = { width: 8, height: 6 }, canvas = k.makeCanvas(source);
        source.width = NaN;
        source.height = 0;
        canvas.free();
        canvas.free();
        return throws(() => canvas.draw(() => {}));
    });
    expect(result).toBe(true);
});

for (const fail of [false, true]) {
    test(`canvas drawing suspends Picture capture and restores it${fail ? " after an error" : ""}`, async ({ page }) => {
        const result = await page.evaluate(fail => {
            const { k, pixel } = (window as any).canvasTest;
            const canvas = k.makeCanvas(64, 48), picture = new k.Picture();
            const error = new Error("canvas callback failed");
            k.beginPicture(picture);
            const before = picture.archive();
            let propagated = false;
            try {
                canvas.draw(() => {
                    k.drawRect({ width: 64, height: 48, color: k.BLUE });
                    if (fail) throw error;
                });
            } catch (caught) {
                propagated = caught === error;
            }
            const isolated = before === picture.archive();
            k.drawRect({ width: 8, height: 8, color: k.RED });
            const restored = k.endPicture() === picture;
            return {
                isolated,
                restored,
                recorded: picture.archive() !== before,
                propagated,
                pixel: pixel(canvas),
            };
        }, fail);
        expect(result).toEqual({
            isolated: true,
            restored: true,
            recorded: true,
            propagated: fail,
            pixel: [0, 0, 255, 255],
        });
    });
}

test("a Canvas child of a Picture destination leaves sibling recording intact", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, pixel } = (window as any).canvasTest;
        const canvas = k.makeCanvas(64, 48), picture = new k.Picture();
        const marker = () => k.drawRect({ width: 8, height: 8, color: k.RED });
        const parent = k.add([k.drawon(picture)]);
        parent.add([k.drawon(canvas), {
            draw() {
                k.drawRect({ width: 64, height: 48, color: k.BLUE });
            },
        }]);
        parent.add([{ draw: marker }]);
        parent.draw();
        const expected = new k.Picture();
        k.beginPicture(expected);
        marker();
        k.endPicture();
        return {
            recorded: picture.archive() === expected.archive(),
            pixel: pixel(canvas),
        };
    });
    expect(result).toEqual({ recorded: true, pixel: [0, 0, 255, 255] });
});

for (const mode of ["intersect", "subtract"] as const) {
    for (const fail of [false, true]) {
        test(`reentrant canvas restores ${mode} mask pixels${fail ? " after an error" : ""}`, async ({ page }) => {
            const result = await page.evaluate(({ mode, fail }) => {
                const { k, gl } = (window as any).canvasTest;
                const canvas = k.makeCanvas(64, 48),
                    error = new Error("inner mask failed");
                const outerMask = mode === "intersect"
                    ? k.drawMasked
                    : k.drawSubtracted;
                let propagated = false;
                const binding = gl.getParameter(gl.FRAMEBUFFER_BINDING);
                const viewport = String(
                    Array.from(gl.getParameter(gl.VIEWPORT)),
                );
                canvas.draw(() =>
                    outerMask(() => {
                        try {
                            canvas.draw(() =>
                                k.drawMasked(() => {
                                    if (fail) throw error;
                                }, () =>
                                    k.drawRect({
                                        pos: k.vec2(24, 0),
                                        width: 16,
                                        height: 48,
                                    }))
                            );
                        } catch (caught) {
                            propagated = caught === error;
                        }
                        k.drawRect({ width: 64, height: 48, color: k.RED });
                    }, () => k.drawRect({ width: 32, height: 48 }))
                );
                const pixels = canvas.toImageData().data;
                const at = (x: number) =>
                    Array.from(
                        pixels.slice((24 * 64 + x) * 4, (24 * 64 + x) * 4 + 4),
                    );
                return {
                    propagated,
                    restored:
                        gl.getParameter(gl.FRAMEBUFFER_BINDING) === binding
                        && String(Array.from(gl.getParameter(gl.VIEWPORT)))
                            === viewport,
                    left: at(8),
                    right: at(56),
                };
            }, { mode, fail });
            expect(result).toEqual({
                propagated: fail,
                restored: true,
                left: mode === "intersect" ? [255, 0, 0, 255] : [0, 0, 0, 0],
                right: mode === "subtract" ? [255, 0, 0, 255] : [0, 0, 0, 0],
            });
        });
    }
}

test("returning to an outer canvas preserves both suspended masks", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k } = (window as any).canvasTest;
        const a = k.makeCanvas(64, 48), b = k.makeCanvas(64, 48);
        const left = () => k.drawRect({ width: 32, height: 48 });
        a.draw(() =>
            k.drawMasked(() => {
                b.draw(() =>
                    k.drawSubtracted(() => {
                        a.draw(() =>
                            k.drawMasked(() => {
                                k.drawRect({
                                    width: 64,
                                    height: 48,
                                    color: k.BLUE,
                                });
                            }, () => k.drawRect({ width: 64, height: 48 }))
                        );
                        k.drawRect({ width: 64, height: 48, color: k.GREEN });
                    }, left)
                );
                k.drawRect({ width: 64, height: 48, color: k.RED });
            }, left)
        );
        const sample = (canvas: any, x: number) =>
            Array.from(
                canvas.toImageData().data.slice(
                    (24 * 64 + x) * 4,
                    (24 * 64 + x) * 4 + 4,
                ),
            );
        return {
            a: [sample(a, 8), sample(a, 56)],
            b: [sample(b, 8), sample(b, 56)],
        };
    });
    expect(result).toEqual({
        a: [[255, 0, 0, 255], [0, 0, 255, 255]],
        b: [[0, 0, 0, 0], [0, 255, 0, 255]],
    });
});

for (const mode of ["intersect", "subtract"] as const) {
    for (const sameCanvas of [false, true]) {
        test(`clearing ${sameCanvas ? "the active" : "another"} canvas preserves the outer ${mode} mask`, async ({ page }) => {
            const result = await page.evaluate(({ mode, sameCanvas }) => {
                const { k, paint } = (window as any).canvasTest;
                const source = { width: 32, height: 24 };
                const outer = k.makeCanvas(source);
                const cleared = sameCanvas ? outer : k.makeCanvas(64, 48);
                source.width = 64;
                source.height = 48;
                paint(cleared, k.BLUE);
                const mask = mode === "intersect"
                    ? k.drawMasked
                    : k.drawSubtracted;
                outer.draw(() =>
                    mask(() => {
                        // Fix the clear color so this case checks target and mask isolation.
                        (window as any).canvasTest.gl.clearColor(0, 0, 0, 0);
                        cleared.clear();
                        k.drawRect({ width: 64, height: 48, color: k.RED });
                    }, () => k.drawRect({ width: 32, height: 48 }))
                );
                const pixels = outer.toImageData().data;
                let red = 0, transparent = 0, unexpected = 0;
                for (let y = 4; y < 44; y++) {
                    for (let x = 4; x < 60; x++) {
                        const index = (y * 64 + x) * 4;
                        const inside = mode === "intersect" ? x < 32 : x >= 32;
                        if (
                            inside && pixels[index] === 255
                            && pixels[index + 1] === 0
                            && pixels[index + 2] === 0
                            && pixels[index + 3] === 255
                        ) red++;
                        else if (!inside && pixels[index + 3] === 0) {
                            transparent++;
                        }
                        else unexpected++;
                    }
                }
                return {
                    size: [outer.width, outer.height],
                    red,
                    transparent,
                    unexpected,
                    otherCleared: sameCanvas
                        || cleared.toImageData().data.every((v: number) =>
                            v === 0
                        ),
                };
            }, { mode, sameCanvas });
            expect(result).toEqual({
                size: [64, 48],
                red: 1120,
                transparent: 1120,
                unexpected: 0,
                otherCleared: true,
            });
        });
    }
}

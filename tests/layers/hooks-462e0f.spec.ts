import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const cameraSamples = [
    {
        property: "position",
        movedQueued: [45, 85],
        following: [115, 65],
        object: [115, 85],
    },
    {
        property: "scale",
        movedQueued: [30, 70],
        following: [170, 30],
        object: [170, 70],
    },
    {
        property: "rotation",
        movedQueued: [115, 65],
        following: [135, 135],
        object: [115, 135],
    },
] as const;

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

test("configured layers bracket inherited and z-sorted objects, including empty layers", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["back", "main", "front"], "main");
        const order: string[] = [];
        for (const name of ["back", "main", "front"]) {
            k.onBeforeLayerDraw(name, () => order.push(`before ${name}`));
            k.onAfterLayerDraw(name, () => order.push(`after ${name}`));
        }
        const parent = k.add([k.pos(0, 0), k.layer("back")]);
        parent.add([k.rect(3, 3)]).onDraw(() => order.push("inherited"));
        k.add([k.rect(3, 3), k.layer("main"), k.z(10)]).onDraw(() =>
            order.push("high")
        );
        k.add([k.rect(3, 3), k.layer("main"), k.z(-10)]).onDraw(() =>
            order.push("low")
        );
        (window as any).advance(2);
        order.length = 0;
        (window as any).advance();
        return order;
    });
    expect(result).toEqual([
        "before back",
        "inherited",
        "after back",
        "before main",
        "low",
        "high",
        "after main",
        "before front",
        "after front",
    ]);
});

test("camera changes apply to their layer without moving buffered earlier draws", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["back", "front"], "back");
        k.add([
            k.rect(12, 12),
            k.pos(70, 80),
            k.color(255, 0, 0),
            k.layer("back"),
        ]);
        k.add([
            k.rect(12, 12),
            k.pos(130, 80),
            k.color(0, 255, 0),
            k.layer("front"),
        ]);
        k.onBeforeLayerDraw("front", () => k.setCamScale(2));
        k.onAfterLayerDraw("front", () => k.setCamScale(1));
        (window as any).advance(2);
        return {
            back: (window as any).pixel(75, 85),
            front: (window as any).pixel(165, 65),
            oldFront: (window as any).pixel(135, 85),
            scale: k.getCamScale().x,
        };
    });
    expect(result.back[0]).toBeGreaterThan(result.back[1] * 2);
    expect(result.front[1]).toBeGreaterThan(result.front[0] * 2);
    expect(result.oldFront[1]).toBeLessThan(40);
    expect(result.scale).toBe(1);
});

test("camera changes from an after hook affect the next layer", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["back", "middle", "front"], "front");
        k.setCamPos(100, 100);
        k.add([
            k.rect(10, 10),
            k.pos(130, 80),
            k.color(255, 0, 0),
            k.layer("middle"),
        ]);
        k.add([
            k.rect(10, 10),
            k.pos(130, 110),
            k.color(0, 255, 0),
            k.layer("front"),
        ]);
        k.onAfterLayerDraw("back", () => k.setCamPos(120, 100));
        (window as any).advance();
        return {
            middle: (window as any).pixel(115, 85),
            front: (window as any).pixel(115, 115),
            oldMiddle: (window as any).pixel(135, 85),
            oldFront: (window as any).pixel(135, 115),
            camera: k.getCamPos().x,
        };
    });
    expect(result.middle[0]).toBeGreaterThan(100);
    expect(result.front[1]).toBeGreaterThan(100);
    expect(result.oldMiddle[0]).toBeLessThan(40);
    expect(result.oldFront[1]).toBeLessThan(40);
    expect(result.camera).toBe(120);
});

test("before-hook camera position and rotation affect that layer", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["world"], "world");
        let screen: [number, number] = [0, 0];
        k.add([k.rect(1, 1), k.layer("world")]).onDraw(() => {
            const p = k.toScreen(k.vec2(130, 100));
            screen = [p.x, p.y];
        });
        k.onBeforeLayerDraw("world", () => {
            k.setCamPos(120, 100);
            k.setCamRot(90);
        });
        (window as any).advance();
        return { screen, position: k.getCamPos().x, rotation: k.getCamRot() };
    });
    expect(result.screen[0]).toBeCloseTo(100, 0);
    expect(Math.abs(result.screen[1] - 100)).toBeCloseTo(10, 0);
    expect(result.position).toBe(120);
    expect(result.rotation).toBe(90);
});

test("hooks remain active during pause and controllers can pause or cancel independently", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["one"], "one");
        let before = 0;
        let after = 0;
        const a = k.onBeforeLayerDraw("one", () => before++);
        const b = k.onAfterLayerDraw("one", () => after++);
        k.debug.paused = true;
        (window as any).advance(2);
        const paused = [before, after];
        a.paused = true;
        b.cancel();
        (window as any).advance();
        const suppressed = [before, after];
        a.paused = false;
        (window as any).advance();
        return { paused, suppressed, resumed: [before, after] };
    });
    expect(result.paused).toEqual([2, 2]);
    expect(result.suppressed).toEqual([2, 2]);
    expect(result.resumed).toEqual([3, 2]);
});

test("both hook controllers support cancellation and pausing", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["world"], "world");
        let before = 0;
        let after = 0;
        const beforeHandler = k.onBeforeLayerDraw("world", () => before++);
        const afterHandler = k.onAfterLayerDraw("world", () => after++);
        (window as any).advance();
        const initial = [before, after];
        beforeHandler.cancel();
        afterHandler.paused = true;
        (window as any).advance(2);
        const suppressed = [before, after];
        afterHandler.paused = false;
        (window as any).advance();
        const resumed = [before, after];
        afterHandler.cancel();
        let returnedBefore = 0;
        let returnedAfter = 0;
        let persistent = 0;
        k.onBeforeLayerDraw("world", () => {
            returnedBefore++;
            return k.cancel();
        });
        k.onAfterLayerDraw("world", () => {
            returnedAfter++;
            return k.cancel();
        });
        k.onBeforeLayerDraw("world", () => persistent++);
        (window as any).advance(3);
        return {
            initial,
            suppressed,
            resumed,
            returned: [returnedBefore, returnedAfter],
            persistent,
        };
    });
    expect(result.initial).toEqual([1, 1]);
    expect(result.suppressed).toEqual([1, 1]);
    expect(result.resumed).toEqual([1, 2]);
    expect(result.returned).toEqual([1, 1]);
    expect(result.persistent).toBe(3);
});

test("paused frames keep objects inside their own layer hooks", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["back", "front"], "front");
        const order: string[] = [];
        for (const name of ["back", "front"]) {
            k.onBeforeLayerDraw(name, () => order.push(`before ${name}`));
            k.onAfterLayerDraw(name, () => order.push(`after ${name}`));
        }
        const parent = k.add([k.pos(0, 0), k.layer("front")]);
        parent.add([k.rect(3, 3)]).onDraw(() => order.push("object"));
        k.add([k.rect(3, 3)]).onDraw(() => order.push("default"));
        (window as any).advance(2);
        order.length = 0;
        k.debug.paused = true;
        (window as any).advance();
        return order;
    });
    expect(result).toEqual([
        "before back",
        "after back",
        "before front",
        "object",
        "default",
        "after front",
    ]);
});

test("masked subtrees stay within their containing layer hooks", async ({ page }) => {
    for (const mode of ["intersect", "subtract"] as const) {
        const result = await page.evaluate(async mode => {
            const k = await (window as any).make();
            k.setLayers(["back", "front"], "front");
            const order: string[] = [];
            k.onBeforeLayerDraw("back", () => order.push("before back"));
            k.onAfterLayerDraw("back", () => order.push("after back"));
            k.onBeforeLayerDraw("front", () => order.push("before front"));
            const mask = k.add([
                k.rect(15, 15),
                k.pos(20, 20),
                k.mask(mode),
                k.layer("back"),
            ]);
            mask.onDraw(() => order.push("mask"));
            mask.add([k.rect(30, 15), k.color(255, 0, 0)]).onDraw(() =>
                order.push("masked")
            );
            (window as any).advance(2);
            order.length = 0;
            (window as any).advance();
            const result = {
                order: [...order],
                inside: (window as any).pixel(25, 25),
                outside: (window as any).pixel(45, 25),
            };
            k.quit();
            (window as any).advance();
            return result;
        }, mode);
        expect(result.order).toEqual([
            "before back",
            "mask",
            "masked",
            "after back",
            "before front",
        ]);
        const drawn = mode === "intersect" ? result.inside : result.outside;
        const clipped = mode === "intersect" ? result.outside : result.inside;
        expect(drawn[0]).toBeGreaterThan(100);
        expect(clipped[0]).toBeLessThan(40);
    }
});

test("picture targets render once inside their layer boundary", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["picture", "world"], "world");
        const order: string[] = [];
        const picture = new k.Picture();
        k.onBeforeLayerDraw("picture", () => order.push("before"));
        k.onAfterLayerDraw("picture", () => order.push("after"));
        k.add([k.layer("world"), {
            draw() {
                k.drawPicture(picture, {});
            },
        }]);
        const target = k.add([k.drawon(picture), k.layer("picture")]);
        target.onDraw(() => order.push("target"));
        target.add([k.rect(10, 10), k.pos(40, 40), k.color(255, 0, 0)]).onDraw(
            () => order.push("child"),
        );
        (window as any).advance(2);
        order.length = 0;
        (window as any).advance();
        return { order, pixel: (window as any).pixel(45, 45) };
    });
    expect(result.order).toEqual(["before", "target", "child", "after"]);
    expect(result.pixel[0]).toBeGreaterThan(result.pixel[1] * 2);
});

test("public layer hooks have typed cancellable handlers", () => {
    const source = readFileSync("tests/layers/types-462e0f.ts", "utf8")
        .replace("\"../../src/kaplay\"", JSON.stringify(resolve("src/kaplay")));
    const dir = mkdtempSync(join(tmpdir(), "layer-types-"));
    const run = (body: string) => {
        const file = join(dir, "probe.ts");
        writeFileSync(file, body);
        return spawnSync(process.execPath, [
            "node_modules/typescript/bin/tsc",
            "--noEmit",
            "--strict",
            "--skipLibCheck",
            "--target",
            "esnext",
            "--module",
            "esnext",
            "--moduleResolution",
            "bundler",
            "src/.env.d.ts",
            file,
        ], { encoding: "utf8" });
    };
    try {
        const positive = run(source);
        expect(positive.status, positive.stdout + positive.stderr).toBe(0);
        for (const method of ["onBeforeLayerDraw", "onAfterLayerDraw"]) {
            const negative = run(source + `\nk.${method}('layer');`);
            expect(negative.status, negative.stdout + negative.stderr).not.toBe(
                0,
            );
        }
        const rejectedTypes = run(
            source + `
// @ts-expect-error layer names are strings
k.onBeforeLayerDraw(42, () => {});
// @ts-expect-error layer names are strings
k.onAfterLayerDraw(42, () => {});
// @ts-expect-error the action is a callback
k.onBeforeLayerDraw('layer', 'callback');
// @ts-expect-error the action is a callback
k.onAfterLayerDraw('layer', 'callback');
// @ts-expect-error standard controllers have a boolean paused property
before.paused = 'paused';
// @ts-expect-error standard controllers have a boolean paused property
after.paused = 'paused';
`,
        );
        expect(
            rejectedTypes.status,
            rejectedTypes.stdout + rejectedTypes.stderr,
        ).toBe(0);
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});
for (const scope of ["scene", "app"] as const) {
    test(`hook lifetimes follow defaultLifetimeScope=${scope}`, async ({ page }) => {
        const result = await page.evaluate(async scope => {
            const k = await (window as any).make({
                defaultLifetimeScope: scope,
            });
            k.setLayers(["world"], "world");
            const before: string[] = [];
            const after: string[] = [];
            for (const name of ["first", "second"]) {
                k.scene(name, () => {
                    k.onBeforeLayerDraw("world", () => before.push(name));
                    k.onAfterLayerDraw("world", () => after.push(name));
                });
            }
            const readFrame = () => {
                before.length = 0;
                after.length = 0;
                (window as any).advance();
                return { before: [...before], after: [...after] };
            };
            k.go("first");
            (window as any).advance(3);
            const first = readFrame();
            k.go("second");
            (window as any).advance(3);
            return { first, second: readFrame() };
        }, scope);
        expect(result.first).toEqual({ before: ["first"], after: ["first"] });
        const expected = scope === "scene" ? ["second"] : ["first", "second"];
        expect(result.second).toEqual({ before: expected, after: expected });
    });
}

test("default-layer objects stay inside their hooks on the first paused frame", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["back", "front"], "front");
        const order: string[] = [];
        for (const name of ["back", "front"]) {
            k.onBeforeLayerDraw(name, () => order.push(`before ${name}`));
            k.onAfterLayerDraw(name, () => order.push(`after ${name}`));
        }
        k.add([k.rect(3, 3)]).onDraw(() => order.push("default"));
        k.debug.paused = true;
        (window as any).advance();
        return order;
    });
    expect(result).toEqual([
        "before back",
        "after back",
        "before front",
        "default",
        "after front",
    ]);
});

test("configured layer names select only their own callbacks", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const k = await (window as any).make();
        const names = [
            "constructor",
            "toString",
            "__proto__",
            "hasOwnProperty",
        ];
        k.setLayers(names, "constructor");
        const order: string[] = [];
        for (const name of names) {
            k.onBeforeLayerDraw(name, () => order.push(`before ${name}`));
            k.onAfterLayerDraw(name, () => order.push(`after ${name}`));
            k.add([k.rect(3, 3), k.layer(name)]).onDraw(() =>
                order.push(`${name} object`)
            );
        }
        (window as any).advance(2);
        order.length = 0;
        (window as any).advance();
        return order;
    });
    expect(result).toEqual([
        "before constructor",
        "constructor object",
        "after constructor",
        "before toString",
        "toString object",
        "after toString",
        "before __proto__",
        "__proto__ object",
        "after __proto__",
        "before hasOwnProperty",
        "hasOwnProperty object",
        "after hasOwnProperty",
    ]);
});

test("before-hook camera changes do not move commands already queued by the hook", async ({ page }) => {
    for (const sample of cameraSamples) {
        const pixels = await page.evaluate(async sample => {
            const k = await (window as any).make();
            k.setLayers(["back", "front"], "front");
            k.onBeforeLayerDraw("front", () => {
                k.drawRect({
                    pos: k.vec2(60, 80),
                    width: 12,
                    height: 12,
                    color: k.rgb(255, 0, 0),
                });
                if (sample.property === "position") k.setCamPos(120, 100);
                else if (sample.property === "scale") k.setCamScale(2);
                else k.setCamRot(90);
                k.drawRect({
                    pos: k.vec2(130, 60),
                    width: 10,
                    height: 10,
                    color: k.rgb(0, 0, 255),
                });
            });
            k.add([
                k.rect(12, 12),
                k.pos(130, 80),
                k.color(0, 255, 0),
                k.layer("front"),
            ]);
            (window as any).advance();
            const pixels = {
                queued: (window as any).pixel(65, 85),
                movedQueued: (window as any).pixel(...sample.movedQueued),
                following: (window as any).pixel(...sample.following),
                oldFollowing: (window as any).pixel(135, 65),
                layerObject: (window as any).pixel(...sample.object),
            };
            k.quit();
            (window as any).advance();
            return pixels;
        }, sample);
        expect(pixels.queued[0], sample.property).toBeGreaterThan(100);
        expect(pixels.movedQueued[0], sample.property).toBeLessThan(40);
        expect(pixels.following[2], sample.property).toBeGreaterThan(100);
        expect(pixels.oldFollowing[2], sample.property).toBeLessThan(40);
        expect(pixels.layerObject[1], sample.property).toBeGreaterThan(100);
    }
});

test("ordinary onDraw stays once per frame and keeps next-frame camera timing without hooks", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["back", "front"], "front");
        let calls = 0;
        k.onDraw(() => calls++);
        const hook = k.onBeforeLayerDraw("back", () => {});
        (window as any).advance();
        const first = calls;
        k.debug.paused = true;
        (window as any).advance();
        const counts = [first, calls];
        hook.cancel();
        k.debug.paused = false;
        k.setCamPos(100, 100);
        k.add([k.rect(10, 10), k.pos(130, 80), k.color(255, 0, 0)]);
        k.onDraw(() => k.setCamPos(120, 100));
        (window as any).advance();
        const current = (window as any).pixel(135, 85)[0];
        (window as any).advance();
        return { counts, current, next: (window as any).pixel(115, 85)[0] };
    });
    expect(result.counts).toEqual([1, 2]);
    expect(result.current).toBeGreaterThan(100);
    expect(result.next).toBeGreaterThan(100);
});

test("masked FrameBuffer targets render with and without layer hooks", async ({ page }) => {
    const results = await page.evaluate(async () => {
        const render = async (
            withHooks: boolean,
            mode: "intersect" | "subtract",
            maskDepth: number,
        ) => {
            const k = await (window as any).make();
            k.setLayers(["masked", "other"], "masked");
            const order: string[] = [];
            if (withHooks) {
                k.onBeforeLayerDraw("masked", () => order.push("before"));
                k.onAfterLayerDraw("masked", () => order.push("after"));
            }
            const canvas = k.makeCanvas(32, 32);
            const mask = k.add([
                k.pos(0, 0),
                k.rect(24, 24),
                k.color(255, 255, 255),
                k.mask(mode),
                k.layer("masked"),
            ]);
            const container = maskDepth === 2
                ? mask.add([k.rect(24, 24), k.mask(mode)])
                : mask;
            const target = container.add([
                k.drawon(canvas.fb, { childrenOnly: true }),
                k.layer("masked"),
            ]);
            target.onDraw(() => order.push("target"));
            target.add([
                k.pos(4, 4),
                k.rect(12, 12),
                k.color(255, 0, 0),
            ]).onDraw(() => order.push("child"));
            (window as any).advance(2);
            order.length = 0;
            (window as any).advance();
            const data = canvas.toImageData().data;
            let maxRed = 0;
            for (let i = 0; i < data.length; i += 4) {
                maxRed = Math.max(maxRed, data[i]);
            }
            const result = { maxRed, order: [...order] };
            k.quit();
            (window as any).advance();
            return result;
        };
        const results = [];
        for (const mode of ["intersect", "subtract"] as const) {
            for (const depth of [1, 2]) {
                results.push([
                    await render(false, mode, depth),
                    await render(true, mode, depth),
                ]);
            }
        }
        return results;
    });
    for (const pair of results) {
        expect(pair[0].maxRed).toBeGreaterThan(100);
        expect(pair[1].maxRed).toBeGreaterThan(100);
        expect(pair[1].order).toEqual(["before", "child", "target", "after"]);
    }
});

test("a FrameBuffer inside a Picture keeps both targets and their layer boundary", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["capture", "display"], "capture");
        const picture = new k.Picture();
        const canvas = k.makeCanvas(32, 32);
        const outer = k.add([k.drawon(picture), k.layer("capture")]);
        outer.add([k.pos(40, 40), k.rect(10, 10), k.color(0, 255, 0)]);
        const inner = outer.add([k.drawon(canvas.fb, { childrenOnly: true })]);
        const order: string[] = [];
        const marker = inner.add([
            k.pos(4, 4),
            k.rect(12, 12),
            k.color(255, 0, 0),
        ]);
        marker.onDraw(() => order.push("inner"));
        k.add([k.layer("display"), {
            draw() {
                k.drawPicture(picture, {});
            },
        }]);
        const read = () => {
            const data = canvas.toImageData().data;
            let red = 0;
            let blue = 0;
            for (let i = 0; i < data.length; i += 4) {
                red = Math.max(red, data[i]);
                blue = Math.max(blue, data[i + 2]);
            }
            return {
                red,
                blue,
                green: (window as any).pixel(45, 45)[1],
                leaked: (window as any).pixel(5, 5),
            };
        };
        (window as any).advance(2);
        const withoutHooks = read();
        k.onBeforeLayerDraw("capture", () => order.push("before"));
        k.onAfterLayerDraw("capture", () => order.push("after"));
        marker.color = k.rgb(0, 0, 255);
        order.length = 0;
        (window as any).advance();
        return { withoutHooks, withHooks: read(), order };
    });
    expect(result.withoutHooks.red).toBeGreaterThan(100);
    expect(result.withoutHooks.blue).toBeLessThan(40);
    expect(result.withHooks.blue).toBeGreaterThan(100);
    expect(result.withHooks.red).toBeLessThan(40);
    for (const pixels of [result.withoutHooks, result.withHooks]) {
        expect(pixels.green).toBeGreaterThan(100);
        expect(pixels.leaked[0]).toBeLessThan(40);
        expect(pixels.leaked[2]).toBeLessThan(40);
    }
    expect(result.order).toEqual(["before", "inner", "after"]);
});

test("adding objects from onDraw does not stall existing layer draws", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["rear", "near"], "near");
        const seen = { rear: 0, near: 0 };
        k.add([
            k.pos(40, 40),
            k.rect(10, 10),
            k.color(255, 0, 0),
            k.layer("rear"),
        ]).onDraw(() => seen.rear++);
        k.add([
            k.pos(120, 120),
            k.rect(10, 10),
            k.color(0, 255, 0),
            k.layer("near"),
        ]).onDraw(() => seen.near++);
        k.onBeforeLayerDraw("rear", () => {});
        k.onDraw(() => k.add([k.rect(1, 1), k.layer("near"), k.z(-100)]));
        (window as any).advance(3);
        return {
            seen,
            rear: (window as any).pixel(45, 45),
            near: (window as any).pixel(125, 125),
        };
    });
    expect(result.seen).toEqual({ rear: 3, near: 3 });
    expect(result.rear[0]).toBeGreaterThan(100);
    expect(result.near[1]).toBeGreaterThan(100);
});

test("returning from nested masks and targets preserves the outer mask", async ({ page }) => {
    for (const kind of ["framebuffer", "picture", "plain"] as const) {
        const result = await page.evaluate(async kind => {
            const k = await (window as any).make();
            k.setLayers(["world"], "world");
            const canvas = kind === "framebuffer" ? k.makeCanvas(32, 32) : null;
            const outer = k.add([
                k.rect(60, 60),
                k.mask("intersect"),
                k.layer("world"),
            ]);
            const target = kind === "plain" ? outer : outer.add([
                k.drawon(canvas ? canvas.fb : new k.Picture(), {
                    childrenOnly: true,
                }),
            ]);
            const inner = target.add([k.rect(12, 12), k.mask("intersect")]);
            inner.add([k.rect(32, 32), k.color(0, 0, 255)]);
            outer.add([k.rect(100, 60), k.color(255, 0, 0)]);
            const read = () => {
                let bluePixels = 0;
                if (canvas) {
                    const data = canvas.toImageData().data;
                    for (let i = 0; i < data.length; i += 4) {
                        if (data[i + 2] > 100) bluePixels++;
                    }
                }
                return {
                    bluePixels,
                    inside: (window as any).pixel(30, 30)[0],
                    outside: (window as any).pixel(80, 30)[0],
                };
            };
            (window as any).advance();
            const withoutHooks = read();
            k.onBeforeLayerDraw("world", () => {});
            (window as any).advance();
            const frames = [withoutHooks, read()];
            k.quit();
            (window as any).advance();
            return frames;
        }, kind);
        for (const frame of result) {
            if (kind === "framebuffer") {
                expect(frame.bluePixels).toBeGreaterThan(0);
                expect(frame.bluePixels).toBeLessThan(32 * 32);
            }
            expect(frame.inside, kind).toBeGreaterThan(100);
            expect(frame.outside, kind).toBeLessThan(40);
        }
    }
});

test("shake in layer hooks affects the following layer draws", async ({ page }) => {
    const results = await page.evaluate(async () => {
        const results = [];
        for (const phase of ["before", "after"]) {
            for (const zeroIntensity of [false, true]) {
                const k = await (window as any).make();
                k.setLayers(["back", "world"], "world");
                k.setCamPos(100, 100);
                const displacement = { back: -1, world: -1 };
                for (const name of ["back", "world"] as const) {
                    k.add([k.rect(1, 1), k.layer(name)]).onDraw(() => {
                        const screen = k.toScreen(k.vec2(100, 100));
                        displacement[name] = Math.hypot(
                            screen.x - 100,
                            screen.y - 100,
                        );
                    });
                }
                if (phase === "before") {
                    k.onBeforeLayerDraw("world", () => {
                        k.shake(10);
                        if (zeroIntensity) k.shake(0);
                    });
                }
                else {
                    k.onAfterLayerDraw("back", () => {
                        k.shake(10);
                        if (zeroIntensity) k.shake(0);
                    });
                }
                (window as any).advance();
                results.push({ ...displacement });
                k.quit();
                (window as any).advance();
            }
        }
        return results;
    });
    for (const result of results) {
        expect(result.back).toBeCloseTo(0, 2);
        expect(result.world).toBeCloseTo(10, 2);
    }
});

test("multi-child render targets draw their contents once with and without hooks", async ({ page }) => {
    const results = await page.evaluate(async () => {
        const results = [];
        for (const kind of ["framebuffer", "picture"]) {
            for (const hooks of [false, true]) {
                const k = await (window as any).make();
                k.setLayers(["target", "world"], "world");
                const seen = { target: 0, first: 0, second: 0 };
                const canvas = kind === "framebuffer"
                    ? k.makeCanvas(200, 200)
                    : null;
                const destination = canvas ? canvas.fb : new k.Picture();
                const target = k.add([
                    k.drawon(destination),
                    k.layer("target"),
                ]);
                target.onDraw(() => seen.target++);
                target.add([k.rect(8, 8), k.pos(2, 2), k.color(255, 0, 0)])
                    .onDraw(() => seen.first++);
                target.add([k.rect(8, 8), k.pos(18, 2), k.color(0, 255, 0)])
                    .onDraw(() => seen.second++);
                if (hooks) k.onBeforeLayerDraw("target", () => {});
                if (!canvas) {
                    k.add([k.layer("world"), {
                        draw() {
                            k.drawPicture(destination, {});
                        },
                    }]);
                }
                (window as any).advance(2);
                seen.target = seen.first = seen.second = 0;
                (window as any).advance();
                const pixels = canvas
                    ? [
                        Array.from(
                            canvas.toImageData().data.slice(
                                (3 * 200 + 3) * 4,
                                (3 * 200 + 3) * 4 + 4,
                            ),
                        ),
                        Array.from(
                            canvas.toImageData().data.slice(
                                (3 * 200 + 19) * 4,
                                (3 * 200 + 19) * 4 + 4,
                            ),
                        ),
                    ]
                    : [
                        (window as any).pixel(3, 3),
                        (window as any).pixel(19, 3),
                    ];
                results.push({ kind, hooks, seen: { ...seen }, pixels });
                k.quit();
                (window as any).advance();
            }
        }
        return results;
    });
    for (const result of results) {
        expect(result.seen, `${result.kind}, hooks=${result.hooks}`).toEqual({
            target: 1,
            first: 1,
            second: 1,
        });
        expect(result.pixels[0][0]).toBeGreaterThan(100);
        expect(result.pixels[1][1]).toBeGreaterThan(100);
    }
});

test("Picture targets inside either mask retain contents and restore outer clipping", async ({ page }) => {
    for (const mode of ["intersect", "subtract"] as const) {
        for (const withHooks of [false, true]) {
            const result = await page.evaluate(async ({ mode, withHooks }) => {
                const k = await (window as any).make();
                k.setLayers(["capture", "display"], "capture");
                const order: string[] = [];
                if (withHooks) {
                    k.onBeforeLayerDraw("capture", () => order.push("before"));
                    k.onAfterLayerDraw("capture", () => order.push("after"));
                }
                const picture = new k.Picture();
                const mask = k.add([
                    k.rect(24, 24),
                    k.mask(mode),
                    k.layer("capture"),
                ]);
                mask.add([k.rect(40, 40), k.color(255, 0, 0)]);
                const target = mask.add([k.drawon(picture)]);
                target.onDraw(() => order.push("target"));
                target.add([k.pos(4, 4), k.rect(12, 12), k.color(0, 0, 255)])
                    .onDraw(() => order.push("child"));
                mask.add([k.pos(20, 0), k.rect(20, 24), k.color(0, 255, 0)]);
                k.add([k.layer("display"), {
                    draw() {
                        k.drawPicture(picture, { pos: k.vec2(60, 60) });
                    },
                }]);
                (window as any).advance(2);
                order.length = 0;
                (window as any).advance();
                const result = {
                    order: [...order],
                    redInside: (window as any).pixel(10, 10),
                    redOutside: (window as any).pixel(10, 30),
                    greenInside: (window as any).pixel(22, 10),
                    greenOutside: (window as any).pixel(35, 10),
                    picture: (window as any).pixel(65, 65),
                };
                k.quit();
                (window as any).advance();
                return result;
            }, { mode, withHooks });
            expect(result.picture[2]).toBeGreaterThan(100);
            const inside = mode === "intersect";
            expect((inside ? result.redInside : result.redOutside)[0])
                .toBeGreaterThan(100);
            expect((inside ? result.redOutside : result.redInside)[0])
                .toBeLessThan(40);
            expect((inside ? result.greenInside : result.greenOutside)[1])
                .toBeGreaterThan(100);
            expect((inside ? result.greenOutside : result.greenInside)[1])
                .toBeLessThan(40);
            expect(result.order).toEqual(
                withHooks
                    ? ["before", "target", "child", "after"]
                    : ["target", "child"],
            );
        }
    }
});

test("cancelled layer hooks restore ordinary onDraw scale rotation and shake timing", async ({ page }) => {
    for (const cancelFromDraw of [false, true]) {
        for (const property of ["scale", "rotation", "shake"] as const) {
            const points = await page.evaluate(
                async ({ property, cancelFromDraw }) => {
                    const k = await (window as any).make();
                    k.setLayers(["world"], "world");
                    const before = k.onBeforeLayerDraw("world", () => {});
                    const after = k.onAfterLayerDraw("world", () => {});
                    if (!cancelFromDraw) {
                        before.cancel();
                        after.cancel();
                    }
                    k.setCamPos(100, 100);
                    const points: number[][] = [];
                    k.add([k.rect(1, 1)]).onDraw(() => {
                        const p = k.toScreen(
                            k.vec2(property === "shake" ? 100 : 130, 100),
                        );
                        points.push([p.x, p.y]);
                    });
                    k.onDraw(() => {
                        if (cancelFromDraw) {
                            before.cancel();
                            after.cancel();
                        }
                        if (property === "scale") k.setCamScale(2);
                        else if (property === "rotation") k.setCamRot(90);
                        else k.shake(10);
                    });
                    (window as any).advance(2);
                    const observed = points.map(point => [...point]);
                    k.quit();
                    (window as any).advance();
                    return observed;
                },
                { property, cancelFromDraw },
            );
            expect(points).toHaveLength(2);
            expect(points[0][0]).toBeCloseTo(
                property === "shake" ? 100 : 130,
                5,
            );
            expect(points[0][1]).toBeCloseTo(100, 5);
            if (property === "scale") {
                expect(points[1][0]).toBeCloseTo(160, 5);
                expect(points[1][1]).toBeCloseTo(100, 5);
            }
            else if (property === "rotation") {
                expect(points[1][0]).toBeCloseTo(100, 5);
                expect(Math.abs(points[1][1] - 100)).toBeCloseTo(30, 5);
            }
            else {
                expect(Math.hypot(points[1][0] - 100, points[1][1] - 100))
                    .toBeCloseTo(10, 5);
            }
        }
    }
    const r = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["world"], "world");
        k.setCamPos(100, 100);
        const before = k.onBeforeLayerDraw("world", () => {});
        const after = k.onAfterLayerDraw("world", () => {});
        let frame = 0;
        const points: number[][] = [];
        const point = () => {
            const p = k.toScreen(k.vec2(130, 100));
            return [p.x, p.y];
        };
        // Camera tracking can run before another draw listener cancels the hooks.
        k.onDraw(() => {
            if (frame === 0) k.setCamPos(120, 100);
        });
        k.onDraw(() => {
            if (frame === 0) {
                before.cancel();
                after.cancel();
                points.push(point());
                k.setCamScale(2);
                points.push(point());
            }
            else points.push(point());
            frame++;
        });
        (window as any).advance(2);
        const observed = points.map(p => [...p]);
        k.quit();
        (window as any).advance();
        return observed;
    });
    expect(r).toHaveLength(3);
    expect(r[1]).toEqual(r[0]);
    expect(r[2][0]).toBeCloseTo(120, 5);
    expect(r[2][1]).toBeCloseTo(100, 5);
});

test("after-hook camera changes preserve commands already queued by that hook", async ({ page }) => {
    for (const sample of cameraSamples) {
        const pixels = await page.evaluate(async sample => {
            const k = await (window as any).make();
            k.setLayers(["back", "front"], "front");
            k.setCamPos(100, 100);
            k.add([
                k.rect(10, 10),
                k.pos(130, 80),
                k.color(0, 255, 0),
                k.layer("front"),
            ]);
            k.onAfterLayerDraw("back", () => {
                k.drawRect({
                    pos: k.vec2(60, 80),
                    width: 10,
                    height: 10,
                    color: k.rgb(255, 0, 0),
                });
                if (sample.property === "position") k.setCamPos(120, 100);
                else if (sample.property === "scale") k.setCamScale(2);
                else k.setCamRot(90);
                k.drawRect({
                    pos: k.vec2(130, 60),
                    width: 10,
                    height: 10,
                    color: k.rgb(0, 0, 255),
                });
            });
            (window as any).advance();
            const pixels = {
                queued: (window as any).pixel(65, 85),
                movedQueued: (window as any).pixel(...sample.movedQueued),
                following: (window as any).pixel(...sample.following),
                oldFollowing: (window as any).pixel(135, 65),
                object: (window as any).pixel(...sample.object),
                oldObject: (window as any).pixel(135, 85),
            };
            k.quit();
            (window as any).advance();
            return pixels;
        }, sample);
        expect(pixels.queued[0], sample.property).toBeGreaterThan(100);
        expect(pixels.movedQueued[0], sample.property).toBeLessThan(40);
        expect(pixels.following[2], sample.property).toBeGreaterThan(100);
        expect(pixels.oldFollowing[2], sample.property).toBeLessThan(40);
        expect(pixels.object[1], sample.property).toBeGreaterThan(100);
        expect(pixels.oldObject[1], sample.property).toBeLessThan(40);
    }
});

test("after-hook rotation and scale affect the next layer together", async ({ page }) => {
    const points = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["back", "front"], "front");
        k.setCamPos(100, 100);
        const points: number[][] = [];
        for (const name of ["back", "front"]) {
            k.add([k.rect(1, 1), k.layer(name)]).onDraw(() => {
                const p = k.toScreen(k.vec2(130, 100));
                points.push([p.x, p.y]);
            });
        }
        k.onAfterLayerDraw("back", () => {
            k.setCamRot(90);
            k.setCamScale(2);
        });
        (window as any).advance();
        return points;
    });
    expect(points).toHaveLength(2);
    expect(points[0][0]).toBeCloseTo(130, 5);
    expect(points[0][1]).toBeCloseTo(100, 5);
    expect(points[1][0]).toBeCloseTo(100, 5);
    expect(Math.abs(points[1][1] - 100)).toBeCloseTo(60, 5);
});

test("layer camera changes preserve direct and inherited fixed drawing", async ({ page }) => {
    const pixels = await page.evaluate(async () => {
        const k = await (window as any).make();
        k.setLayers(["back", "front"], "front");
        const fixedParent = k.add([k.fixed(), k.pos(20, 20), k.layer("front")]);
        fixedParent.add([k.rect(10, 10), k.color(255, 0, 0)]);
        k.add([
            k.fixed(),
            k.pos(40, 20),
            k.rect(10, 10),
            k.color(0, 0, 255),
            k.layer("front"),
        ]);
        k.add([
            k.pos(130, 80),
            k.rect(10, 10),
            k.color(0, 255, 0),
            k.layer("front"),
        ]);
        k.onBeforeLayerDraw("front", () => {
            k.setCamPos(120, 100);
            k.setCamScale(2);
        });
        (window as any).advance();
        return {
            inherited: (window as any).pixel(25, 25),
            direct: (window as any).pixel(45, 25),
            world: (window as any).pixel(125, 65),
        };
    });
    expect(pixels.inherited[0]).toBeGreaterThan(100);
    expect(pixels.direct[2]).toBeGreaterThan(100);
    expect(pixels.world[1]).toBeGreaterThan(100);
});

test("cached render targets retain their contents until explicitly refreshed", async ({ page }) => {
    for (const kind of ["framebuffer", "picture"] as const) {
        for (const childrenOnly of [false, true]) {
            for (const withHooks of [false, true]) {
                const frames = await page.evaluate(
                    async ({ kind, childrenOnly, withHooks }) => {
                        const k = await (window as any).make();
                        k.setLayers(["capture", "display"], "capture");
                        const order: string[] = [];
                        const canvas = k.makeCanvas(200, 200);
                        const picture = new k.Picture();
                        if (withHooks) {
                            k.onBeforeLayerDraw(
                                "capture",
                                () => order.push("before"),
                            );
                            k.onAfterLayerDraw(
                                "capture",
                                () => order.push("after"),
                            );
                        }
                        const target = k.add([
                            k.drawon(kind === "picture" ? picture : canvas.fb, {
                                refreshOnly: true,
                                childrenOnly,
                            }),
                            k.layer("capture"),
                        ]);
                        target.onDraw(() => order.push("parent"));
                        const child = target.add([
                            k.pos(20, 20),
                            k.rect(10, 10),
                            k.color(255, 0, 0),
                        ]);
                        child.onDraw(() => order.push("child"));
                        if (kind === "picture") {
                            k.add([k.layer("display"), {
                                draw() {
                                    k.drawPicture(picture, {});
                                },
                            }]);
                        }
                        const frame = () => {
                            order.length = 0;
                            (window as any).advance();
                            const data = kind === "picture"
                                ? (window as any).pixel(25, 25)
                                : canvas.toImageData().data;
                            let red = 0;
                            let blue = 0;
                            for (let i = 0; i < data.length; i += 4) {
                                red = Math.max(red, data[i]);
                                blue = Math.max(blue, data[i + 2]);
                            }
                            return { red, blue, order: [...order] };
                        };
                        const first = frame();
                        child.color = k.rgb(0, 0, 255);
                        const cached = frame();
                        target.refresh();
                        const refreshed = frame();
                        k.quit();
                        (window as any).advance();
                        return [first, cached, refreshed];
                    },
                    { kind, childrenOnly, withHooks },
                );
                for (const frame of frames.slice(0, 2)) {
                    expect(frame.red).toBeGreaterThan(100);
                    expect(frame.blue).toBeLessThan(40);
                }
                expect(frames[2].blue).toBeGreaterThan(100);
                expect(frames[2].red).toBeLessThan(40);
                for (let i = 0; i < frames.length; i++) {
                    const order = frames[i].order;
                    expect(order.filter(value => value === "child"))
                        .toHaveLength(i === 1 ? 0 : 1);
                    expect(order.filter(value => value === "parent"))
                        .toHaveLength(i === 1 && !childrenOnly ? 0 : 1);
                    if (withHooks) {
                        expect(order[0]).toBe("before");
                        expect(order[order.length - 1]).toBe("after");
                    }
                }
            }
        }
    }
});

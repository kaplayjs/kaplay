import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

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
    await page.evaluate(async () => {
        const w = window as any;
        const k = w.k = kaplay({
            width: 640,
            height: 480,
            pixelDensity: 1,
            background: [0, 0, 0],
            global: false,
            loadingScreen: false,
        });
        k.debug.fps = () => 60;
        k.debug.rawFPS = () => 60;
        k.debug.inspect = true;
        await Promise.resolve();
        await Promise.resolve();
        w.advance(3);
        w.rows = () => k.debug.getWatches();
        w.paint = () => {
            w.advance();
            return w.rows();
        };
        w.image = () => {
            const canvas = document.querySelector("canvas")!;
            const gl = canvas.getContext("webgl")!;
            const pixels = new Uint8Array(canvas.width * canvas.height * 4);
            gl.readPixels(
                0,
                0,
                canvas.width,
                canvas.height,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                pixels,
            );
            let hash = 2166136261;
            for (const pixel of pixels) {
                hash = Math.imul(hash ^ pixel, 16777619);
            }
            return hash >>> 0;
        };
    });
});

test("property identities, key types and registration ordering remain distinct", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint } = window as any;
        const a = { score: 7, 3: "third" };
        const b = { score: 11 };
        const symbol = Symbol("token");
        const c = { [symbol]: "symbolic" };
        k.debug.watch(a, "score", "same");
        k.debug.watch(b, "score", "same");
        k.debug.watch(a, 3);
        k.debug.watch(c, symbol);
        k.debug.watch(a, "score", "renamed");
        const first = paint();
        a.score = 19;
        k.debug.removeWatch(a, 3);
        k.debug.removeWatch(a, 3);
        return [first, paint()];
    });
    expect(r[0].map((x: any) => x.name)).toEqual([
        "renamed",
        "same",
        "3",
        "Symbol(token)",
    ]);
    expect(r[0].map((x: any) => x.kind)).toEqual(Array(4).fill("property"));
    expect(r[0].map((x: any) => x.error)).toEqual(Array(4).fill(false));
    expect(r[0][0].value).toContain("7");
    expect(r[0][1].value).toContain("11");
    expect(r[0][2].value).toContain("third");
    expect(r[0][3].value).toContain("symbolic");
    expect(r[1].map((x: any) => x.name)).toEqual([
        "renamed",
        "same",
        "Symbol(token)",
    ]);
    expect(r[1][0].value).toContain("19");
});

test("quick watches capture values and have an independent ordered namespace", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint } = window as any;
        const value = { points: 43 };
        const obj = { score: 17 };
        k.debug.watch(obj, "score", "__proto__");
        k.debug.quickWatch(value, "__proto__");
        k.debug.quickWatch("old", "10");
        k.debug.quickWatch("numeric", "2");
        k.debug.quickWatch("empty", "");
        k.debug.quickWatch("prototype", "constructor");
        k.debug.quickWatch("replacement", "10");
        k.debug.quickWatch(value, "__proto__");
        value.points = 901;
        k.debug.removeWatch(obj, "score");
        return paint();
    });
    expect(r.map((x: any) => [x.kind, x.name])).toEqual([
        ["quick", "__proto__"],
        ["quick", "10"],
        ["quick", "2"],
        ["quick", ""],
        ["quick", "constructor"],
    ]);
    expect(r[0].value).toContain("43");
    expect(r[0].value).not.toContain("901");
    expect(r[1].value).toContain("replacement");
});

test("property and quick rows can share a label in the same displayed frame", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint } = window as any;
        k.debug.watch({ n: 37 }, "n", "count");
        k.debug.quickWatch(83, "count");
        return paint();
    });
    expect(r).toHaveLength(2);
    expect(r.find((x: any) => x.kind === "property").value).toContain("37");
    expect(r.find((x: any) => x.kind === "quick").value).toContain("83");
});

test("sampling follows visible frames while observations are detached and passive", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, advance, rows } = window as any;
        let count = 0;
        const obj = {
            get n() {
                return ++count;
            },
        };
        k.debug.watch(obj, "n");
        const before = rows();
        k.debug.inspect = false;
        advance(3);
        const hiddenCount = count;
        k.debug.inspect = true;
        advance();
        const first = rows().map((entry: any) => ({ ...entry }));
        const a = rows();
        for (
            const change of [
                () => Reflect.set(a[0], "name", "corrupted"),
                () => Reflect.set(a[0], "value", "corrupted"),
                () => Reflect.set(a, a.length, { name: "fake" }),
            ]
        ) {
            try {
                change();
            } catch {
                // Readonly copies may reject writes.
            }
        }
        rows();
        const readCount = count;
        const intact = rows();
        k.debug.paused = true;
        advance(2);
        return {
            before,
            hiddenCount,
            first,
            readCount,
            intact,
            count,
            last: rows(),
        };
    });
    expect(r.before).toEqual([]);
    expect(r.hiddenCount).toBe(0);
    expect(r.readCount).toBe(1);
    expect(r.first).toEqual(r.intact);
    expect(r.count).toBe(3);
    expect(r.last[0].value).toContain("3");
});

test("quick watches wait for visibility, expire, and can be renewed", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, advance, paint, rows } = window as any;
        k.debug.inspect = false;
        k.debug.quickWatch(14, "transient");
        advance(4);
        k.debug.inspect = true;
        const first = paint();
        rows();
        rows();
        k.debug.quickWatch(21, "transient");
        const renewed = paint();
        const expired = paint();
        k.debug.quickWatch(35, "transient");
        const recreated = paint();
        return { first, renewed, expired, recreated };
    });
    expect(r.first[0].value).toContain("14");
    expect(r.renewed[0].value).toContain("21");
    expect(r.expired).toEqual([]);
    expect(r.recreated[0].value).toContain("35");
});

test("paused frames retain quick entries while property watches stay live", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, advance, paint, rows } = window as any;
        const obj = { n: 1 };
        k.debug.watch(obj, "n");
        k.debug.quickWatch("keep", "paused");
        paint();
        k.debug.paused = true;
        obj.n = 51;
        advance(4);
        const paused = rows();
        k.debug.quickWatch("new", "duringPause");
        advance(2);
        const added = rows();
        k.debug.paused = false;
        const resumed = paint();
        return { paused, added, resumed, next: paint() };
    });
    expect(r.paused.find((x: any) => x.name === "paused").value).toContain(
        "keep",
    );
    expect(r.paused.find((x: any) => x.name === "n").value).toContain("51");
    expect(r.added.some((x: any) => x.name === "duringPause")).toBe(true);
    expect(r.next.map((x: any) => x.kind)).toEqual(["property"]);
    expect(r.resumed.map((x: any) => x.kind)).toEqual(["property"]);
    expect(r.resumed.find((x: any) => x.name === "n").error).toBe(false);
});

test("array, object and cyclic previews are readable without aborting rendering", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint } = window as any;
        const cycle: any = { label: "orbit" };
        cycle.self = cycle;
        const shared = { label: "shared" };
        const obj = {
            array: [null, undefined, true, 23],
            cycle,
            aliases: [shared, shared],
        };
        for (const key of Object.keys(obj)) k.debug.watch(obj, key);
        k.debug.quickWatch(cycle, "captured");
        return paint();
    });
    expect(r).toHaveLength(4);
    expect(r.every((x: any) => !x.error && typeof x.value === "string")).toBe(
        true,
    );
    const property = r.filter((entry: any) => entry.kind === "property");
    const quick = r.filter((entry: any) => entry.kind === "quick");
    expect(property.map((entry: any) => entry.name)).toEqual([
        "array",
        "cycle",
        "aliases",
    ]);
    expect(quick).toHaveLength(1);
    for (const token of ["null", "undefined", "true", "23"]) {
        expect(property[0].value).toContain(token);
    }
    expect(property[1].value).toContain("orbit");
    expect(property[2].value).toContain("shared");
    expect(quick[0].value).toContain("orbit");
});

test("getter failures stay isolated and property previews recover", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint } = window as any;
        let broken = true;
        const obj = {
            get first() {
                if (broken) throw new Error("sensor offline");
                return 88;
            },
            bad: {
                toString() {
                    throw new Error("conversion failed");
                },
            },
            good: 39,
        };
        k.debug.watch(obj, "first");
        k.debug.watch(obj, "bad");
        k.debug.watch(obj, "good");
        k.debug.quickWatch(obj.bad, "quickError");
        const failed = paint();
        broken = false;
        obj.bad = {
            toString() {
                return "restored";
            },
        };
        return { failed, recovered: paint() };
    });
    const properties = r.failed.filter((entry: any) =>
        entry.kind === "property"
    );
    const quick = r.failed.filter((entry: any) => entry.kind === "quick");
    expect(properties[0].error).toBe(true);
    expect(properties[2].error).toBe(false);
    expect(properties[2].value).toContain("39");
    expect(quick).toHaveLength(1);
    expect(typeof quick[0].value).toBe("string");
    const recovered = r.recovered.filter((entry: any) =>
        entry.kind === "property"
    );
    expect(recovered.map((entry: any) => entry.error)).toEqual([
        false,
        false,
        false,
    ]);
    expect(recovered[0].value).toContain("88");
});

test("clear empties the cache and repeated removal preserves unrelated entries", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint, rows } = window as any;
        const a = { n: 1 }, b = { n: 2 };
        k.debug.watch(a, "n", "a");
        k.debug.watch(b, "n", "b");
        paint();
        k.debug.removeWatch(a, "n");
        k.debug.removeWatch(a, "n");
        const kept = paint();
        k.debug.quickWatch("x", "q");
        k.debug.clearWatches();
        k.debug.clearWatches();
        const cleared = rows();
        k.debug.watch(a, "n", "fresh");
        return { kept, cleared, fresh: paint() };
    });
    expect(r.kept.map((x: any) => x.name)).toEqual(["b"]);
    expect(r.cleared).toEqual([]);
    expect(r.fresh.map((x: any) => x.name)).toEqual(["fresh"]);
});

test("scene changes reset old watches before destination scene registration", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, advance, paint, rows } = window as any;
        const atEntry: any[] = [];
        k.scene("a", () => {
            atEntry.push(rows());
            k.debug.watch({ n: 61 }, "n", "a");
        });
        k.scene("b", () => {
            atEntry.push(rows());
            k.debug.watch({ n: 72 }, "n", "b");
        });
        k.debug.watch({ n: 9 }, "n", "old");
        k.debug.quickWatch(19, "oldQuick");
        paint();
        k.go("a");
        advance();
        const a = paint();
        k.pushScene("b");
        advance();
        const b = paint();
        k.popScene();
        advance();
        return { atEntry, a, b, back: paint() };
    });
    expect(r.atEntry).toEqual([[], [], []]);
    expect(r.a.map((x: any) => x.name)).toEqual(["a"]);
    expect(r.b.map((x: any) => x.name)).toEqual(["b"]);
    expect(r.back.map((x: any) => x.name)).toEqual(["a"]);
});

test("destroying watched objects removes observations despite cleared events", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint } = window as any;
        let reads = 0;
        const parent = k.add([]);
        const child = parent.add([{
            get reading() {
                reads++;
                return 12;
            },
        }]);
        const sibling = k.add([{ reading: 24 }]);
        k.debug.watch(child, "reading", "gone");
        k.debug.watch(sibling, "reading", "live");
        k.debug.watch({ n: 36 }, "n", "plain");
        paint();
        const before = reads;
        child.clearEvents();
        parent.clearEvents();
        parent.destroy();
        return { before, after: paint(), reads };
    });
    expect(r.reads).toBe(r.before);
    expect(r.after.map((x: any) => x.name)).toEqual(["live", "plain"]);
});

test("engine teardown clears retained debug observations", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint, advance } = window as any;
        k.debug.watch({ n: 1 }, "n");
        paint();
        const debug = k.debug;
        k.quit();
        advance();
        return debug.getWatches();
    });
    expect(r).toEqual([]);
});

test("watches are visibly rendered, update pixels and stay fixed under camera changes", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint, advance, image } = window as any;
        const before = image();
        const obj = { n: "WATCHVALUE" };
        k.debug.watch(obj, "n", "WATCHLABEL");
        paint();
        const added = image();
        obj.n = "DIFFERENTVALUE";
        paint();
        const changed = image();
        k.setCamPos(900, -400);
        k.setCamScale(2, 3);
        k.setCamRot(37);
        advance(2);
        const movedCamera = image();
        k.debug.inspect = false;
        advance();
        const hidden = image();
        k.debug.inspect = true;
        k.debug.clearWatches();
        advance(2);
        return {
            before,
            added,
            changed,
            movedCamera,
            hidden,
            cleared: image(),
        };
    });
    expect(r.added).not.toBe(r.before);
    expect(r.changed).not.toBe(r.added);
    expect(r.movedCamera).toBe(r.changed);
    expect(r.hidden).not.toBe(r.changed);
    expect(r.cleared).toBe(r.before);
});

test("markup in labels and string values is displayed literally", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint, image } = window as any;
        const obj = { n: "VALUE" };
        k.debug.watch(obj, "n", "LABEL");
        paint();
        const plain = image();
        k.debug.watch(obj, "n", "[marked]LABEL[/marked]");
        paint();
        const label = image();
        k.debug.watch(obj, "n", "LABEL");
        obj.n = "[marked]VALUE[/marked]";
        const entries = paint();
        return { plain, label, value: image(), entries };
    });
    expect(r.label).not.toBe(r.plain);
    expect(r.value).not.toBe(r.plain);
    expect(r.entries[0].value).toContain("[marked]VALUE[/marked]");
    expect(r.entries[0].error).toBe(false);
});

test("watch rendering coexists with logs and hover inspection", async ({ page }) => {
    await page.mouse.move(50, 40);
    const r = await page.evaluate(() => {
        const { k, paint, image } = window as any;
        k.debug.watch({ n: 47 }, "n", "alive");
        let label = "INSPECTOR";
        k.add([k.pos(0), k.rect(120, 80), k.area(), {
            inspect() {
                return label;
            },
        }]);
        paint();
        const inspect = image();
        label = "DIFFERENT_INSPECTION";
        paint();
        const noInspect = image();
        k.debug.log("LOGALIVE");
        paint();
        const log = image();
        k.debug.clearLog();
        paint();
        return {
            inspect,
            noInspect,
            log,
            cleared: image(),
            rows: k.debug.getWatches(),
        };
    });
    expect(r.inspect).not.toBe(r.noInspect);
    expect(r.log).not.toBe(r.noInspect);
    expect(r.cleared).toBe(r.noInspect);
    expect(r.rows[0].value).toContain("47");
});

test("clearing from a watched getter does not republish cleared observations", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint, rows } = window as any;
        let clear = false;
        let laterReads = 0;
        const obj = {
            get first() {
                if (clear) k.debug.clearWatches();
                return 1;
            },
            get later() {
                laterReads++;
                return 2;
            },
        };
        k.debug.watch(obj, "first");
        k.debug.watch(obj, "later");
        paint();
        const before = laterReads;
        clear = true;
        const cleared = paint();
        paint();
        return { before, laterReads, cleared, cached: rows() };
    });
    expect(r.laterReads).toBe(r.before);
    expect(r.cleared).toEqual([]);
    expect(r.cached).toEqual([]);
});

test("disabling debug suppresses watch getters even with inspect enabled", async ({ page }) => {
    const r = await page.evaluate(async () => {
        const { k, advance } = window as any;
        k.quit();
        advance();
        const next = kaplay({
            global: false,
            debug: false,
            loadingScreen: false,
        });
        let calls = 0;
        next.debug.inspect = true;
        next.debug.watch({
            get n() {
                calls++;
                return 9;
            },
        }, "n");
        await Promise.resolve();
        await Promise.resolve();
        advance(5);
        return { calls, rows: next.debug.getWatches() };
    });
    expect(r.calls).toBe(0);
    expect(r.rows).toEqual([]);
});

test("public declarations reject weak keys, mutable observations and non-void methods", () => {
    const source = readFileSync("tests/watch/types-317179.ts", "utf8")
        .replace("\"../../src/kaplay\"", JSON.stringify(resolve("src/kaplay")));
    const dir = mkdtempSync(join(tmpdir(), "watch-types-"));
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
            "--allowImportingTsExtensions",
            "src/.env.d.ts",
            file,
        ], { encoding: "utf8" });
    };
    try {
        const positive = run(source);
        expect(positive.status, positive.stdout + positive.stderr).toBe(0);
        for (
            const bad of [
                "k.debug.watch(object, \"absent\");",
                "k.debug.removeWatch(object, \"absent\");",
                "observations.push(observations[0]);",
                "observations[0].name = \"changed\";",
                "observations[0].error = false;",
                "observations[0].value = \"changed\";",
                "observations[0].kind = \"property\";",
            ]
        ) {
            const negative = run(source + "\n" + bad);
            expect(
                negative.status,
                bad + "\n" + negative.stdout + negative.stderr,
            ).not.toBe(0);
            expect(negative.stdout + negative.stderr).toContain("error TS");
        }
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

for (const layout of ["many entries", "one wrapped value"]) {
    test(`overflowing watches scroll only under the pointer and clamp after removal: ${layout}`, async ({ page }) => {
        const r = await page.evaluate(layout => {
            const w = window as any;
            const { k, paint, image, advance } = w;
            k.debug.paused = true;
            advance();
            const canvas = document.querySelector("canvas")!;
            const gl = canvas.getContext("webgl")!;
            const bytes = () => {
                const a = new Uint8Array(canvas.width * canvas.height * 4);
                gl.readPixels(
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    a,
                );
                return a;
            };
            const blank = bytes();
            const objects: { n: number | string }[] = Array.from(
                { length: 50 },
                (_, n) => ({ n }),
            );
            k.debug.watch(objects[0], "n", "row_0");
            paint();
            const single = image();
            if (layout === "one wrapped value") {
                objects[0].n = "a long value with several words ".repeat(180);
            }
            else {
                for (let i = 1; i < objects.length; i++) {
                    k.debug.watch(objects[i], "n", `row_${i}`);
                }
            }
            const entries = paint();
            const top = image();
            const rendered = bytes();
            let x0 = canvas.width, y0 = canvas.height, x1 = 0, y1 = 0;
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const index = (y * canvas.width + x) * 4;
                    if (
                        rendered.slice(index, index + 3).some((v, c) =>
                            v !== blank[index + c]
                        )
                    ) {
                        x0 = Math.min(x0, x);
                        x1 = Math.max(x1, x);
                        y0 = Math.min(y0, canvas.height - y - 1);
                        y1 = Math.max(y1, canvas.height - y - 1);
                    }
                }
            }
            const rect = canvas.getBoundingClientRect();
            const wheel = (x: number, y: number, deltaY: number) => {
                canvas.dispatchEvent(
                    new MouseEvent("mousemove", {
                        clientX: rect.left + x * rect.width / canvas.width,
                        clientY: rect.top + y * rect.height / canvas.height,
                        bubbles: true,
                    }),
                );
                canvas.dispatchEvent(
                    new WheelEvent("wheel", {
                        deltaY,
                        bubbles: true,
                        cancelable: true,
                    }),
                );
                advance(2);
                return image();
            };
            const outside = wheel(canvas.width - 1, 1, 100000);
            const x = (x0 + x1) / 2, y = (y0 + y1) / 2;
            const bottom = wheel(x, y, 100000);
            const clamped = wheel(x, y, 100000);
            const scrollEntries = k.debug.getWatches();
            const back = wheel(x, y, -100000);
            wheel(x, y, 100000);
            for (let i = 1; i < objects.length; i++) {
                k.debug.removeWatch(objects[i], "n");
            }
            objects[0].n = 0;
            paint();
            return {
                single,
                top,
                outside,
                bottom,
                clamped,
                back,
                shrunk: image(),
                entries,
                scrollEntries,
            };
        }, layout);
        expect(r.entries).toHaveLength(layout === "many entries" ? 50 : 1);
        expect(r.outside).toBe(r.top);
        expect(r.bottom).not.toBe(r.top);
        expect(r.clamped).toBe(r.bottom);
        expect(r.back).toBe(r.top);
        expect(r.scrollEntries).toEqual(r.entries);
        expect(r.shrunk).toBe(r.single);
    });
}

test("watched accessors reached through object previews are sampled once", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint } = window as any;
        let selfReads = 0,
            nestedReads = 0,
            constructorReads = 0,
            methodReads = 0;
        const nested = {
            get value() {
                nestedReads++;
                return 79;
            },
        };
        const owner = {
            get self(): unknown {
                selfReads++;
                return owner;
            },
            nested,
            get constructor() {
                constructorReads++;
                return Object;
            },
            get toString() {
                methodReads++;
                return Object.prototype.toString;
            },
        };
        k.debug.watch(owner, "self", "recursive");
        k.debug.watch(nested, "value", "direct");
        k.debug.watch(owner, "constructor", "metadata");
        k.debug.watch(owner, "toString", "method");
        const first = paint();
        const counts = [selfReads, nestedReads, constructorReads, methodReads];
        k.debug.paused = true;
        paint();
        return {
            first,
            counts,
            after: [selfReads, nestedReads, constructorReads, methodReads],
        };
    });
    expect(r.first.every((entry: any) => !entry.error)).toBe(true);
    expect(r.counts).toEqual([1, 1, 1, 1]);
    expect(r.after).toEqual([2, 2, 2, 2]);
});

test("array accessors and failed reads share the visible frame sample", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint } = window as any;
        let arrayReads = 0, failedReads = 0;
        const array: string[] = [];
        Object.defineProperty(array, "0", {
            enumerable: true,
            get() {
                arrayReads++;
                return "array-value";
            },
        });
        const broken = {
            get value() {
                failedReads++;
                throw new Error("unavailable");
            },
        };
        const owner = { array, broken };
        k.debug.watch(owner, "array", "arrayPreview");
        k.debug.watch(array, 0, "directItem");
        k.debug.watch(owner, "broken", "objectPreview");
        k.debug.watch(broken, "value", "directError");
        const first = paint();
        const counts = [arrayReads, failedReads];
        k.debug.paused = true;
        paint();
        return { first, counts, after: [arrayReads, failedReads] };
    });
    expect(r.counts).toEqual([1, 1]);
    expect(r.after).toEqual([2, 2]);
    expect(r.first.map((entry: any) => entry.error)).toEqual([
        false,
        false,
        true,
        true,
    ]);
    expect(r.first[0].value).toContain("array-value");
    expect(r.first[1].value).toContain("array-value");
});

test("quick entries draw captured values, renew in place and disappear visibly", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint, advance, image } = window as any;
        const blank = image();
        k.debug.quickWatch("FIRST_VALUE", "first");
        k.debug.quickWatch("SECOND_VALUE", "second");
        paint();
        const initial = image();
        k.debug.quickWatch("CHANGED_FIRST", "first");
        k.debug.quickWatch("SECOND_VALUE", "second");
        const firstRows = paint();
        const firstChanged = image();
        k.debug.quickWatch("CHANGED_FIRST", "first");
        k.debug.quickWatch("CHANGED_SECOND", "second");
        paint();
        const secondChanged = image();
        k.debug.paused = true;
        paint();
        const paused = image();
        advance(3);
        const retained = image();
        k.debug.paused = false;
        const expiredRows = paint();
        return {
            blank,
            initial,
            firstRows,
            firstChanged,
            secondChanged,
            paused,
            retained,
            expiredRows,
            expired: image(),
        };
    });
    expect(r.initial).not.toBe(r.blank);
    expect(r.firstChanged).not.toBe(r.initial);
    expect(r.secondChanged).not.toBe(r.firstChanged);
    expect(r.firstRows.map((entry: any) => entry.name)).toEqual([
        "first",
        "second",
    ]);
    expect(r.paused).toBe(r.retained);
    expect(r.expiredRows).toEqual([]);
    expect(r.expired).toBe(r.blank);
});

test("watch previews sample custom stringifier accessors once per frame", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint } = window as any;
        let reads = 0;
        const object = Object.create({});
        Object.defineProperty(object, "toString", {
            get() {
                reads++;
                return () => "custom view";
            },
        });
        k.debug.watch({ value: object }, "value");
        k.debug.watch(object, "toString");
        const first = paint();
        const firstReads = reads;
        k.debug.paused = true;
        const second = paint();
        return { first, second, firstReads, reads };
    });
    expect(r.firstReads).toBe(1);
    expect(r.reads).toBe(2);
    expect(r.first[0].value).toContain("custom view");
    expect(r.second[0].value).toContain("custom view");
    expect(r.first.every((entry: any) => !entry.error)).toBe(true);
});

test("ordinary object previews remain readable without a callable toString", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, paint } = window as any;
        const ordinary = { toString: "label", score: 28 };
        const withoutPrototype = Object.assign(Object.create(null), {
            score: 27,
        });
        const owner = { ordinary, withoutPrototype };
        k.debug.watch(owner, "ordinary");
        k.debug.watch(owner, "withoutPrototype");
        k.debug.quickWatch(withoutPrototype, "quick");
        return paint();
    });
    expect(r.map((entry: any) => entry.error)).toEqual([false, false, false]);
    expect(r[0].value).toContain("label");
    expect(r[0].value).toContain("28");
    expect(r[1].value).toContain("27");
    expect(r[2].value).toContain("27");
});

import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";

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
        window.cancelAnimationFrame = id => {
            callbacks.delete(id);
        };
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
            width: 256,
            height: 192,
            pixelDensity: 1,
            background: [0, 0, 0],
            debug: false,
            loadingScreen: false,
            global: false,
        });
        const makeImage = (colors: string[]) => {
            const image = document.createElement("canvas");
            image.width = colors.length * 4;
            image.height = 4;
            const ctx = image.getContext("2d")!;
            colors.forEach((color, i) => {
                ctx.fillStyle = color;
                ctx.fillRect(i * 4, 0, 4, 4);
            });
            return image;
        };
        k.loadSprite("red", makeImage(["#ff0000"]), { singular: true });
        k.loadSprite("green", makeImage(["#00ff00"]), { singular: true });
        k.loadSprite("sheet", makeImage(["#0000ff", "#ffff00"]), {
            sliceX: 2,
            singular: true,
        });
        k.loadSprite("packed", makeImage(["#00ffff", "#ff00ff"]), {
            sliceX: 2,
        });
        await Promise.resolve();
        await Promise.resolve();
        w.advance(3);
        const canvas = document.querySelector("canvas")!;
        const gl = w.gl = canvas.getContext("webgl")!;
        w.pixel = (x: number, y: number) => {
            const data = new Uint8Array(4);
            gl.readPixels(
                x,
                canvas.height - y - 1,
                1,
                1,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                data,
            );
            return Array.from(data).slice(0, 3);
        };
        w.colliders = (obj: any) =>
            obj.children.filter((child: any) =>
                child.has("area") && child.has("body")
            );
        w.rects = (obj: any) =>
            w.colliders(obj).map((child: any) => {
                const shape = child.worldArea().transform(
                    obj.transform.inverse,
                );
                const box = shape.bbox();
                if (Math.abs(shape.area() - box.width * box.height) > 1e-6) {
                    throw new Error("Collider does not cover its rectangle");
                }
                return [
                    box.pos.x,
                    box.pos.y,
                    box.width,
                    box.height,
                    child.isStatic,
                ];
            });
        w.descendants = (obj: any): number =>
            obj.children.reduce(
                (count: number, child: any) => count + 1 + w.descendants(child),
                0,
            );
        w.makeTerrain = (
            map: string[],
            tiles: any = { "#": { solid: true } },
            tileWidth = 8,
            tileHeight = 8,
        ) => k.add([
            k.pos(0),
            k.bakedLevel(map, { tileWidth, tileHeight, tiles }),
        ]);
        w.stats = {
            creates: [] as WebGLBuffer[],
            deletes: [] as WebGLBuffer[],
            uploads: [] as WebGLBuffer[],
            bytes: 0,
            textures: [] as WebGLTexture[],
        };
        const bound = new Map<number, WebGLBuffer | null>();
        for (
            const name of [
                "createBuffer",
                "deleteBuffer",
                "bindBuffer",
                "bufferData",
                "bufferSubData",
                "deleteTexture",
            ]
        ) {
            const original = (gl as any)[name].bind(gl);
            (gl as any)[name] = (...args: any[]) => {
                const result = original(...args);
                if (name === "createBuffer") w.stats.creates.push(result);
                if (name === "deleteBuffer") w.stats.deletes.push(args[0]);
                if (name === "bindBuffer") bound.set(args[0], args[1]);
                if (name === "bufferData" || name === "bufferSubData") {
                    w.stats.uploads.push(bound.get(args[0]));
                    const source = args[name === "bufferData" ? 1 : 2];
                    w.stats.bytes += typeof source === "number"
                        ? source
                        : source?.byteLength ?? 0;
                }
                if (name === "deleteTexture") w.stats.textures.push(args[0]);
                return result;
            };
        }
    });
});

function checkPartition(rects: number[][], map: string[], tw = 8, th = 8) {
    const width = Math.max(0, ...map.map(row => row.length));
    const overlap = (a: number[], b: number[]) =>
        Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]))
        * Math.max(
            0,
            Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]),
        );
    for (const [x, y, w, h, isStatic] of rects) {
        expect(isStatic).toBe(true);
        expect([x, y, w, h].every(Number.isFinite)).toBe(true);
        expect(w).toBeGreaterThan(0);
        expect(h).toBeGreaterThan(0);
        expect(x).toBeGreaterThanOrEqual(-1e-7);
        expect(y).toBeGreaterThanOrEqual(-1e-7);
        expect(x + w).toBeLessThanOrEqual(width * tw + 1e-7);
        expect(y + h).toBeLessThanOrEqual(map.length * th + 1e-7);
    }
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < width; x++) {
            const cell = [x * tw, y * th, tw, th];
            const covered = rects.reduce(
                (sum, rect) => sum + overlap(cell, rect),
                0,
            );
            expect(covered).toBeCloseTo(map[y][x] === "#" ? tw * th : 0, 6);
        }
    }
    for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
            const [x, y, w, h] = rects[i];
            const [a, b, c, d] = rects[j];
            expect(overlap(rects[i], rects[j])).toBeCloseTo(0, 6);
            const bounding = (Math.max(x + w, a + c) - Math.min(x, a))
                * (Math.max(y + h, b + d) - Math.min(y, b));
            expect(bounding).not.toBeCloseTo(w * h + c * d, 6);
        }
    }
}

test("public types accept readonly definitions and expose cell editing", () => {
    const result = spawnSync(process.execPath, [
        "node_modules/typescript/bin/tsc",
        "--noEmit",
        "--target",
        "esnext",
        "--module",
        "preserve",
        "--moduleResolution",
        "bundler",
        "--skipLibCheck",
        "--allowImportingTsExtensions",
        "--strict",
        "tests/terrain/types.ts",
        "src/.env.d.ts",
    ], { encoding: "utf-8" });
    expect(result.status, result.stdout + result.stderr).toBe(0);
});

test("requires a position component", async ({ page }) => {
    expect(
        await page.evaluate(() => {
            const { k } = window as any;
            if (typeof k.bakedLevel !== "function") return false;
            try {
                k.add([
                    k.bakedLevel(["#"], {
                        tileWidth: 8,
                        tileHeight: 8,
                        tiles: { "#": { solid: true } },
                    }),
                ]);
                return false;
            } catch {
                return true;
            }
        }),
    ).toBe(true);
});

test("snapshots rows and definitions with default frames, ragged gaps and empty symbols", async ({ page }) => {
    const result = await page.evaluate(() => {
        const w = window as any;
        const rows = ["rsx", "g"];
        const defs = {
            r: { sprite: "red" },
            s: { sprite: "sheet", frame: 1 },
            g: { sprite: "green", solid: true },
        };
        const comp = w.k.bakedLevel(rows, {
            tileWidth: 12,
            tileHeight: 20,
            tiles: defs,
        });
        rows[0] = "ggg";
        defs.r.sprite = "green";
        defs.s.frame = 0;
        defs.g.solid = false;
        const obj = w.k.add([w.k.pos(), comp]);
        const blue = w.makeTerrain(["b"], { b: { sprite: "sheet" } });
        blue.pos = w.k.vec2(50, 0);
        const packed = w.makeTerrain(["p"], {
            p: { sprite: "packed", frame: 1 },
        });
        packed.pos = w.k.vec2(70, 0);
        w.advance();
        return {
            pixels: [[6, 10], [18, 10], [30, 10], [6, 30], [18, 30], [54, 4], [
                74,
                4,
            ]]
                .map(([x, y]) => w.pixel(x, y)),
            rects: w.rects(obj),
            children: w.descendants(obj),
        };
    });
    expect(result.pixels).toEqual([
        [255, 0, 0],
        [255, 255, 0],
        [0, 0, 0],
        [0, 255, 0],
        [0, 0, 0],
        [0, 0, 255],
        [255, 0, 255],
    ]);
    checkPartition(result.rects, ["   ", "#"], 12, 20);
});

test("solid coverage is exact and pairwise merged for holes and disconnected shapes", async ({ page }) => {
    const maps = [
        ["####", "####", "####"],
        ["#####", "#   #", "# # #", "#   #", "#####"],
        ["###", "#", "## #", "   #"],
        ["# #", " # ", "# #"],
        ["###  ", " ####", "  ###"],
        [],
        [""],
    ];
    const results = await page.evaluate(maps => {
        const w = window as any;
        return maps.map(map => {
            const obj = w.makeTerrain(map);
            const result = w.rects(obj);
            obj.destroy();
            return result;
        });
    }, maps);
    results.forEach((rects, i) => checkPartition(rects, maps[i]));
});

test("cell edits merge and split colliders synchronously and redraw the new symbols", async ({ page }) => {
    const result = await page.evaluate(() => {
        const w = window as any;
        const obj = w.makeTerrain(["###", "# #", "###"], {
            "#": { sprite: "red", solid: true },
            g: { sprite: "green" },
            s: { sprite: "sheet", frame: 1, solid: true },
        });
        w.advance();
        obj.setTile(1, 1, "#");
        const filled = w.rects(obj);
        obj.setTile(1, 0, "g");
        obj.setTile(1, 1, " ");
        obj.setTile(1, 2, "?");
        const split = w.rects(obj);
        w.advance();
        const pixels = [w.pixel(12, 4), w.pixel(12, 12), w.pixel(4, 12)];
        obj.setTile(0, 1, "s");
        const sameSolidity = w.rects(obj);
        w.advance();
        const changedFrame = w.pixel(4, 12);
        obj.setTile(0, 1, "#");
        w.advance();
        return {
            filled,
            split,
            pixels,
            sameSolidity,
            changedFrame,
            restored: w.pixel(4, 12),
        };
    });
    checkPartition(result.filled, ["###", "###", "###"]);
    checkPartition(result.split, ["# #", "# #", "# #"]);
    expect(result.pixels).toEqual([[0, 255, 0], [0, 0, 0], [255, 0, 0]]);
    checkPartition(result.sameSolidity, ["# #", "# #", "# #"]);
    expect(result.changedFrame).toEqual([255, 255, 0]);
    expect(result.restored).toEqual([255, 0, 0]);
});

test("ragged padding can be edited inside the longest-row bounds", async ({ page }) => {
    const result = await page.evaluate(() => {
        const w = window as any;
        const obj = w.makeTerrain(
            ["", "###"],
            { "#": { solid: true } },
            5.5,
            9.25,
        );
        obj.setTile(2, 0, "#");
        return w.rects(obj);
    });
    checkPartition(result, ["  #", "###"], 5.5, 9.25);
});

test("invalid construction and edits reject without changing existing terrain", async ({ page }) => {
    const result = await page.evaluate(() => {
        const w = window as any;
        const { k } = w;
        const obj = w.makeTerrain(["##"], {
            "#": { sprite: "red", solid: true },
        });
        w.advance();
        const before = w.rects(obj);
        const children = k.get().length;
        const rejected: boolean[] = [];
        const attempt = (fn: () => void) => {
            try {
                fn();
                rejected.push(false);
            } catch {
                rejected.push(true);
            }
        };
        for (const n of [0, -1, NaN, Infinity, -Infinity]) {
            for (const dims of [[n, 8], [8, n]]) {
                attempt(() => w.makeTerrain(["#"], {}, ...dims));
            }
        }
        for (
            const [x, y] of [[-1, 0], [2, 0], [0, 1], [0.5, 0], [0, 0.5], [
                NaN,
                0,
            ], [0, Infinity]]
        ) attempt(() => obj.setTile(x, y, " "));
        for (const frame of [-1, 0.5, 2, NaN, Infinity]) {
            attempt(() =>
                w.makeTerrain(["ab"], {
                    a: { sprite: "red" },
                    b: { sprite: "sheet", frame },
                })
            );
        }
        attempt(() =>
            w.makeTerrain(["ab"], {
                a: { sprite: "red" },
                b: { sprite: "absent" },
            })
        );
        const pending = k.loadSprite("pending", "data:image/png;base64,AA==");
        pending.onError(() => {});
        attempt(() => w.makeTerrain(["p"], { p: { sprite: "pending" } }));
        w.advance();
        return {
            rejected,
            before,
            after: w.rects(obj),
            children: [children, k.get().length],
            pixel: w.pixel(4, 4),
        };
    });
    expect(result.rejected.every(Boolean)).toBe(true);
    expect(result.rejected).toHaveLength(24);
    expect(result.after).toEqual(result.before);
    expect(result.children[1]).toBe(result.children[0]);
    expect(result.pixel).toEqual([255, 0, 0]);
});

test("unchanged draws reuse uploaded geometry without tile objects", async ({ page }) => {
    const result = await page.evaluate(() => {
        const w = window as any;
        const obj = w.makeTerrain(Array(16).fill("r".repeat(24)), {
            r: { sprite: "red" },
        });
        w.advance(2);
        obj.hidden = true;
        w.stats.bytes = 0;
        w.advance(3);
        const hiddenBytes = w.stats.bytes;
        obj.hidden = false;
        w.stats.bytes = 0;
        w.advance(3);
        return {
            children: w.descendants(obj),
            repeatBytes: w.stats.bytes,
            hiddenBytes,
            pixel: w.pixel(180, 100),
        };
    });
    expect(result.children).toBeLessThan(16 * 24);
    expect(result.repeatBytes).toBeLessThanOrEqual(result.hiddenBytes);
    expect(result.pixel).toEqual([255, 0, 0]);
});

test("large maps preserve late cells and multiple textures past the index boundary", async ({ page }) => {
    const result = await page.evaluate(() => {
        const w = window as any;
        const rows = Array(130).fill("r".repeat(130));
        rows[128] = "r".repeat(128) + "gs";
        const obj = w.makeTerrain(rows, {
            r: { sprite: "red" },
            g: { sprite: "green" },
            s: { sprite: "sheet", frame: 1 },
        });
        w.advance();
        const first = w.pixel(4, 4);
        obj.pos = w.k.vec2(-128 * 8, -128 * 8);
        w.advance();
        return {
            children: w.descendants(obj),
            pixels: [first, w.pixel(4, 4), w.pixel(12, 4), w.pixel(4, 12)],
            error: w.gl.getError(),
        };
    });
    expect(result.children).toBeLessThan(130 * 130);
    expect(result.pixels).toEqual([[255, 0, 0], [0, 255, 0], [255, 255, 0], [
        255,
        0,
        0,
    ]]);
    expect(result.error).toBe(0);
});

test("ancestor transforms move drawing and collision coverage together", async ({ page }) => {
    const result = await page.evaluate(() => {
        const w = window as any;
        const { k } = w;
        const parent = k.add([k.pos(140, 30), k.rotate(90), k.scale(2, 3)]);
        const obj = parent.add([
            k.pos(5, 7),
            k.bakedLevel(["##", "# "], {
                tileWidth: 8,
                tileHeight: 8,
                tiles: { "#": { sprite: "red", solid: true } },
            }),
        ]);
        w.advance();
        const sample = (x: number, y: number) => {
            const pt = obj.toWorld(k.vec2(x, y));
            return {
                pixel: w.pixel(Math.floor(pt.x), Math.floor(pt.y)),
                hits: w.colliders(obj).filter((c: any) =>
                    c.worldArea().contains(pt)
                ).length,
            };
        };
        const first = [sample(4, 4), sample(12, 12)];
        parent.pos = k.vec2(170, 50);
        parent.angle = 0;
        parent.scale = k.vec2(1.5, 2);
        w.advance();
        return first.concat([sample(4, 12), sample(12, 12)]);
    });
    expect(result).toEqual([
        { pixel: [255, 0, 0], hits: 1 },
        { pixel: [0, 0, 0], hits: 0 },
        { pixel: [255, 0, 0], hits: 1 },
        { pixel: [0, 0, 0], hits: 0 },
    ]);
});

test("ordinary dynamic bodies land on solids and fall through holes", async ({ page }) => {
    const result = await page.evaluate(() => {
        const w = window as any;
        const { k } = w;
        k.setGravity(240);
        const terrain = w.makeTerrain(
            ["## ##"],
            { "#": { solid: true } },
            16,
            16,
        );
        terrain.pos.y = 70;
        const onFloor = k.add([k.pos(4, 10), k.rect(6, 6), k.area(), k.body()]);
        const inGap = k.add([k.pos(36, 10), k.rect(6, 6), k.area(), k.body()]);
        let contacts = 0;
        onFloor.onCollide(() => {
            contacts++;
        });
        w.advance(55);
        return {
            floorY: onFloor.pos.y,
            gapY: inGap.pos.y,
            contacts,
            grounded: onFloor.isGrounded(),
        };
    });
    expect(result.floorY).toBeCloseTo(64, 0);
    expect(result.gapY).toBeGreaterThan(80);
    expect(result.contacts).toBeGreaterThan(0);
    expect(result.grounded).toBe(true);
});

test("removal and replacement clean owned colliders and geometry without reviving", async ({ page }) => {
    const result = await page.evaluate(() => {
        const w = window as any;
        const { k } = w;
        const comp = k.bakedLevel(["r r", "   ", "rrr"], {
            tileWidth: 8,
            tileHeight: 8,
            tiles: { r: { sprite: "red", solid: true } },
        });
        const obj = k.add([k.pos(), comp]);
        const child = obj.add([k.pos(100, 100), "unrelated"]);
        const retained = obj.setTile;
        const id = comp.id;
        w.advance();
        const buffers = [...w.stats.creates];
        obj.unuse(id);
        try {
            retained(0, 0, " ");
        } catch {}
        w.advance();
        const removed = {
            children: w.descendants(obj),
            child: child.exists(),
            liveBuffers: buffers.filter((b: any) =>
                !w.stats.deletes.includes(b)
            ).length,
            pixel: w.pixel(4, 4),
        };
        obj.use(
            k.bakedLevel(["g g"], {
                tileWidth: 8,
                tileHeight: 8,
                tiles: { g: { sprite: "green", solid: true } },
            }),
        );
        w.advance();
        const oldSetter = obj.setTile;
        obj.use(
            k.bakedLevel(["s"], {
                tileWidth: 8,
                tileHeight: 8,
                tiles: { s: { sprite: "sheet", frame: 1, solid: true } },
            }),
        );
        try {
            oldSetter(0, 0, " ");
        } catch {}
        w.advance();
        return {
            removed,
            rects: w.rects(obj),
            pixel: w.pixel(4, 4),
            child: child.exists(),
            texturesDeleted: w.stats.textures.length,
        };
    });
    expect(result.removed).toEqual({
        children: 1,
        child: true,
        liveBuffers: 0,
        pixel: [0, 0, 0],
    });
    checkPartition(result.rects, ["#"]);
    expect(result.pixel).toEqual([255, 255, 0]);
    expect(result.child).toBe(true);
    expect(result.texturesDeleted).toBe(0);
});

test("edits and destruction release geometry while other instances keep shared sprites", async ({ page }) => {
    const result = await page.evaluate(() => {
        const w = window as any;
        const { k } = w;
        const defs = {
            r: { sprite: "red", solid: true },
            g: { sprite: "green" },
        };
        const a = w.makeTerrain(["rr"], defs);
        const b = w.makeTerrain(["rr"], defs);
        b.pos.y = 16;
        w.advance();
        const bRects = JSON.stringify(w.rects(b));
        for (let i = 0; i < 5; i++) {
            a.setTile(0, 0, i % 2 ? "r" : "g");
            w.advance();
        }
        const retained = a.setTile;
        a.destroy();
        try {
            retained(0, 0, "r");
        } catch {}
        w.advance();
        const middle = {
            aPixel: w.pixel(4, 4),
            bPixel: w.pixel(4, 20),
            same: bRects === JSON.stringify(w.rects(b)),
        };
        b.destroy();
        const live = w.stats.creates.filter((buffer: any) =>
            !w.stats.deletes.includes(buffer)
        ).length;
        const counts = w.stats.creates.map((buffer: any) =>
            w.stats.deletes.filter((deleted: any) =>
                deleted === buffer
            ).length
        );
        k.add([k.pos(40, 0), k.sprite("red")]);
        w.advance();
        return {
            middle,
            live,
            counts,
            textureDeletes: w.stats.textures.length,
            shared: w.pixel(41, 1),
        };
    });
    expect(result.middle).toEqual({
        aPixel: [0, 0, 0],
        bPixel: [255, 0, 0],
        same: true,
    });
    expect(result.live).toBe(0);
    expect(result.counts.every((n: number) => n === 1)).toBe(true);
    expect(result.textureDeletes).toBe(0);
    expect(result.shared).toEqual([255, 0, 0]);
});

test("terrain blend state is independent of preceding draws and honors explicit normal", async ({ page }) => {
    const result = await page.evaluate(() => {
        const w = window as any;
        const { k } = w;
        k.add([k.pos(), k.rect(256, 192), k.color(0, 255, 0), k.z(-2)]);
        k.add([
            k.pos(200, 100),
            k.rect(1, 1),
            k.blend(k.BlendMode.Add),
            k.z(-1),
        ]);
        const obj = w.makeTerrain(["r"], { r: { sprite: "red" } });
        const control = k.add([
            k.pos(16, 0),
            k.sprite("red", { width: 8, height: 8 }),
        ]);
        w.advance();
        const defaults = [w.pixel(4, 4), w.pixel(20, 4)];
        obj.use(k.blend(k.BlendMode.Add));
        control.use(k.blend(k.BlendMode.Add));
        w.advance();
        const additive = [w.pixel(4, 4), w.pixel(20, 4)];
        obj.blend = control.blend = k.BlendMode.Normal;
        w.advance();
        return { defaults, additive, normal: [w.pixel(4, 4), w.pixel(20, 4)] };
    });
    expect(result.defaults).toEqual([[255, 0, 0], [255, 0, 0]]);
    expect(result.additive).toEqual([[255, 255, 0], [255, 255, 0]]);
    expect(result.normal).toEqual(result.defaults);
});

test("terrain follows live opacity color and shader properties without unchanged uploads", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const w = window as any;
        const { k } = w;
        const obj = w.makeTerrain(["s"], { s: { sprite: "sheet", frame: 1 } });
        obj.use(k.opacity(0));
        obj.use(k.color(120, 200, 255));
        const control = k.add([
            k.pos(16, 0),
            k.sprite("sheet", { frame: 1, width: 8, height: 8 }),
            k.opacity(0),
            k.color(120, 200, 255),
        ]);
        const samples = [];
        for (const alpha of [0, 0.5, 1, 0, 1]) {
            obj.opacity = control.opacity = alpha;
            w.advance();
            samples.push([w.pixel(4, 4), w.pixel(20, 4)]);
        }
        obj.color = control.color = k.rgb(0, 255, 255);
        w.advance();
        const tinted = [w.pixel(4, 4), w.pixel(20, 4)];
        obj.hidden = true;
        w.stats.bytes = 0;
        w.advance(2);
        const hiddenBytes = w.stats.bytes;
        obj.hidden = false;
        w.stats.bytes = 0;
        w.advance(2);
        const visibleBytes = w.stats.bytes;
        await k.loadShader(
            "solidBlue",
            null,
            `
            uniform float level;
            vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
                return vec4(0.0, 0.0, level, 1.0);
            }
        `,
        );
        obj.use(k.shader("solidBlue", { level: 0.5 }));
        control.use(k.shader("solidBlue", { level: 0.5 }));
        w.advance();
        const shaded = [w.pixel(4, 4), w.pixel(20, 4)];
        obj.uniform.level = control.uniform.level = 1;
        w.advance();
        return {
            samples,
            tinted,
            hiddenBytes,
            visibleBytes,
            shaded,
            changedUniform: [w.pixel(4, 4), w.pixel(20, 4)],
        };
    });
    for (const [terrain, ordinary] of result.samples) {
        expect(terrain).toEqual(ordinary);
    }
    expect(result.samples[0][0]).toEqual([0, 0, 0]);
    expect(result.samples[2][0]).toEqual([120, 200, 0]);
    expect(result.tinted).toEqual([[0, 255, 0], [0, 255, 0]]);
    expect(result.visibleBytes).toBeLessThanOrEqual(result.hiddenBytes);
    expect(result.shaded[0]).toEqual(result.shaded[1]);
    expect(result.shaded[0][2]).toBeCloseTo(128, 0);
    expect(result.changedUniform).toEqual([[0, 0, 255], [0, 0, 255]]);
});

test("terrain records transformed styled frames into picture targets without screen leakage", async ({ page }) => {
    const result = await page.evaluate(() => {
        const w = window as any;
        const { k } = w;
        const baked = new k.Picture();
        const ordinary = new k.Picture();
        const parent = (picture: any) =>
            k.add([
                k.pos(8, 8),
                k.scale(2),
                k.drawon(picture, { childrenOnly: true, refreshOnly: true }),
            ]);
        const a = parent(baked), b = parent(ordinary);
        const terrain = a.add([
            k.pos(2, 3),
            k.opacity(0.5),
            k.bakedLevel(["rs"], {
                tileWidth: 8,
                tileHeight: 8,
                tiles: {
                    r: { sprite: "red" },
                    s: { sprite: "sheet", frame: 1 },
                },
            }),
        ]);
        const first = b.add([
            k.pos(2, 3),
            k.opacity(0.5),
            k.sprite("red", { width: 8, height: 8 }),
        ]);
        const second = b.add([
            k.pos(10, 3),
            k.opacity(0.5),
            k.sprite("sheet", { frame: 1, width: 8, height: 8 }),
        ]);
        w.advance();
        const recording = [w.pixel(14, 16), w.pixel(30, 16)];
        k.add([k.pos(0, 64), k.picture(baked)]);
        k.add([k.pos(64, 64), k.picture(ordinary)]);
        w.advance();
        const samples = () => [[w.pixel(14, 80), w.pixel(30, 80)], [
            w.pixel(78, 80),
            w.pixel(94, 80),
        ]];
        const playback = samples();
        terrain.opacity = first.opacity = second.opacity = 1;
        terrain.setTile(0, 0, "s");
        first.use(k.sprite("sheet", { frame: 1, width: 8, height: 8 }));
        a.refresh();
        b.refresh();
        w.advance();
        const refreshed = samples();
        terrain.destroy();
        w.advance();
        return {
            recording,
            playback,
            refreshed,
            retained: samples(),
            leakage: [w.pixel(14, 16), w.pixel(30, 16)],
        };
    });
    expect(result.recording).toEqual([[0, 0, 0], [0, 0, 0]]);
    expect(result.playback[0]).toEqual(result.playback[1]);
    expect(result.playback[0][0][0]).toBeCloseTo(128, 0);
    expect(result.refreshed).toEqual([
        [[255, 255, 0], [255, 255, 0]],
        [[255, 255, 0], [255, 255, 0]],
    ]);
    expect(result.retained).toEqual(result.refreshed);
    expect(result.leakage).toEqual(result.recording);
});

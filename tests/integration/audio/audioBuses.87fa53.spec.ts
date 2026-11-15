import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { expect, test } from "./audioHarness.5df66d";

for (const music of [false, true]) {
    test(`${music ? "streamed" : "buffered"} playback follows nested gains and master volume`, async ({ page }) => {
        const r = await page.evaluate(async music => {
            const { k, sound, render, starts } = (window as any).audioTest;
            const parent = k.createAudioBus({ volume: 0.5 });
            const bus = k.createAudioBus({ parent, volume: 0.25 });
            if (music) k.loadMusic("track", "data:audio/wav;base64,");
            const p = k.play(music ? "track" : sound(), {
                bus,
                volume: 0.5,
                loop: true,
            });
            const started = starts();
            parent.volume = 0.8;
            bus.volume = 0.5;
            k.setVolume(0.5);
            let ended = 0;
            p.onEnd(() => ended++);
            const pixels = await render();
            return {
                pixels,
                volume: p.volume,
                same: p.bus === bus,
                restart: starts() - started,
                ended,
            };
        }, music);
        expect(r.volume).toBe(0.5);
        expect(r.same).toBe(true);
        expect(r.restart).toBe(0);
        expect(r.ended).toBe(0);
        for (const v of r.pixels) expect(v).toBeCloseTo(0.1, 5);
    });

    test(`${music ? "streamed" : "buffered"} connect changes destinations without touching transport`, async ({ page }) => {
        const r = await page.evaluate(async music => {
            const { k, ctx, sound, render, starts } = (window as any).audioTest;
            const a = k.createAudioBus({ volume: 0.1 });
            const b = k.createAudioBus({ volume: 0.25 });
            if (music) k.loadMusic("track", "data:audio/wav;base64,");
            const p = k.play(music ? "track" : sound(), {
                bus: a,
                volume: 0.4,
                loop: true,
                speed: 1.5,
                detune: music ? 0 : 1200,
            });
            const startCount = starts();
            const time = p.time();
            let ended = 0;
            p.onEnd(() => ended++);
            p.connect(b);
            p.connect(b);
            const assigned = p.bus === b;
            const raw = ctx.createGain();
            raw.gain.value = 0.5;
            raw.connect(ctx.destination);
            p.connect(raw);
            const detached = p.bus === null;
            p.connect();
            const master = p.bus === null;
            p.connect(b);
            const sameTime = p.time() === time;
            return {
                assigned,
                detached,
                master,
                pixels: await render(),
                sameTime,
                speed: p.speed,
                detune: p.detune,
                loop: p.loop,
                restarts: starts() - startCount,
                ended,
            };
        }, music);
        expect(r).toMatchObject({
            assigned: true,
            detached: true,
            master: true,
            sameTime: true,
            speed: 1.5,
            detune: music ? 0 : 1200,
            loop: true,
            restarts: 0,
            ended: 0,
        });
        for (const v of r.pixels) expect(v).toBeCloseTo(0.1, 5);
    });

}

test("muting an ancestor silences only its branch and retains local volumes", async ({ page }) => {
    const r = await page.evaluate(async () => {
        const { k, sound, render } = (window as any).audioTest;
        const a = k.createAudioBus({ volume: 0.5 });
        const b = k.createAudioBus({ parent: a, volume: 0.25 });
        k.play(sound(), { bus: b, loop: true });
        k.loadMusic("muted", "data:audio/wav;base64,");
        const stream = k.play("muted", { bus: b, loop: true });
        k.play(sound(), { volume: 0.125, loop: true });
        a.muted = true;
        b.volume = 2;
        return {
            values: [a.volume, b.volume, a.muted, b.muted, stream.bus === b],
            samples: await render(),
        };
    });
    expect(r.values).toEqual([0.5, 2, true, false, true]);
    for (const v of r.samples) expect(v).toBeCloseTo(0.125, 5);
});


test("removing a middle bus transfers direct children and players", async ({ page }) => {
    const r = await page.evaluate(async () => {
        const { k, sound, render, starts } = (window as any).audioTest;
        const top = k.createAudioBus({ volume: 0.5 });
        const middle = k.createAudioBus({ parent: top, volume: 0.1 });
        const leaf = k.createAudioBus({ parent: middle, volume: 0.25 });
        const deep = k.createAudioBus({ parent: leaf, volume: 0.5 });
        const one = k.play(sound(), { bus: middle, volume: 0.25, loop: true });
        const two = k.play(sound(), { bus: deep, volume: 0.5, loop: true });
        k.loadMusic("disposal", "data:audio/wav;base64,");
        const stream = k.play("disposal", { bus: middle, volume: 0.125, loop: true });
        const count = starts();
        middle.dispose();
        middle.dispose();
        return {
            parents: [leaf.parent === top, deep.parent === leaf],
            routes: [one.bus === top, two.bus === deep, stream.bus === top],
            retained: [leaf.volume, deep.volume, leaf.muted],
            restarts: starts() - count,
            samples: await render(),
        };
    });
    expect(r).toMatchObject({
        parents: [true, true],
        routes: [true, true, true],
        retained: [0.25, 0.5, false],
        restarts: 0,
    });
    for (const v of r.samples) expect(v).toBeCloseTo(0.21875, 5);
});

test("removing a root bus returns its direct routes to master", async ({ page }) => {
    const r = await page.evaluate(async () => {
        const { k, sound, render, throws } = (window as any).audioTest;
        const root = k.createAudioBus({ volume: 0.2, muted: true });
        const child = k.createAudioBus({ parent: root, volume: 0.5 });
        const p = k.play(sound(), { bus: root, volume: 0.25, loop: true });
        const q = k.play(sound(), { bus: child, volume: 0.5, loop: true });
        root.dispose();
        root.dispose();
        return {
            state: [root.disposed, root.volume === 0.2, root.muted,
                child.volume, p.bus === null, q.bus === child],
            rejected: [
                throws(() => { root.volume = 1; }),
                throws(() => { root.muted = false; }),
                throws(() => root.setParent()),
                throws(() => child.setParent(root)),
                throws(() => p.connect(root)),
            ],
            samples: await render(),
        };
    });
    expect(r.state).toEqual([true, true, true, 0.5, true, true]);
    expect(r.rejected).toEqual([true, true, true, true, true]);
    for (const v of r.samples) expect(v).toBeCloseTo(0.5, 5);
});

test("signed gains work and invalid bus values do not take effect", async ({ page }) => {
    const r = await page.evaluate(async () => {
        const { k, sound, render, throws } = (window as any).audioTest;
        const source = k.createAudioBus({ volume: -0.5 });
        source.volume = -0.25;
        const validationBus = k.createAudioBus();
        const rejected = [];
        for (const value of [NaN, Infinity, -Infinity, 1e40]) {
            rejected.push(throws(() => validationBus.volume = value));
            rejected.push(throws(() => k.createAudioBus({ volume: value })));
        }
        k.play(sound(), { bus: source, loop: true });
        return {
            values: [source.volume, source.parent],
            rejected,
            rejectedValueRetained: validationBus.volume === 1,
            samples: await render(),
        };
    });
    expect(r.values).toEqual([-0.25, null]);
    expect(r.rejected).toEqual(Array(8).fill(true));
    expect(r.rejectedValueRetained).toBe(true);
    for (const v of r.samples) expect(v).toBeCloseTo(-0.25, 5);
});

test("cycle rejection is atomic and removing a parent reconnects to master", async ({ page }) => {
    const r = await page.evaluate(async () => {
        const { k, sound, render, throws } = (window as any).audioTest;
        const root = k.createAudioBus({ volume: 0.5 });
        const child = k.createAudioBus({ parent: root, volume: 0.25 });
        const leaf = k.createAudioBus({ parent: child });
        k.play(sound(), { bus: leaf, loop: true });
        const rejected = [
            throws(() => root.setParent(leaf)),
            throws(() => child.setParent(child)),
        ];
        const retained = [
            child.parent === root,
            leaf.parent === child,
        ];
        child.setParent();
        child.setParent(null);
        return { rejected, retained, samples: await render() };
    });
    expect(r.rejected).toEqual([true, true]);
    expect(r.retained).toEqual([true, true]);
    for (const v of r.samples) expect(v).toBeCloseTo(0.25, 5);
});

for (const music of [true]) {
    test(
        music
            ? "streamed foreign contexts are rejected without changing an existing route"
            : "foreign contexts are rejected without changing an existing route",
        async ({ page }) => {
            await page.evaluate(() => {
                document.body.appendChild(document.createElement("iframe"));
            });
            const foreignFrame = page.frames().find(frame =>
                frame.parentFrame()
            )!;
            await foreignFrame.addScriptTag({ path: "dist/kaplay.js" });
            await foreignFrame.evaluate(() => {
                (window as any).AudioContext = (parent as any).AudioContext;
                window.requestAnimationFrame = () => 1;
                (window as any).foreignEngine = kaplay({
                    global: false,
                    width: 16,
                    height: 16,
                });
            });
            const r = await page.evaluate(async music => {
                const { k, sound, render, throws } = (window as any).audioTest;
                const bus = k.createAudioBus({ volume: 0.5 });
                if (music) k.loadMusic("track", "data:audio/wav;base64,");
                const src = music ? "track" : sound();
                const p = k.play(src, { bus, loop: true });
                const k2 =
                    (document.querySelector("iframe")!.contentWindow as any)
                        .foreignEngine;
                const foreign = k2.createAudioBus();
                const raw = k2.audioCtx.createGain();
                const rejected = [
                    throws(() => bus.setParent(foreign)),
                    throws(() => p.connect(foreign)),
                    throws(() => p.connect(raw)),
                    throws(() => k.createAudioBus({ parent: foreign })),
                    throws(() => k.play(src, { bus: foreign })),
                ];
                return {
                    rejected,
                    retained: p.bus === bus,
                    samples: await render(),
                };
            }, music);
            expect(r.rejected).toEqual(Array(5).fill(true));
            expect(r.retained).toBe(true);
            for (const v of r.samples) expect(v).toBeCloseTo(0.5, 5);
        },
    );
}


for (const music of [false, true]) {
    test(`${music ? "streamed" : "buffered"} raw routing bypasses buses and master reset restores master gain`, async ({ page }) => {
        const r = await page.evaluate(async music => {
            const { k, ctx, sound, render, throws } = (window as any).audioTest;
            const bus = k.createAudioBus({ volume: 0.5 });
            const raw = ctx.createGain();
            raw.gain.value = 0.25;
            raw.connect(ctx.destination);
            if (music) k.loadMusic("track", "data:audio/wav;base64,");
            const src = music ? "track" : sound();
            const conflict = throws(() => k.play(src, { bus, connectTo: raw }));
            const p = k.play(src, { connectTo: raw, volume: 0.5, loop: true });
            const q = k.play(src, { bus, volume: 0.25, loop: true });
            const reset = k.play(src, { bus, volume: 0.25, loop: true });
            const unusable = ctx.createOscillator();
            const rejected = throws(() => q.connect(unusable));
            const retained = q.bus === bus;
            reset.connect();
            k.setVolume(0.5);
            return {
                conflict,
                rejected,
                retained,
                detached: p.bus === null && reset.bus === null,
                samples: await render(),
            };
        }, music);
        expect(r.conflict).toBe(true);
        expect(r.rejected).toBe(true);
        expect(r.retained).toBe(true);
        expect(r.detached).toBe(true);
        for (const v of r.samples) expect(v).toBeCloseTo(0.3125, 5);
    });
}

test("buses survive scenes and engine cleanup disposes the entire hierarchy", async ({ page }) => {
    const r = await page.evaluate(() => {
        const { k, frame } = (window as any).audioTest;
        const root = k.createAudioBus();
        const child = k.createAudioBus({ parent: root });
        k.scene("next", () => {});
        k.go("next");
        frame();
        const alive = !root.disposed && !child.disposed
            && child.parent === root;
        k.quit();
        frame();
        try { child.volume = 0.5; } catch {}
        return {
            alive,
            disposed: [root.disposed, child.disposed],
            unchanged: child.volume === 1,
        };
    });
    expect(r).toEqual({ alive: true, disposed: [true, true], unchanged: true });
});

test("public TypeScript declarations expose buses and both routing forms", () => {
    const dir = mkdtempSync(join(tmpdir(), "audio-types-"));
    try {
        const file = join(dir, "consumer.ts");
        const types = resolve("dist/doc").replaceAll("\\", "/");
        writeFileSync(
            file,
            `import kaplay, { type AudioBus, type AudioBusOpt, type AudioPlayOpt } from ${
                JSON.stringify(types)
            };
const k = kaplay({ global: false });
const options: AudioBusOpt = { parent: null, volume: 2, muted: false };
const bus: AudioBus = k.createAudioBus(options);
bus.setParent(); bus.setParent(null); bus.volume = 1; bus.muted = true;
const playOptions: AudioPlayOpt = { bus };
const p = k.play("sound", playOptions);
p.connect(bus); p.connect(k.audioCtx.createGain()); p.connect();
const current: AudioBus | null = p.bus;
const parent: AudioBus | null = bus.parent;
const disposed: boolean = bus.disposed;
// @ts-expect-error parent is changed by setParent
bus.parent = null;
// @ts-expect-error disposal is readonly
bus.disposed = true;
`,
        );
        try {
            execFileSync(process.execPath, [
                "node_modules/typescript/bin/tsc",
                "--noEmit",
                "--strict",
                "--skipLibCheck",
                "--target",
                "ES2022",
                "--moduleResolution",
                "bundler",
                "--module",
                "ESNext",
                file,
            ], { stdio: "pipe" });
        } catch (error) {
            const e = error as {
                stdout?: Buffer;
                stderr?: Buffer;
                message?: string;
            };
            throw new Error(
                [e.message, e.stdout?.toString(), e.stderr?.toString()].filter(
                    Boolean,
                ).join("\n"),
            );
        }
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});


test("pending playback honors explicit rerouting and later reparenting", async ({ page }) => {
    const r = await page.evaluate(async () => {
        const { k, sound, render } = (window as any).audioTest;
        let resolve: (data: any) => void = () => {};
        const asset = new k.Asset(
            new Promise(done => {
                resolve = done;
            }),
        );
        const old = k.createAudioBus({ volume: 0.1 });
        const bus = k.createAudioBus({ volume: 0.5 });
        const parent = k.createAudioBus({ volume: 0.25 });
        const p = k.play(asset, { bus: old, volume: 0.5, loop: true });
        p.connect(bus);
        bus.setParent(parent);
        resolve(sound());
        await Promise.resolve();
        await Promise.resolve();
        return { retained: p.bus === bus, samples: await render() };
    });
    expect(r.retained).toBe(true);
    for (const v of r.samples) expect(v).toBeCloseTo(0.0625, 5);
});

for (const music of [true]) {
    test(`${music ? "streamed" : "buffered"} paused playback uses changed bus gain and parent on resume`, async ({ page }) => {
        const r = await page.evaluate(async music => {
            const { k, sound, render, starts } = (window as any).audioTest;
            const oldParent = k.createAudioBus({ volume: 0.1 });
            const newParent = k.createAudioBus({ volume: 0.5 });
            const bus = k.createAudioBus({ parent: oldParent, volume: 0.25 });
            if (music) k.loadMusic("track", "data:audio/wav;base64,");
            const p = k.play(music ? "track" : sound(), {
                bus,
                volume: 0.5,
                paused: true,
                loop: true,
            });
            const before = starts();
            bus.volume = 0.8;
            bus.setParent(newParent);
            const pausedState = [
                p.paused,
                p.bus === bus,
                bus.parent === newParent,
                bus.volume,
                starts() === before,
            ];
            p.paused = false;
            return { pausedState, samples: await render() };
        }, music);
        expect(r.pausedState).toEqual([true, true, true, 0.8, true]);
        for (const v of r.samples) expect(v).toBeCloseTo(0.2, 5);
    });
}

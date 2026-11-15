import { expect, test } from "./audioHarness.5df66d";

for (const music of [false, true]) {
    test(`${music ? "streamed" : "buffered"} direct routing keeps existing local volume and master controls`, async ({ page }) => {
        const r = await page.evaluate(async music => {
            const { k, ctx, sound, render } = (window as any).audioTest;
            if (music) k.loadMusic("track", "data:audio/wav;base64,");
            const src = music ? "track" : sound();
            const raw = ctx.createGain();
            raw.gain.value = 0.25;
            raw.connect(ctx.destination);
            const p = k.play(src, { connectTo: raw, volume: 0.5, loop: true });
            const q = k.play(src, { volume: 0.25, loop: true });
            q.connect(raw);
            q.connect();
            k.setVolume(0.5);
            return { volume: p.volume, loop: p.loop, samples: await render() };
        }, music);
        expect(r.volume).toBe(0.5);
        expect(r.loop).toBe(true);
        for (const v of r.samples) expect(v).toBeCloseTo(0.25, 5);
    });
}

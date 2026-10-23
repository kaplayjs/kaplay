import { expect, test } from "@playwright/test";

test.use({
    launchOptions: { args: ["--autoplay-policy=no-user-gesture-required"] },
});

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
});

// Plays a silent sound, switching through `speeds`, and compares time()
// with the audio clock scaled by each speed.
const measure = async (
    { speeds, seek }: { speeds: number[]; seek: number },
) => {
    const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
    const k = kaplay();
    await k.audioCtx.resume();
    while (k.audioCtx.currentTime === 0) await wait(10);
    const buf = new AudioBuffer({
        length: 48000 * 10,
        sampleRate: 48000,
        numberOfChannels: 1,
    });
    const asset = loadSound(null, buf);
    await new Promise((resolve) => asset.onLoad(resolve));
    const snd = play(asset, { speed: speeds[0], seek });
    const start = snd.time();
    let expected = start;
    for (const speed of speeds) {
        snd.speed = speed;
        const before = k.audioCtx.currentTime;
        while (k.audioCtx.currentTime < before + 0.3) await wait(20);
        const delta = k.audioCtx.currentTime - before;
        expected += delta * speed;
    }
    return { start, time: snd.time(), expected };
};

test("time() starts at the seek position", async ({ page }) => {
    const result = await page.evaluate(measure, { speeds: [1], seek: 2 });
    expect(result.start).toBeCloseTo(2, 1);
});

test("time() follows the playback speed", async ({ page }) => {
    const result = await page.evaluate(measure, { speeds: [2], seek: 0 });
    expect(Math.abs(result.time - result.expected)).toBeLessThan(0.05);
});

test("time() keeps the position when the speed changes", async ({ page }) => {
    const result = await page.evaluate(measure, {
        speeds: [1, 3, 0.5],
        seek: 1,
    });
    expect(Math.abs(result.time - result.expected)).toBeLessThan(0.05);
});

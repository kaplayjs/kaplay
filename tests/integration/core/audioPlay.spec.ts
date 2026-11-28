import { expect, test } from "@playwright/test";

test.describe("AudioPlay volume and pan", () => {
    test("ramp to a new value over a frame instead of jumping to it", async ({ page }) => {
        await page.addScriptTag({ path: "dist/kaplay.js" });

        const result = await page.evaluate(() => {
            // Record the ramps scheduled on any audio param
            const ramps: { value: number; duration: number }[] = [];
            const ramp = AudioParam.prototype.linearRampToValueAtTime;
            AudioParam.prototype.linearRampToValueAtTime = function(
                this: AudioParam,
                value: number,
                endTime: number,
            ) {
                // @ts-ignore
                const now = k.audioCtx.currentTime;
                ramps.push({ value, duration: endTime - now });
                return ramp.call(this, value, endTime);
            };

            // @ts-ignore
            const k = kaplay({ global: false });

            return new Promise<{
                volume: number;
                pan: number;
                negativeVolume: number;
                ramps: typeof ramps;
                dt: number;
            }>(res => {
                k.onUpdate(() => {
                    const snd = k.burp({ volume: 1, pan: 0 });

                    snd.volume = 0.5;
                    const volume = snd.volume;
                    snd.pan = -1;
                    const pan = snd.pan;
                    snd.volume = -1;
                    const negativeVolume = snd.volume;

                    snd.stop();
                    res({ volume, pan, negativeVolume, ramps, dt: k.dt() });
                });
            });
        });

        // The new value is read back at once, not the value mid-ramp
        expect(result.volume).toBe(0.5);
        expect(result.pan).toBe(-1);
        expect(result.negativeVolume).toBe(0);

        // Each change is ramped over the frame's dt
        expect(result.ramps.map(r => r.value)).toEqual([0.5, -1, 0]);
        for (const r of result.ramps) {
            expect(r.duration).toBeCloseTo(result.dt, 5);
        }
    });
});

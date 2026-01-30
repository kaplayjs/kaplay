import { beforeAll, describe, expect, test } from "vitest";

describe("Sound Component", async () => {
    beforeAll(async () => {
        await page.addScriptTag({ path: "dist/kaplay.js" });
    });

    test(
        "sound() component should be available on context",
        async () => {
            const hasSound = await page.evaluate(() => {
                const k = kaplay({ global: false });
                return typeof k.sound === "function";
            });

            expect(hasSound).toBe(true);
        },
        20000,
    );

    test(
        "sound() component should have correct id",
        async () => {
            const compId = await page.evaluate(() => {
                const k = kaplay({ global: false });
                const comp = k.sound("test");
                return comp.id;
            });

            expect(compId).toBe("sound");
        },
        20000,
    );

    test(
        "sound() component should expose the sound source name",
        async () => {
            const soundName = await page.evaluate(() => {
                const k = kaplay({ global: false });
                const comp = k.sound("mySoundFile");
                return comp.sound;
            });

            expect(soundName).toBe("mySoundFile");
        },
        20000,
    );

    test(
        "sound() component should have default properties",
        async () => {
            const defaults = await page.evaluate(() => {
                const k = kaplay({ global: false });
                const comp = k.sound("test");
                return {
                    volume: comp.volume,
                    spatial: comp.spatial,
                };
            });

            expect(defaults.volume).toBe(1);
            expect(defaults.spatial).toBe(false);
        },
        20000,
    );

    test(
        "sound() component should accept options",
        async () => {
            const opts = await page.evaluate(() => {
                const k = kaplay({ global: false });
                const comp = k.sound("test", {
                    volume: 0.5,
                    spatial: true,
                    loop: true,
                });
                return {
                    volume: comp.volume,
                    spatial: comp.spatial,
                };
            });

            expect(opts.volume).toBe(0.5);
            expect(opts.spatial).toBe(true);
        },
        20000,
    );

    test(
        "sound() component should allow changing volume",
        async () => {
            const newVolume = await page.evaluate(() => {
                const k = kaplay({ global: false });
                const comp = k.sound("test", { volume: 1 });
                comp.volume = 0.3;
                return comp.volume;
            });

            expect(newVolume).toBe(0.3);
        },
        20000,
    );

    test(
        "sound() component should allow toggling spatial",
        async () => {
            const spatialState = await page.evaluate(() => {
                const k = kaplay({ global: false });
                const comp = k.sound("test", { spatial: false });
                comp.spatial = true;
                return comp.spatial;
            });

            expect(spatialState).toBe(true);
        },
        20000,
    );

    test(
        "sound() component should have inspect method",
        async () => {
            const inspectResult = await page.evaluate(() => {
                const k = kaplay({ global: false });
                const comp = k.sound("mySound");
                return comp.inspect ? comp.inspect() : null;
            });

            expect(inspectResult).toContain("mySound");
        },
        20000,
    );
});

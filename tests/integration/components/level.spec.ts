import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
});

test(
    "destroyed tile is removed from the level spatial map",
    async ({ page }) => {
        const result = await page.evaluate(() => {
            const k = kaplay({ global: false });

            const level = k.addLevel([" ="], {
                tileWidth: 64,
                tileHeight: 64,
                tiles: {
                    "=": () => [k.rect(64, 64)],
                },
            });

            const pos = k.vec2(0, 0);
            const obj = level.spawn("=", pos)!;
            const before = level.getAt(pos).length;
            obj.destroy();
            const spawnedAfter = level.getAt(pos).length;

            const fromMap = level.getAt(k.vec2(1, 0))[0];
            fromMap.destroy();
            const mappedAfter = level.getAt(k.vec2(1, 0)).length;

            return { before, spawnedAfter, mappedAfter };
        });

        expect(result).toEqual({ before: 1, spawnedAfter: 0, mappedAfter: 0 });
    },
);

test(
    "destroying a level removes its tiles without errors",
    async ({ page }) => {
        const result = await page.evaluate(() => {
            const k = kaplay({ global: false });

            const level = k.addLevel(["=="], {
                tileWidth: 64,
                tileHeight: 64,
                tiles: {
                    "=": () => [k.rect(64, 64)],
                },
            });

            level.getAt(k.vec2(0, 0));
            level.destroy();

            return level.getAt(k.vec2(0, 0)).length;
        });

        expect(result).toBe(0);
    },
);

test(
    "destroying an obstacle tile opens the path through it",
    async ({ page }) => {
        const result = await page.evaluate(() => {
            const k = kaplay({ global: false });

            const level = k.addLevel([
                "...",
                ".#.",
                "...",
            ], {
                tileWidth: 64,
                tileHeight: 64,
                tiles: {
                    ".": () => [k.tile()],
                    "#": () => [k.tile({ isObstacle: true }), "wall"],
                },
            });

            const from = k.vec2(0, 1);
            const to = k.vec2(2, 1);
            const before = level.getTilePath(from, to)?.length;
            level.get("wall")[0].destroy();
            const after = level.getTilePath(from, to)?.length;

            return { before, after };
        });

        // Paths include both ends: around the wall, then straight through.
        expect(result).toEqual({ before: 5, after: 3 });
    },
);

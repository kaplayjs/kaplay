import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function readSpriteFixtures() {
    return Promise.all(
        [
            "apple",
            "bag",
            "bean",
        ].map(async (name) => ({
            name,
            src: `data:image/png;base64,${await readFile(
                new URL(`../../fixtures/sprites/${name}.png`, import.meta.url),
                "base64",
            )}`,
        })),
    );
}

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
});

test.describe("sprite component", () => {
    test("updates the sprite property after dynamic assignment", async ({ page }) => {
        const fixtures = await readSpriteFixtures();

        const spriteNames = await page.evaluate((fixtures) => {
            const k = kaplay();

            for (const fixture of fixtures) {
                k.loadSprite(fixture.name, fixture.src);
            }

            return new Promise<string[]>((resolve) => {
                k.onLoad(() => {
                    const sprites = [];
                    const obj = k.add([
                        k.sprite("apple"),
                    ]);
                    sprites.push(obj.sprite);
                    obj.sprite = "bag";
                    sprites.push(obj.sprite);
                    obj.sprite = "bean";
                    sprites.push(obj.sprite);

                    resolve(sprites);
                });
            });
        }, fixtures);

        expect(spriteNames).toEqual(["apple", "bag", "bean"]);
    });

    test("preserves sprite assignment before adding the component", async ({ page }) => {
        const fixtures = await readSpriteFixtures();

        const spriteName = await page.evaluate((fixtures) => {
            const k = kaplay();

            for (const fixture of fixtures) {
                k.loadSprite(fixture.name, fixture.src);
            }

            const spriteComp = k.sprite("apple");
            spriteComp.sprite = "bag";
            const obj = k.add([spriteComp]);

            return new Promise<string>((resolve) => {
                k.onLoad(() => resolve(obj.sprite));
            });
        }, fixtures);

        expect(spriteName).toEqual("bag");
    });
});

test.describe("sprite animations", () => {
    type PlayCase = {
        anim: { from: number; to: number; loop?: boolean; pingpong?: boolean };
        playOpt?: { reverse?: boolean; loop?: boolean; pingpong?: boolean };
        animSpeed?: number;
        maxFrames?: number;
    };

    /**
     * Play an animation on a 4 frames sprite and return every frame it shows,
     * until the animation ends or `maxFrames` frames have been shown.
     */
    async function playedFrames(
        page: import("@playwright/test").Page,
        playCase: PlayCase,
    ): Promise<number[]> {
        return await page.evaluate((playCase) => {
            const k = kaplay({ global: false });

            const canvas = document.createElement("canvas");
            canvas.width = 16;
            canvas.height = 4;
            const ctx = canvas.getContext("2d")!;
            ["red", "green", "blue", "white"].forEach((color, i) => {
                ctx.fillStyle = color;
                ctx.fillRect(i * 4, 0, 4, 4);
            });

            k.loadSprite("strip", canvas.toDataURL(), {
                sliceX: 4,
                anims: { anim: { ...playCase.anim, speed: 60 } },
            });

            return new Promise<number[]>((resolve) => {
                k.onLoad(() => {
                    const obj = k.add([
                        k.sprite("strip", { animSpeed: playCase.animSpeed }),
                    ]);
                    const frames: number[] = [];
                    const maxFrames = playCase.maxFrames ?? 16;

                    const record = () => {
                        if (frames.at(-1) !== obj.frame) frames.push(obj.frame);
                        if (frames.length >= maxFrames) resolve(frames);
                    };

                    obj.play("anim", {
                        ...playCase.playOpt,
                        onEnd: () => {
                            record();
                            resolve(frames);
                        },
                    });
                    record();
                    obj.onUpdate(record);
                });
            });
        }, playCase);
    }

    test("plays an animation forwards", async ({ page }) => {
        expect(await playedFrames(page, { anim: { from: 0, to: 3 } }))
            .toEqual([0, 1, 2, 3]);
    });

    test("plays an animation backwards with the reverse option", async ({ page }) => {
        expect(
            await playedFrames(page, {
                anim: { from: 0, to: 3 },
                playOpt: { reverse: true },
            }),
        ).toEqual([3, 2, 1, 0]);
    });

    test("loops a reversed animation from its last frame", async ({ page }) => {
        expect(
            await playedFrames(page, {
                anim: { from: 0, to: 3 },
                playOpt: { reverse: true, loop: true },
                maxFrames: 6,
            }),
        ).toEqual([3, 2, 1, 0, 3, 2]);
    });

    test("bounces a reversed pingpong animation", async ({ page }) => {
        expect(
            await playedFrames(page, {
                anim: { from: 0, to: 3 },
                playOpt: { reverse: true, loop: true, pingpong: true },
                maxFrames: 8,
            }),
        ).toEqual([3, 2, 1, 0, 1, 2, 3, 2]);
    });

    test("plays an animation backwards with a negative animSpeed", async ({ page }) => {
        expect(
            await playedFrames(page, {
                anim: { from: 0, to: 3, loop: true },
                animSpeed: -1,
                maxFrames: 6,
            }),
        ).toEqual([0, 3, 2, 1, 0, 3]);
    });

    test("bounces a pingpong animation with a negative animSpeed", async ({ page }) => {
        expect(
            await playedFrames(page, {
                anim: { from: 0, to: 3 },
                playOpt: { loop: true, pingpong: true },
                animSpeed: -1,
                maxFrames: 7,
            }),
        ).toEqual([0, 1, 2, 3, 2, 1, 0]);
    });
});

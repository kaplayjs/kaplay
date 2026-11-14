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

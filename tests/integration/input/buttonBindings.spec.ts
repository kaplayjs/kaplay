import { expect, type JSHandle, type Page, test } from "@playwright/test";
import type { ButtonBinding } from "../../../src/app/inputBindings";
import type { KAPLAYCtxT } from "../../../src/core/taf";

type Game = JSHandle<{
    k: KAPLAYCtxT<{ buttons: { foo: ButtonBinding } }>;
    presses: number;
    releases: number;
    downFrames: number;
}>;

async function setup(page: Page, binding: ButtonBinding): Promise<Game> {
    await page.addScriptTag({ path: "dist/kaplay.js" });
    const game = await page.evaluateHandle(binding => {
        const k = kaplay({
            global: false,
            debug: false,
            buttons: { foo: binding },
        });
        const game = { k, presses: 0, releases: 0, downFrames: 0 };
        k.onButtonPress("foo", () => game.presses++);
        k.onButtonRelease("foo", () => game.releases++);
        k.onButtonDown("foo", () => game.downFrames++);
        return game;
    }, binding);
    await page.locator("canvas").focus();
    await nextFrame(game);
    return game;
}

async function nextFrame(game: Game) {
    await game.evaluate(({ k }) =>
        new Promise<void>(resolve => {
            const event = k.onUpdate(() => {
                event.cancel();
                resolve();
            });
        })
    );
}

for (const [first, second] of [["q", "w"], ["w", "q"]]) {
    for (const released of [first, second]) {
        test(`onButtonDown continues after ${first}, ${second}, release ${released}`, async ({ page }) => {
            const game = await setup(page, { keyboard: ["q", "w"] });
            await page.keyboard.down(first);
            await nextFrame(game);
            await page.keyboard.down(second);
            await nextFrame(game);
            await page.keyboard.up(released);
            await nextFrame(game);

            expect(await game.evaluate(({ k }) => k.isButtonDown("foo")))
                .toBe(true);
            expect(await game.evaluate(g => g.releases)).toBe(0);
            const downFrames = await game.evaluate(g => g.downFrames);
            await nextFrame(game);
            expect(await game.evaluate(g => g.downFrames)).toBeGreaterThan(
                downFrames,
            );

            await page.keyboard.up(released === first ? second : first);
            await nextFrame(game);
            expect(await game.evaluate(({ k }) => k.isButtonDown("foo")))
                .toBe(false);
            expect(await game.evaluate(g => g.releases)).toBe(1);
        });
    }
}

for (
    const [name, binding] of [
        ["overlapping", { keyboard: ["q", "w"], keyboardCode: "KeyQ" }],
        ["separate", { keyboard: "q", keyboardCode: "KeyW" }],
    ] as const
) {
    for (const released of ["q", "w"]) {
        test(`${name} keyboard and keyboardCode bindings share the action when releasing ${released}`, async ({ page }) => {
            const game = await setup(page, {
                ...binding,
                keyboard: [...[binding.keyboard].flat()],
            });
            await page.keyboard.down("q");
            await nextFrame(game);
            await page.keyboard.down("w");
            await nextFrame(game);
            await page.keyboard.up(released);
            await nextFrame(game);
            expect(await game.evaluate(({ k }) => k.isButtonDown("foo"))).toBe(
                true,
            );
            expect(await game.evaluate(g => g.releases)).toBe(0);
            await page.keyboard.up(released === "q" ? "w" : "q");
            await nextFrame(game);
            expect(await game.evaluate(({ k }) => k.isButtonDown("foo"))).toBe(
                false,
            );
            expect(await game.evaluate(g => g.releases)).toBe(1);
        });
    }
}

test("auto-repeat does not keep an action stuck after the last release", async ({ page }) => {
    const game = await setup(page, { keyboard: ["q", "w"] });
    await page.keyboard.down("q");
    await nextFrame(game);
    await page.keyboard.down("q");
    await nextFrame(game);
    await page.keyboard.down("w");
    await nextFrame(game);
    expect(await game.evaluate(g => g.presses)).toBe(2);
    await page.keyboard.up("q");
    await nextFrame(game);
    expect(await game.evaluate(({ k }) => k.isButtonDown("foo"))).toBe(true);
    await page.keyboard.up("w");
    await nextFrame(game);
    expect(await game.evaluate(({ k }) => k.isButtonDown("foo"))).toBe(false);
    expect(await game.evaluate(g => g.releases)).toBe(1);
});

test("losing focus releases all held alternatives and allows a fresh press", async ({ page }) => {
    const game = await setup(page, { keyboard: ["q", "w"] });
    await page.keyboard.down("q");
    await page.keyboard.down("w");
    await nextFrame(game);
    await page.locator("canvas").evaluate(canvas => canvas.blur());
    await nextFrame(game);
    expect(await game.evaluate(({ k }) => k.isButtonDown("foo"))).toBe(false);
    expect(await game.evaluate(g => g.releases)).toBe(1);
    await page.keyboard.up("q");
    await page.keyboard.up("w");
    await page.locator("canvas").focus();
    await page.keyboard.down("q");
    await nextFrame(game);
    expect(await game.evaluate(({ k }) => k.isButtonDown("foo"))).toBe(true);
    await page.keyboard.up("q");
    await nextFrame(game);
    expect(await game.evaluate(({ k }) => k.isButtonDown("foo"))).toBe(false);
    expect(await game.evaluate(g => g.releases)).toBe(2);
});

test("rebound held inputs release without leaving the action stuck", async ({ page }) => {
    const game = await setup(page, { keyboard: ["q", "w"] });
    await page.keyboard.down("q");
    await nextFrame(game);
    await game.evaluate(({ k }) => k.setButton("foo", { keyboard: "e" }));
    await page.keyboard.down("e");
    await nextFrame(game);
    await page.keyboard.up("e");
    await nextFrame(game);
    expect(await game.evaluate(({ k }) => k.isButtonDown("foo"))).toBe(true);
    await page.keyboard.up("q");
    await nextFrame(game);
    expect(await game.evaluate(({ k }) => k.isButtonDown("foo"))).toBe(false);
    expect(await game.evaluate(g => g.releases)).toBe(1);
});

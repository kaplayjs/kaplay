import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const GAME_WIDTH = 320;
const GAME_HEIGHT = 180;

type Crisp = "smooth" | boolean | undefined;

/** Boots a game with the given `crisp` value and returns a canvas screenshot. */
async function render(
    page: Page,
    crisp: Crisp,
    viewport: { width: number; height: number },
) {
    await page.setViewportSize(viewport);
    await page.addScriptTag({ path: "dist/kaplay.js" });
    await page.evaluate(
        ({ crisp, GAME_WIDTH, GAME_HEIGHT }) => {
            const k = kaplay({
                width: GAME_WIDTH,
                height: GAME_HEIGHT,
                letterbox: true,
                debug: false,
                crisp,
            });

            // Deterministic scene with lots of 1px-ish edges
            for (let i = 0; i < 10; i++) {
                k.add([
                    k.rect(5, 18),
                    k.pos(15 + i * 15, 20 + i * 12),
                    k.color(255, 255, 255),
                ]);
            }
        },
        { crisp, GAME_WIDTH, GAME_HEIGHT },
    );

    // Let the loading screen go away and a few frames settle
    await page.waitForTimeout(500);
    return page.locator("canvas").screenshot();
}

test("only crisp: \"smooth\" creates the upscaling shader", async ({ context }) => {
    const hasUpscaleShader = async (crisp: Crisp) => {
        const page = await context.newPage();
        await page.addScriptTag({ path: "dist/kaplay.js" });
        const has = await page.evaluate(
            ({ crisp, width, height }) => {
                const k = kaplay({
                    width,
                    height,
                    debug: false,
                    crisp,
                });
                return !!k._k.gfx.smoothShader;
            },
            { crisp, width: GAME_WIDTH, height: GAME_HEIGHT },
        );
        await page.close();
        return has;
    };

    expect(await hasUpscaleShader("smooth")).toBe(true);
    expect(await hasUpscaleShader(true)).toBe(false);
    expect(await hasUpscaleShader(false)).toBe(false);
    expect(await hasUpscaleShader(undefined)).toBe(false);
});

test("smooth matches nearest at an integer scale", async ({ context }) => {
    // 320x180 in 640x360 is exactly 2x
    const viewport = { width: 640, height: 360 };

    const smooth = await render(await context.newPage(), "smooth", viewport);
    const nearest = await render(await context.newPage(), true, viewport);

    expect(smooth.equals(nearest)).toBe(true);
});

test("smooth differs from nearest at a fractional scale", async ({ context }) => {
    // 320x180 in 700x394 is ~2.19x
    const viewport = { width: 700, height: 394 };

    const smooth = await render(await context.newPage(), "smooth", viewport);
    const nearest = await render(await context.newPage(), true, viewport);

    expect(smooth.equals(nearest)).toBe(false);
});

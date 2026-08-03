import { beforeEach, describe, expect, test } from "vitest";

describe("fixed canvas sizing and input coordinates", () => {
    beforeEach(async () => {
        await page.goto("about:blank");
        await page.addScriptTag({ path: "dist/kaplay.js" });
    });

    test("explicit dimensions override a supplied canvas CSS size", async () => {
        const size = await page.evaluate(() => {
            const canvas = document.createElement("canvas");
            canvas.style.width = "320px";
            canvas.style.height = "180px";
            document.body.appendChild(canvas);

            const k = kaplay({
                global: false,
                canvas,
                width: 480,
                height: 270,
                scale: 2,
            });
            const result = {
                width: canvas.width,
                height: canvas.height,
            };

            k.quit();
            canvas.remove();
            return result;
        });

        expect(size).toEqual({ width: 960, height: 540 });
    });

    test("CSS scaling does not resize a fixed backing store", async () => {
        const size = await page.evaluate(async () => {
            const k = kaplay({
                global: false,
                width: 480,
                height: 270,
                scale: 2,
            });
            const canvas = k._k.canvas;
            canvas.style.width = "640px";
            canvas.style.height = "360px";

            await new Promise(requestAnimationFrame);
            await new Promise(requestAnimationFrame);

            const result = {
                width: canvas.width,
                height: canvas.height,
            };

            k.quit();
            canvas.remove();
            return result;
        });

        expect(size).toEqual({ width: 960, height: 540 });
    });

    test("mouse and touch account for CSS contain bars", async () => {
        await page.setViewport({ width: 800, height: 600 }); // 1.33 ratio
        await page.evaluate(() => {
            document.body.style.margin = "0";
            const k = kaplay({
                global: false,
                width: 480,
                height: 270, // 1.77 ratio
                scale: 2,
            });
            const canvas = k._k.canvas;
            canvas.style.setProperty("width", "100vw", "important");
            canvas.style.setProperty("height", "100vh", "important");
            canvas.style.objectFit = "contain";

            // @ts-ignore Expose context for the next evaluation
            window.testCtx = k;
        });

        // Canvas will be rendered at 800x450
        // Vertical bars are 75px tall
        await page.mouse.move(
            200, // 25% of the canvas
            75 + 225, // Bar + 50% od the canvas height
        );
        await page.evaluate(() => new Promise(requestAnimationFrame));

        // It should map to
        const expected = {
            x: 120, // 480 * 25%
            y: 135, // 270 * 50%
        };

        const positions = await page.evaluate(async () => {
            // @ts-ignore Test context was created in the previous evaluation
            const k = window.testCtx;
            const mouse = k.mousePos();
            let touch = null;

            k.onTouchStart((pos: { x: number; y: number }) => {
                touch = { x: pos.x, y: pos.y };
            });

            const event = new Event("touchstart", {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(event, "changedTouches", {
                value: [{ clientX: 200, clientY: 75 + 225 }],
            });
            k._k.canvas.dispatchEvent(event);

            await new Promise(requestAnimationFrame);

            const result = {
                canvas: {
                    width: k._k.canvas.width,
                    height: k._k.canvas.height,
                },
                mouse: { x: mouse.x, y: mouse.y },
                touch,
            };

            k.quit();
            k._k.canvas.remove();
            return result;
        });

        expect(positions.canvas).toEqual({ width: 960, height: 540 });
        expect(positions.mouse.x).toBeCloseTo(expected.x);
        expect(positions.mouse.y).toBeCloseTo(expected.y);
        expect(positions.touch).toEqual(expected);
    });
});

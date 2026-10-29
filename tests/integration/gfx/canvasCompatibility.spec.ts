import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.context().setOffline(true);
    await page.addScriptTag({ path: "dist/kaplay.js" });
});

test("resized fixed canvases retain dimensions, pixels, and PNG readback", async ({ page }) => {
    const result = await page.evaluate(async () => {
        const k = kaplay({ global: false, width: 64, height: 48 });
        const c = k.makeCanvas(10, 7);
        c.resize(12, 9);
        c.draw(() => k.drawRect({ width: 64, height: 48, color: k.RED }));
        const image = new Image();
        image.src = c.toDataURL();
        await image.decode();
        return {
            size: [c.width, c.height, image.width, image.height],
            color: Array.from(c.toImageData().data.slice(0, 4)),
        };
    });
    expect(result).toEqual({ size: [12, 9, 12, 9], color: [255, 0, 0, 255] });
});

test("legacy FrameBuffer drawon retains cached and manual refresh behavior", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay({ global: false, width: 64, height: 48 });
        const c = k.makeCanvas(10, 8);
        c.resize(14, 11);
        let draws = 0;
        const o = k.add([k.drawon(c.fb, { refreshOnly: true }), {
            draw() {
                draws++;
                k.drawRect({ width: 64, height: 48, color: k.BLUE });
            },
        }]);
        o.draw();
        o.draw();
        const cached = draws;
        o.refresh();
        o.draw();
        return {
            cached,
            draws,
            color: Array.from(c.toImageData().data.slice(0, 4)),
        };
    });
    expect(result).toEqual({ cached: 1, draws: 2, color: [0, 0, 255, 255] });
});

test("Picture drawon records geometry and manual refresh replaces it", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay({ global: false, width: 64, height: 48 });
        const canvas = k.makeCanvas(32, 24);
        canvas.resize(64, 48);
        const picture = new k.Picture();
        let draws = 0;
        const o = k.add([k.drawon(picture, { refreshOnly: true }), {
            draw() {
                draws++;
                k.drawRect({
                    width: 64,
                    height: 48,
                    color: draws === 1 ? k.RED : k.BLUE,
                });
            },
        }]);
        canvas.draw(() => o.draw());
        const first = picture.archive();
        o.draw();
        const cached = draws, unchanged = first === picture.archive();
        o.refresh();
        o.draw();
        canvas.draw(() => k.drawPicture(picture, { fixed: true }));
        return {
            cached,
            draws,
            unchanged,
            changed: first !== picture.archive(),
            geometry: JSON.parse(picture.archive()).indices.length > 0,
        };
    });
    expect(result).toEqual({
        cached: 1,
        draws: 2,
        unchanged: true,
        changed: true,
        geometry: true,
    });
});

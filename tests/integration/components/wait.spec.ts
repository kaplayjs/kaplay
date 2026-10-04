import { expect, test } from "@playwright/test";

test(
    "Wait 1 second and pass test",
    async ({ page }) => {
        await page.addScriptTag({ path: "dist/kaplay.js" });

        const result = await page.evaluate(() => {
            const k = kaplay({ global: false });

            k.loadBean();

            k.add([
                k.sprite("bean"),
            ]);

            return Promise.resolve(
                new Promise((res, rej) => {
                    k.wait(1, () => {
                        res(true);
                    });
                }),
            );
        });

        expect(result).toBeTruthy();
    },
);

import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
});

test(
    "add() should throw an error when a body() without pos() is passed",
    async ({ page }) => {
        async function useBodyWithoutPos() {
            return page.evaluate(() => {
                const k = kaplay();

                return new Promise((res, rej) => {
                    k.onError((e) => {
                        console.log(e);
                        rej(e.message);
                    });

                    k.add([
                        k.body(),
                    ]);
                });
            });
        }

        await expect(useBodyWithoutPos).rejects.toThrow(/requires/);
    },
);

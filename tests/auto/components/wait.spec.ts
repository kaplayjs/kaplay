import { beforeAll, describe, expect, test } from "vitest";

describe("wait() should wait 5 seconds", () => {
    beforeAll(async () => {
        await page.addScriptTag({ path: "dist/kaplay.js" });
    });

    test(
        "Wait 1 second and pass test",
        async () => {
            const result = await page.evaluate(() => {
                const k = kaplay({ global: false });

                k.loadBean();

                k.add([
                    k.sprite("bean"),
                ]);

                return Promise.resolve(new Promise((res, rej) => {
                    k.wait(1, () => {
                        res(true);
                    })
                }))
            });

            expect(result).toBeTruthy();
        },
        20000,
    );
});


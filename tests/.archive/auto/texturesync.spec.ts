import { beforeAll, describe, expect, test } from "vitest";

describe("Components validation in add()", async () => {
    beforeAll(async () => {
        await page.addScriptTag({ path: "dist/kaplay.js" });
    });

    test(
        "direct sprite referencing should force a texture flush",
        async () => {
            async function fn() {
                return page.evaluate(() => {
                    const k = kaplay();
                    return new Promise(resolve => {
                        // hacky since we can't use spyOn mocking
                        var called = false;
                        k._k.assets.packer.syncIfPending = function() {
                            called = true;
                        };

                        const bean = k.loadBean();
                        k.add([k.sprite(bean)]);

                        k.onLoad(() => resolve(called));
                    });
                });
            }

            await expect(fn()).resolves.toBeTruthy();
        },
        20000,
    );
});

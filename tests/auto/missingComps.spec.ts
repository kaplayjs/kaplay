import { beforeAll, describe, expect, test } from "vitest";
import "vitest-puppeteer";
import "../../dist/declaration/global";

// [subject] should [behavior when condition]

describe("Components validation in add()", async () => {
    beforeAll(async () => {
        await page.addScriptTag({ path: "dist/kaplay.js" });
    });

    test(
        "add() should throw an error when a body() without pos() is passed",
        async () => {
            async function useBodyWithoutPos() {
                return page.evaluate(() => {
                    kaplay();

                    return new Promise((res, rej) => {
                        onError((e) => {
                            console.log(e);
                            rej(e.message);
                        });

                        add([
                            body(),
                        ]);
                    });
                });
            }

            await expect(useBodyWithoutPos).rejects.toThrow(/requires/);
        },
        20000,
    );
});

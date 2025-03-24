import { beforeAll, describe, expect, it } from "vitest";
import "vitest-puppeteer";
import "../../dist/declaration/global";

describe("Missing Comps", async () => {
    beforeAll(async () => {
        await page.addScriptTag({ path: "dist/kaplay.js" });
    });

    it("Use body() without pos() in add() should throw an error", async () => {
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
    }, 20000);
});

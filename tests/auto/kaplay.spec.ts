import { beforeAll, describe, expect, test } from "vitest";
import "vitest-puppeteer";
import "../../dist/declaration/global";

describe("Context Initialization", () => {
    beforeAll(async () => {
        await page.addScriptTag({ path: "dist/kaplay.js" });
    });

    test("VERSION constant should be defined in global scope", async () => {
        const version = await page.evaluate(() => {
            kaplay();
            return VERSION;
        });

        expect(version).toBeDefined();
    }, 20000);
});

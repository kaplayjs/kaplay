import { beforeAll, describe, expect, it } from "vitest";
import "vitest-puppeteer";
import "../../dist/declaration/global";

describe("Context Initialization", () => {
    beforeAll(async () => {
        await page.addScriptTag({ path: "dist/kaplay.js" });
    });

    it("VERSION should be defined", async () => {
        const version = await page.evaluate(() => {
            kaplay();
            return VERSION;
        });

        expect(version).toBeDefined();
    }, 20000);
});

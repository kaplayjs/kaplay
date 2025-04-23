import { beforeAll, describe, expect, test } from "vitest";
import "vitest-puppeteer";
import "../../dist/declaration/global";

describe("Context Initialization", () => {
    beforeAll(async () => {
        await page.addScriptTag({ path: "dist/kaplay.js" });
    });

    test(
        "VERSION constant shouldn't be defined in global scope when kaplay({ global: false })",
        async () => {
            const version = await page.evaluate(() => {
                kaplay({ global: false });
                return window["VERSION"];
            });

            expect(version).toBeUndefined();
        },
        20000,
    );

    test(
        "VERSION constant should be defined in global scope wwhen kaplay()",
        async () => {
            const version = await page.evaluate(() => {
                kaplay();
                return window["VERSION"];
            });

            expect(version).toBeDefined();
        },
        20000,
    );
});

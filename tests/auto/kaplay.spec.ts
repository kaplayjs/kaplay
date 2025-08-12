import { beforeAll, describe, expect, test } from "vitest";

describe("Context Initialization", () => {
    beforeAll(async () => {
        await page.addScriptTag({ path: "dist/kaplay.js" });
    });

    test(
        "VERSION constant shouldn't be defined in global scope when kaplay({ global: false })",
        async () => {
            const version = await page.evaluate(() => {
                kaplay({ global: false });
                // @ts-ignore
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
                // @ts-ignore
                return window["VERSION"];
            });

            expect(version).toBeDefined();
        },
        20000,
    );
});

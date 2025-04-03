import { beforeAll, describe, expect, test } from "vitest";
import "vitest-puppeteer";
import "../../dist/declaration/global";
import type { KAPLAYCtx } from "../../src/types";

describe("Plugin loading", () => {
    beforeAll(async () => {
        await page.addScriptTag({ path: "dist/kaplay.js" });
    });

    test("testPlugin methods should exist in context", async () => {
        const method = await page.evaluate(() => {
            const testPlugin = (k: KAPLAYCtx) => ({
                myMethod() {
                    return k.VERSION;
                },
            });

            const k = kaplay({ plugins: [testPlugin] });

            return k.myMethod;
        });

        expect(method).toBeDefined();
    }, 20000);

    test("testPlugin methods should work in context", async () => {
        const [version, methodResult] = await page.evaluate(() => {
            const testPlugin = (k: KAPLAYCtx) => ({
                myMethod() {
                    return k.VERSION;
                },
            });

            const k = kaplay({ plugins: [testPlugin] });

            return [k.VERSION, k.myMethod()];
        });

        expect(methodResult).toBe(version);
    }, 20000);
});

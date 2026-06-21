import { expect, test } from "@playwright/test";
import type { KAPLAYCtx } from "../../../src/";

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
});

test("testPlugin methods should exist in context", async ({ page }) => {
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
});

test("testPlugin methods should work in context", async ({ page }) => {
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
});

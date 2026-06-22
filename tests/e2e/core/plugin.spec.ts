import { expect, test } from "@playwright/test";
import type { KAPLAYCtx } from "../../../src/";

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
});

test("plugin methods should exist in context", async ({ page }) => {
    page.on('console', msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const testPlugin = (k: KAPLAYCtx) => ({
            myMethod() {
                return k.VERSION;
            },
        });

        const k = kaplay({ plugins: [testPlugin] });

        // Tests only admits serializable valuies
        return k.myMethod !== undefined && k.myMethod !== null;
    });

    expect(method).toBeTruthy();
});

test("plugin methods should work in context", async ({ page }) => {
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

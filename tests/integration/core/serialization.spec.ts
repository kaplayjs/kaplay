import { expect, test } from "@playwright/test";
import { CompList, type GameObj, type HealthComp, type KAPLAYCtx } from "../../../src";

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
});

// we need to create tests for each factory registered in:
// src/core/engine.ts
// there may be exceptions tho...

test("Test serialization of health() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

        const o = k.add([
            k.health(10),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<HealthComp>>(prefab);

        return pf.hp == 10;
    });

    expect(method).toBeTruthy();
});

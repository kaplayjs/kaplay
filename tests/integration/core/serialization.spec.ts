import { expect, test } from "@playwright/test";
import type { GameObj, KAPLAYCtx } from "../../../src";

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

		const pf: GameObj<any> = k.addPrefab(prefab);

		return pf.health == 10;
	});

	expect(method).toBeTruthy();
});


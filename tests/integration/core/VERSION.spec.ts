import { expect, test } from "@playwright/test";

test("VERSION constant should be defined in global scope when running kaplay()", async ({ page }) => {
	await page.addScriptTag({ path: "dist/kaplay.js" });

	const result = await page.evaluate(async () => {
		kaplay();

		return window["VERSION" as "ArrayBuffer"];
	});

	// Expect a title "to contain" a substring.
	expect(result).toBeDefined();
});

test("VERSION constant should not be defined in global scope when running kaplay({ global: false })", async ({ page }) => {
	await page.addScriptTag({ path: "dist/kaplay.js" });

	const result = await page.evaluate(async () => {
		kaplay({ global: false });

		return window["VERSION" as "ArrayBuffer"];
	});

	// Expect a title "to contain" a substring.
	expect(result).toBeUndefined();
});


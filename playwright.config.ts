import { defineConfig, devices } from "@playwright/test";

/**
 * read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * see https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: "./tests/",
	testIgnore: ["**/tests/.archive/**"],
	/* run tests in files in parallel */
	fullyParallel: true,
	/* reporter to use. see https://playwright.dev/docs/test-reporters */
	reporter: "html",
	/* shared settings for all the projects below. see https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* base url to use in actions like `await page.goto('')`. */
		// baseurl: 'http://localhost:3000',

		/* collect trace when retrying the failed test. see https://playwright.dev/docs/trace-viewer */
		trace: "on-first-retry",
	},

	/* configure projects for major browsers */
	projects: [
		{
			name: "chromium",
			use: { ...devices["desktop chrome"] },
		},
	],
});


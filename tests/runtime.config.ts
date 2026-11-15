import { defineConfig } from "@playwright/test";
import original from "../playwright.config";

export default defineConfig({
    ...original,
    timeout: 120_000,
    testDir: ".",
    testIgnore: ["**/.archive/**"],
    projects: [{
        name: "chromium",
        use: {
            headless: true,
            launchOptions: { args: ["--enable-unsafe-swiftshader"] },
        },
    }],
});

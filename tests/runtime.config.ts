import { defineConfig } from "@playwright/test";
import original from "../playwright.config";

export default defineConfig({
    ...original,
    testDir: ".",
    timeout: 120000,
    testIgnore: ["**/.archive/**"],
    projects: [{
        name: "chromium",
        use: {
            headless: true,
            launchOptions: { args: ["--enable-unsafe-swiftshader"] },
        },
    }],
});

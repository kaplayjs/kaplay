import { defineConfig } from "vitest/config";

const isBrowser = process.env.IS_BROWSER;
const exclude = [
    "**\/node_modules/**",
    "**\/dist/**",
    "**\/cypress/**",
    "**\/.{idea,git,cache,output,temp}/**",
    "**\/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
];

export default defineConfig({
    test: {
        name: "KAPLAY.js",
        environment: "puppeteer",
        globalSetup: "vitest-environment-puppeteer/global-init",
        fileParallelism: false,
        typecheck: {
            ignoreSourceErrors: true,
            tsconfig: "./tests/tsconfig.json",
        },
        include: ["**\/tests/*.{test,spec}.?(c|m)[jt]s?(x)"],
        exclude: !isBrowser
            ? [...exclude, "**\/*.browser.{test,spec}.?(c|m)[jt]s?(x)"]
            : exclude,
    },
    server: {
        hmr: false,
    },
});

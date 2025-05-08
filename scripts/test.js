// @ts-check

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { serve } from "./dev/serve.js";
import { build } from "./lib/build.js";
import { wait } from "./lib/util.js";

await build(true);
const port = process.env.PORT || 3001;
const server = serve({ port: port });

let failed = false;

console.log("launching browser");

const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
});

console.log("testing...");

const examplesDir = fs.readdirSync(path.join("kaplay", "examples"));

const examples = examplesDir.filter((p) => {
    const isExample = !p.startsWith(".") && p.endsWith(".js");
    if (!isExample) return false;

    const fileContent = fs.readFileSync(path.join("kaplay", "examples", p));
    const isTest = fileContent.includes("@test");
    const isV3001 = fileContent.includes("@minver 3001.0");

    return isTest && isV3001;
}).map((d) => path.basename(d, ".js"));

const playtestsDir = fs.readdirSync("tests/playtests");

const playtests = playtestsDir.filter((p) => {
    const isPlaytest = !p.startsWith(".") && p.endsWith(".js");
    if (!isPlaytest) return false;

    const fileContent = fs.readFileSync(path.join("tests/playtests", p));
    const isTest = fileContent.includes("@test");
    return isTest;
}).map((d) => path.basename(d, ".js"));

for (const example of [...examples, ...playtests]) {
    console.log(`testing example "${example}"`);
    const page = await browser.newPage();
    page.on("pageerror", (err) => {
        failed = true;
        console.error(example, err);
    });
    page.on("error", (err) => {
        failed = true;
        console.error(example, err);
    });
    await page.goto(`http://localhost:${port}/${example}`);
    await page.addScriptTag({ path: "scripts/lib/autoinput.js" });
    await wait(20);
    await page.close();
}

browser.close();
server.close();

console.log(
    failed
        ? "test suite failed, all is kaboomed"
        : "GOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOD",
);
process.exit(failed ? 1 : 0);

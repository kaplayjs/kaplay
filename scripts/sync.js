// As v3001 is in maintance, we fetch master examples/tests
import fs from "fs/promises";
import path from "path";

const masterTestPath = path.join(import.meta.dirname, "..", "kaplay", "tests");
const testPath = path.join(import.meta.dirname, "..", "tests");

fs.rm(testPath, {
    force: true,
    recursive: true,
});

fs.cp(masterTestPath, testPath, {
    force: true,
    recursive: true,
});

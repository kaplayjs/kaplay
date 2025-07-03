// Corrige imports de assets y assertions en .ts
// Ejecuta: node scripts/fix-assets-imports.cjs

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

function walk(dir, callback) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(fullPath, callback);
        }
        else if (entry.isFile() && fullPath.endsWith(".ts")) {
            callback(fullPath);
        }
    });
}

function fixAssets(file) {
    let content = fs.readFileSync(file, "utf8");
    // Quita .js de imports de assets (png, mp3, json, jpg, jpeg, wav, ogg, webp, gif, svg)
    content = content.replace(
        /(from\s+["'])(\.\.?\/[^"']+?\.(?:png|mp3|json|jpg|jpeg|wav|ogg|webp|gif|svg))\.js(["'])/g,
        "$1$2$3",
    );
    // Corrige assertion -> with para JSON
    content = content.replace(
        /(import\s+.*?from\s+.*?\.json)(\.js)?\s+assert\s+\{\s*type:\s*"json"\s*\}/g,
        "$1 with { type: \"json\" }",
    );
    fs.writeFileSync(file, content, "utf8");
}

walk(rootDir, fixAssets);

console.log("✔ Imports de assets y assertions corregidos.");

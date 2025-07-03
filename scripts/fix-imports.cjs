// Script para agregar la extensión .js a imports relativos en archivos .ts
// Ejecuta: node scripts/fix-imports.cjs

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

function fixImports(file) {
    let content = fs.readFileSync(file, "utf8");
    // Solo reemplaza imports relativos que no tengan ya la extensión .js
    content = content.replace(
        /(from\s+["'])(\.\.?\/[^"']+?)(?<!\.js)(["'])/g,
        "$1$2.js$3",
    );
    fs.writeFileSync(file, content, "utf8");
}

walk(rootDir, fixImports);

console.log(
    "✔ Todos los imports relativos han sido actualizados con la extensión .js",
);

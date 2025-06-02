import { readdir, writeFile } from "fs/promises";
import { dirname, parse, relative, resolve } from "path";
import ts from "typescript";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const typesDir = resolve(__dirname, "../src/");
const srcDir = resolve(__dirname, "../src/");

const outputFile = resolve(srcDir, "index.ts");

async function getAllDeclarationFiles(dir, baseDir = dir) {
    let entries = await readdir(dir, { withFileTypes: true });
    let files = await Promise.all(
        entries.map((entry) => {
            let fullPath = resolve(dir, entry.name);
            if (entry.isDirectory()) {
                return getAllDeclarationFiles(fullPath, baseDir);
            }
            else if (entry.isFile() && entry.name.endsWith(".ts")) {
                return relative(baseDir, fullPath).replace(/\\/g, "/");
            }
            return [];
        }),
    );
    return files.flat();
}

async function extractTypesFromSourceFile(sourceFile) {
    let types = [];
    ts.forEachChild(sourceFile, (node) => {
        if (
            ts.isTypeAliasDeclaration(node)
            || ts.isInterfaceDeclaration(node)
            || ts.isClassDeclaration(node)
        ) {
            if (
                node.modifiers?.some((m) =>
                    m.kind === ts.SyntaxKind.ExportKeyword
                )
            ) {
                types.push(node.name.text);
            }
        }
    });
    return types.length ? types : null;
}

async function genIndex() {
    console.log("Generating src/index.ts");
    try {
        const files = await getAllDeclarationFiles(typesDir);
        const exports = [];

        // Only .ts files, skip index.ts and kaplay.ts
        const filteredFiles = files.filter(
            (file) => file !== "index.ts" && file !== "kaplay.ts",
        );
        const fullPaths = filteredFiles.map((file) => resolve(typesDir, file));

        const program = ts.createProgram(fullPaths, {});
        console.log("Extracting types");

        for (let i = 0; i < filteredFiles.length; ++i) {
            const file = filteredFiles[i];
            const fullPath = fullPaths[i];
            const sourceFile = program.getSourceFile(fullPath);
            if (!sourceFile) continue;
            const types = await extractTypesFromSourceFile(sourceFile);
            if (types) {
                const { dir, name } = parse(file);
                const importPath = `./${dir ? `${dir}/` : ""}${name}`;
                exports.push(
                    `export type { ${types.join(", ")} } from "${importPath}";`,
                );
            }
        }

        exports.push(`export { kaplay as default} from "./kaplay";`);

        await writeFile(outputFile, exports.join("\n") + "\n");
        console.log("-> src/index.ts");
    } catch (error) {
        console.error("F", error);
    }
}

genIndex();

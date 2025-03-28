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

async function extractTypes(filePath) {
    const program = ts.createProgram([filePath], {});
    const sourceFile = program.getSourceFile(filePath);

    if (!sourceFile) return null;

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
    console.log("generating src/index.ts");
    try {
        const files = await getAllDeclarationFiles(typesDir);
        const exports = [];

        console.log("extracting types");

        for (const file of files) {
            if (file === "index.ts" || file === "kaplay.ts") continue;

            const fullPath = resolve(typesDir, file);
            const types = await extractTypes(fullPath);

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

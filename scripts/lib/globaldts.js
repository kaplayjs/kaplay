// Generate global.d.ts
// @ts-check

import fs from "fs/promises";
import ts from "typescript";
import { DIST_DIR, SRC_DIR } from "../constants.js";
import { writeFile } from "./util.js";

export async function genGlobalDTS() {
    // global dts
    const dts = await fs.readFile(`${SRC_DIR}/types.ts`, "utf-8");

    // we create this file to get information about the typescript
    const f = ts.createSourceFile(
        "ts",
        dts,
        ts.ScriptTarget.Latest,
        true,
    );

    function transform(o, f) {
        for (const k in o) {
            if (o[k] == null) {
                continue;
            }
            const v = f(k, o[k]);
            if (v != null) {
                o[k] = v;
            }
            else {
                delete o[k];
            }
            if (typeof o[k] === "object") {
                transform(o[k], f);
            }
        }
        return o;
    }

    // transform and prune typescript ast to a format more meaningful to us
    const stmts = transform(f.statements, (k, v) => {
        switch (k) {
            case "end":
            case "flags":
            case "parent":
            case "modifiers":
            case "transformFlags":
            case "modifierFlagsCache":
                return;
            case "name":
            case "typeName":
            case "tagName":
                return v.escapedText;
            case "pos":
                return typeof v === "number" ? undefined : v;
            case "kind":
                return ts.SyntaxKind[v];
            case "questionToken":
                return true;
            case "members": {
                const members = {};
                for (const mem of v) {
                    const name = mem.name?.escapedText;
                    if (!name || name === "toString") {
                        continue;
                    }
                    if (!members[name]) {
                        members[name] = [];
                    }
                    members[name].push(mem);
                }
                return members;
            }
            case "jsDoc": {
                const doc = v[0];
                const taglist = doc.tags ?? [];
                const tags = {};
                for (const tag of taglist) {
                    const name = tag.tagName.escapedText;
                    if (!tags[name]) {
                        tags[name] = [];
                    }
                    tags[name].push(tag.comment);
                }
                return {
                    doc: doc.comment,
                    tags: tags,
                };
            }
            default:
                return v;
        }
    });

    // check if global defs are being generated
    let globalGenerated = false;

    // generate global decls for KAPLAYCtx members
    let globalDts = "";

    globalDts +=
        "import { KAPLAYCtx } from \"./types\"\nimport { kaplay as KAPLAY } from \"./kaplay\"\n";
    globalDts += "declare global {\n";

    for (const stmt of stmts) {
        if (stmt.name === "KAPLAYCtx") {
            if (stmt.kind !== "InterfaceDeclaration") {
                throw new Error("KAPLAYCtx must be an interface.");
            }
            for (const name in stmt.members) {
                globalDts += `\tconst ${name}: KAPLAYCtx["${name}"]\n`;
            }
            globalGenerated = true;
        }
    }

    globalDts += `\tconst kaplay: typeof KAPLAY\n`;
    globalDts += `\tconst kaboom: typeof KAPLAY\n`;

    globalDts += "}\n";

    if (!globalGenerated) {
        throw new Error("KAPLAYCtx not found, failed to generate global defs.");
    }

    writeFile(`${DIST_DIR}/declaration/global.d.ts`, globalDts);
    writeFile(`${DIST_DIR}/declaration/global.js`, "");
}

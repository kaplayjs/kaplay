// Generate global.d.ts
// @ts-check

import fs from "fs/promises";
import ts from "typescript";
import { DIST_DIR } from "../constants.ts";
import { writeFile } from "./util.ts";

export async function genGlobalDTS() {
    // ensure declaration dir exists
    await fs.mkdir(`${DIST_DIR}/declaration`, { recursive: true });

    // global dts
    const docts = await fs.readFile(`${DIST_DIR}/doc.d.ts`, "utf-8");

    // we create this file to get information about the typescript
    const f = ts.createSourceFile(
        "ts",
        docts,
        ts.ScriptTarget.Latest,
        true,
    );

    function transform(o: any, f: (k: string, v: any) => any): any[] {
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
                const members: Record<string, any> = {};
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
                const tags: Record<string, string[]> = {};
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
    let globalDts2 = "";

    const imp = "import { KAPLAYCtx, default as KAPLAY } from \"../doc\"\n";
    const imp2 = "type KAPLAY = typeof kaplay;";

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

    globalDts2 = globalDts;
    globalDts2 += "const kaplay: KAPLAY;\n";
    globalDts2 += "const kaboom: KAPLAY;\n";
    globalDts += `\tconst kaplay: typeof KAPLAY\n`;
    globalDts += `\tconst kaboom: typeof KAPLAY\n`;

    globalDts += "}\n";
    globalDts2 += "}\n";

    if (!globalGenerated) {
        throw new Error("KAPLAYCtx not found, failed to generate global defs.");
    }

    writeFile(`${DIST_DIR}/declaration/global.d.ts`, imp + globalDts);
    writeFile(`${DIST_DIR}/declaration/global.js`, "");
    writeFile(
        `${DIST_DIR}/types.d.ts`,
        docts + imp2 + globalDts2,
    );
}

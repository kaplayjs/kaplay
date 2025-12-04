// @ts-check

import { assets } from "@kaplayjs/crew";
import express from "express";
import fs from "fs/promises";
import path from "path";
import { getDirBasenames } from "./util/getDir.ts";

export function serve(opt = {}) {
    const port = opt.port || process.env.PORT || 4000;
    const app = express();

    app.set("view engine", "ejs");
    app.set("views", path.join(import.meta.dirname, "views"));
    app.use("/dist", express.static("dist"));
    app.use(express.static("examples"));
    app.use("/tests/playtests", express.static("tests/playtests"));
    for (const [name, asset] of Object.entries(assets)) {
        const outlined = asset.outlined;

        app.get(`/crew/${name}.png`, (req, res) => {
            const img = Buffer.from(
                asset.sprite.replace(/data:image\/png;base64,/, ""),
                "base64",
            );

            res.writeHead(200, {
                "Content-Type": "image/png",
                "Content-Length": img.length,
            });
            res.end(img);
        });

        if (!outlined) continue;

        app.get(`/crew/${name}-o.png`, (req, res) => {
            const img = Buffer.from(
                outlined.replace(/data:image\/png;base64,/, ""),
                "base64",
            );

            res.writeHead(200, {
                "Content-Type": "image/png",
                "Content-Length": img.length,
            });
            res.end(img);
        });
    }

    app.get("/", async (req, res) => {
        const examples = (await fs.readdir("examples"))
            .filter((p) => !p.startsWith(".") && p.endsWith(".js"))
            .map((d) => path.basename(d, ".js"));

        const neoPlaytests = (await getDirBasenames(path.join("tests", "playtests"))).map((d) => {
            const folder = path.dirname(path.relative("playtests", d));
            const name = path.basename(d, ".js");

            return {
                folder: folder == "." ? "Ungrouped" : folder,
                name: name,
                url: folder == "." ? name : `${folder}/${name}` 
            }
        })

        const groupedPlaytests = Object.groupBy(neoPlaytests, (x) => x.folder);        
        const playtests = Object.entries(groupedPlaytests).map(([folder, tests]) => ({
            folder: folder,
            tests: tests,
        }))

        res.render("examplesList", { examples, playtests: playtests });
    });

    app.get("/:name", async (req, res) => {
        const examples = (await fs.readdir("examples"))
            .filter((p) => !p.startsWith(".") && p.endsWith(".js"))
            .map((d) => path.basename(d, ".js"));
        const playtests = (await fs.readdir(path.join("tests", "playtests")))
            .filter((p) => !p.startsWith(".") && p.endsWith(".js"))
            .map((d) => path.basename(d, ".js"));

        const allPlayTests = [...examples, ...playtests];

        const name = req.params.name;
        const isPlayTest = playtests.includes(name);
        const examplePath = isPlayTest
            ? `tests/playtests/${name}.js`
            : `${name}.js`;

        if (!allPlayTests.includes(name)) {
            res.status(404);
            res.send(`example not found: ${name}`);
            return;
        }

        res.render("game", {
            name,
            path: examplePath,
            prev: allPlayTests[
                (allPlayTests.indexOf(name) - 1 + allPlayTests.length)
                % allPlayTests.length
            ],
            next: allPlayTests[
                (allPlayTests.indexOf(name) + 1) % allPlayTests.length
            ],
            vscode: `vscode://file/${path.resolve(examplePath)}`,
        });
    });

    return app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`);
    });
}

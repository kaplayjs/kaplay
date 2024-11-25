// @ts-check

import express from "express";
import fs from "fs/promises";
import path from "path";
import { isFile } from "../lib/util.js";

export function serve(opt = {}) {
    const port = opt.port || process.env.PORT || 8000;
    const app = express();

    app.set("view engine", "ejs");
    app.set("views", path.join(import.meta.dirname, "views"));
    app.use(express.static("assets"));
    app.use("/dist", express.static("dist"));
    app.use("/sprites", express.static("sprites"));
    app.use("/examples", express.static("examples"));
    app.use("/tests/playtests", express.static("tests/playtests"));

    app.get("/", async (req, res) => {
        const examples = (await fs.readdir("examples"))
            .filter((p) => !p.startsWith(".") && p.endsWith(".js"))
            .map((d) => path.basename(d, ".js"));
        const playtests = (await fs.readdir(path.join("tests", "playtests")))
            .filter((p) => !p.startsWith(".") && p.endsWith(".js"))
            .map((d) => path.basename(d, ".js"));

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
            : `examples/${name}.js`;

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

// Serving files in Express.js for KAPLAY development

import { assets } from "@kaplayjs/crew";
import express from "express";
import fs from "fs/promises";
import path from "path";

export function serve() {
    const port = process.env.PORT || 4000;
    const app = express();

    app.set("view engine", "ejs");
    app.set("views", path.join(import.meta.dirname, "views"));
    app.use("/dist", express.static("dist"));
    app.use(express.static("examples"));
    app.use("/tests/playtests", express.static("tests/playtests"));

    // Expose crew urls
    for (const [name, asset] of Object.entries(assets)) {
        if (asset.kind === "Sprite" || asset.kind === "Font") {
            const spriteAsset = "spritesheet" in asset
                ? asset.spritesheet!
                : asset;
            const sprite = spriteAsset.sprite;
            const outlined = spriteAsset.outlined;

            app.get(`/crew/${name}.png`, (req, res) => {
                const img = Buffer.from(
                    sprite.replace(/data:image\/png;base64,/, ""),
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
        else if (asset.kind === "Sound") {
            app.get(`/crew/${name}.${asset.fileFormat}`, (req, res) => {
                const sound = Buffer.from(
                    asset.sound.replace(/data:.*base64,/, ""),
                    "base64",
                );
                const mimeExt = asset.fileFormat === "mp3"
                    ? "mpeg"
                    : asset.fileFormat;

                res.writeHead(200, {
                    "Content-Type": `audio/${mimeExt}`,
                    "Content-Length": sound.length,
                });
                res.end(sound);
            });
        }
    }

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

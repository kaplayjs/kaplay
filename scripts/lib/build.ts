// Build KAPLAY

import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { DIST_DIR, SRC_PATH } from "../constants.ts";

// KAPLAY Package.json

const pkgFile = path.join(import.meta.dirname, "../../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf-8"));
const pkgVersion = pkg.version;

export const fmts = (name: string): esbuild.BuildOptions[] => [
    {
        format: "iife",
        globalName: "kaplay",
        outfile: `${DIST_DIR}/${name}.js`,
        footer: {
            js: "window.kaboom = kaplay.default; window.kaplay = kaplay.default",
        },
    },
    { format: "cjs", outfile: `${DIST_DIR}/${name}.cjs` },
    { format: "esm", outfile: `${DIST_DIR}/${name}.mjs` },
];

const kaplayBuilds = fmts("kaplay");
const kaboomBuild = fmts("kaboom")[0];

export const config: esbuild.BuildOptions = {
    bundle: true,
    minify: true,
    keepNames: false,
    // MORE MINIFICATION
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    loader: {
        ".png": "dataurl",
        ".glsl": "text",
        ".mp3": "binary",
    },
    entryPoints: [SRC_PATH],
    define: {
        "KAPLAY_VERSION": JSON.stringify(pkgVersion),
    },
};

export async function build(fast = false) {
    if (fast) {
        // fast build, no minification, no kabooms
        return esbuild.build({
            ...config,
            ...kaplayBuilds[0],
            bundle: true,
            minify: false,
            sourcemap: false,
            minifyIdentifiers: false,
            minifySyntax: false,
            minifyWhitespace: false,
        }).then(() => console.log("-> kaplay.js"));
    }
    return Promise.all(
        [{
            formats: fmts("kaplay"),
            sourceMap: true,
        }, {
            formats: [kaboomBuild],
            sourceMap: false,
        }].flat().map(({ formats, sourceMap }) => {
            return formats.map((fmt) => {
                return esbuild.build({
                    ...config,
                    ...fmt,
                    sourcemap: sourceMap,
                }).then(() => console.log(`-> ${fmt.outfile}`));
            });
        }),
    );
}

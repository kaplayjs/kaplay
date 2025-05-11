// Build KAPLAY
// @ts-check

import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { DIST_DIR, SRC_PATH, SRC_PATH_MINI } from "../constants.js";

// KAPLAY Package.json

const pkgFile = path.join(import.meta.dirname, "../../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf-8"));
const pkgVersion = pkg.version;

/**
 * Different formats for the build
 *
 * @param {string} name
 * @returns {esbuild.BuildOptions[]}
 */
export const fmts = (name) => [
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
const kaplayMiniBuild = fmts("mini")[2];

/** @type {esbuild.BuildOptions} */
export const config = {
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
            formats: kaplayBuilds,
            sourceMap: true,
        }, {
            formats: [kaboomBuild],
            sourceMap: false,
        }, {
            formats: [kaplayMiniBuild],
            sourceMap: false,
            entryPoints: [SRC_PATH_MINI],
        }].flat().map(({ formats, sourceMap, entryPoints }) => {
            const entry = entryPoints ?? config.entryPoints;

            return formats.map((fmt) => {
                return esbuild.build({
                    ...config,
                    ...fmt,
                    sourcemap: sourceMap,
                    entryPoints: entry,
                }).then(() => console.log(`${entry?.[0]} -> ${fmt.outfile}`));
            });
        }),
    );
}

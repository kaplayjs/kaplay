// Build KAPLAY
// @ts-check

import * as esbuild from "esbuild";
import { DIST_DIR, SRC_PATH } from "../constants.js";

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

/** @type {esbuild.BuildOptions} */
export const config = {
    bundle: true,
    sourcemap: true,
    minify: true,
    keepNames: true,
    loader: {
        ".png": "dataurl",
        ".glsl": "text",
        ".mp3": "binary",
    },
    entryPoints: [SRC_PATH],
};

export async function build() {
    return Promise.all(
        [fmts("kaplay"), fmts("kaboom")].flat().map((fmt) => {
            return esbuild.build({
                ...config,
                ...fmt,
            }).then(() => console.log(`-> ${fmt.outfile}`));
        }),
    );
}

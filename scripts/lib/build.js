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

const kaboom = fmts("kaboom")[0];

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
};

export async function build() {
    return Promise.all(
        [{
            formats: fmts("kaplay"),
            sourceMap: true,
        }, {
            formats: [kaboom],
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

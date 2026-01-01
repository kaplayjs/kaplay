// Used in npm dev script
// @ts-check

import esbuild from "esbuild";
import { config, fmts } from "../lib/build.ts";
import { serve } from "./serve.ts";

export async function dev() {
    serve();

    const ctx = await esbuild.context({
        ...config,
        ...fmts("kaplay")[0],
        sourcemap: true,
        minify: false,
        minifyIdentifiers: false,
        minifySyntax: false,
        minifyWhitespace: false,
        keepNames: true,
        plugins: [
            {
                name: "logger",
                setup(b) {
                    b.onEnd(() => {
                        console.log(`-> ${fmts("kaplay")[0].outfile}`);
                    });
                },
            },
        ],
    });

    await ctx.watch();
}

// Used in npm dev script
// @ts-check

import esbuild from "esbuild";
import { config, fmts } from "../lib/build.js";
import { serve } from "./serve.js";

export async function dev() {
    serve();

    const ctx = await esbuild.context({
        ...config,
        ...fmts("kaplay")[0],
        minify: false,
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

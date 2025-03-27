/**
The engine is what KAPLAY needs for running and proccesing all it's stuff
**/

import { initApp } from "../app";
import { initAssets } from "../assets";
import { initAudio } from "../audio";
import { initGame } from "../game";
import { initAppGfx, initGfx } from "../gfx";
import type { KAPLAYOpt } from "../types";
import { createCanvas } from "./canvas";
import { createFontCache } from "./fontCache";
import { createFrameRenderer } from "./frameRendering";

export const createEngine = (gopt: KAPLAYOpt) => {
    const canvas = createCanvas(gopt);
    const { fontCacheC2d, fontCacheCanvas } = createFontCache();
    const app = initApp({ canvas, ...gopt });

    // TODO: Probably we should move this to initGfx
    const canvasContext = app.canvas
        .getContext("webgl", {
            antialias: true,
            depth: true,
            stencil: true,
            alpha: true,
            preserveDrawingBuffer: true,
        });

    if (!canvasContext) throw new Error("WebGL not supported");

    const gl = canvasContext;

    // TODO: Investigate correctly what's the differente between GFX and AppGFX and reduce to 1 method
    const gfx = initGfx(gl, gopt);
    const appGfx = initAppGfx(gfx, gopt);
    const assets = initAssets(gfx, gopt.spriteAtlasPadding ?? 0);
    const audio = initAudio();
    const game = initGame();

    // Frame rendering
    const { frameStart, frameEnd } = createFrameRenderer(
        appGfx,
        gopt.pixelDensity ?? 1,
    );

    return {
        canvas,
        app,
        gfx,
        appGfx,
        audio,
        assets,
        frameStart,
        frameEnd,
        fontCacheC2d,
        fontCacheCanvas,
        game,
    };
};

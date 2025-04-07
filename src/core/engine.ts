/**
The engine is what KAPLAY needs for running and proccesing all it's stuff
**/

import { initApp } from "../app/app";
import { initAssets } from "../assets/asset";
import { initAudio } from "../audio/audio";
import { initGame } from "../game/game";
import { createCanvas } from "../gfx/canvas";
import { initGfx } from "../gfx/gfx";
import { initAppGfx } from "../gfx/gfxApp";
import type { KAPLAYCtx, KAPLAYOpt } from "../types";
import { initDebug } from "./debug";
import { createFontCache } from "./fontCache";
import { createFrameRenderer } from "./frameRendering";

export type Engine = ReturnType<typeof createEngine>;

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
    const frameRenderer = createFrameRenderer(
        appGfx,
        game,
        gopt.pixelDensity ?? 1,
    );

    // Debug mode
    const debug = initDebug(gopt, app, appGfx, audio, game, frameRenderer);

    return {
        globalOpt: gopt,
        canvas,
        app,
        ggl: gfx,
        gfx: appGfx,
        audio,
        assets,
        frameRenderer,
        fontCacheC2d,
        fontCacheCanvas,
        game,
        debug,
        // Patch, k it's only avaible after running kaplay()
        k: null as unknown as KAPLAYCtx,
    };
};

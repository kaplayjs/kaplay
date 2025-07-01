// The engine is what KAPLAY needs for running and proccesing all it's stuff

import { initApp } from "../app/app";
import { initAssets } from "../assets/asset";
import { initAudio } from "../audio/audio";
import { createDebug } from "../debug/debug";
import { spriteFactory } from "../ecs/components/draw/sprite";
import { moveFactory } from "../ecs/components/transform/move";
import { posFactory } from "../ecs/components/transform/pos";
import { registerPrefabFactory } from "../ecs/entity/prefab";
import { createGame } from "../game/game";
import { createCanvas } from "../gfx/canvas";
import { initGfx } from "../gfx/gfx";
import { initAppGfx } from "../gfx/gfxApp";
import type { KAPLAYCtx, KAPLAYOpt } from "../types";
import { startEngineLoop } from "./engineLoop";
import { createFontCache } from "./fontCache";
import { createFrameRenderer } from "./frameRendering";

export type Engine = ReturnType<typeof createEngine>;

// Create global variables
window.kaplayjs_assetsAliases = {};

export const createEngine = (gopt: KAPLAYOpt) => {
    // Default options
    const opt = Object.assign({
        scale: 1,
    }, gopt);

    const canvas = createCanvas(opt);
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
    const gfx = initGfx(gl, opt);
    const appGfx = initAppGfx(gfx, opt);
    const assets = initAssets(gfx, opt.spriteAtlasPadding ?? 0);
    const audio = initAudio();
    const game = createGame();

    // Frame rendering
    const frameRenderer = createFrameRenderer(
        appGfx,
        game,
        opt.pixelDensity ?? 1,
    );

    // Debug mode
    const debug = createDebug(opt, app, appGfx, audio, game, frameRenderer);

    // Register default factories
    registerPrefabFactory("pos", posFactory);
    registerPrefabFactory("sprite", spriteFactory);
    registerPrefabFactory("move", moveFactory);

    return {
        globalOpt: opt,
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
        gc: [] as (() => void)[],
        // Patch, k it's only avaible after running kaplay()
        k: null as unknown as KAPLAYCtx,
        startLoop() {
            startEngineLoop(
                app,
                game,
                assets,
                opt,
                frameRenderer,
                debug,
            );
        },
    };
};

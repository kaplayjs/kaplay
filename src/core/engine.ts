// The engine is what KAPLAY needs for running and proccesing all it's stuff

import { initApp } from "../app/app";
import { initAssets } from "../assets/asset";
import { initAudio } from "../audio/audio";
import { createDebug } from "../debug/debug";
import { blendFactory } from "../ecs/components/draw/blend";
import { circleFactory } from "../ecs/components/draw/circle";
import { colorFactory } from "../ecs/components/draw/color";
import { ellipseFactory } from "../ecs/components/draw/ellipse";
import { maskFactory } from "../ecs/components/draw/mask";
import { opacityFactory } from "../ecs/components/draw/opacity";
import { outlineFactory } from "../ecs/components/draw/outline";
import { rectFactory } from "../ecs/components/draw/rect";
import { spriteFactory } from "../ecs/components/draw/sprite";
import { textFactory } from "../ecs/components/draw/text";
import { anchorFactory } from "../ecs/components/transform/anchor";
import { fixedFactory } from "../ecs/components/transform/fixed";
import { moveFactory } from "../ecs/components/transform/move";
import { posFactory } from "../ecs/components/transform/pos";
import { rotateFactory } from "../ecs/components/transform/rotate";
import { scaleFactory } from "../ecs/components/transform/scale";
import { zFactory } from "../ecs/components/transform/z";
import { registerPrefabFactory } from "../ecs/entity/prefab";
import { createScopeHandlers } from "../events/scopeHandlers";
import {
    attachScopeHandlersToGameObjRaw,
    createAppScope,
    createSceneScope,
} from "../events/scopes";
import { createGame } from "../game/game";
import { createCanvas } from "../gfx/canvas";
import { initGfx } from "../gfx/gfx";
import { initAppGfx } from "../gfx/gfxApp";
import type { KAPLAYOpt } from "../types";
import type { KAPLAYCtx } from "./contextType";
import { startEngineLoop } from "./engineLoop";
import { createFontCache } from "./fontCache";
import { createFrameRenderer } from "./frameRendering";

export type Engine = ReturnType<typeof createEngine>;

// Create global variables
window.kaplayjs_assetsAliases = {};

/**
 * Creates all necessary contexts and variables for running a KAPLAY instance.
 *
 * @ignore
 *
 * @param gopt - Global options for create the engine.
 *
 * @returns Engine.
 */
export const createEngine = (gopt: KAPLAYOpt) => {
    // Default options
    const opt = Object.assign(
        {
            scale: 1,
            spriteAtlasPadding: 2,
            defaultLifetimeScope: "scene" as "scene" | "app",
        } satisfies KAPLAYOpt,
        gopt,
    );

    const canvas = createCanvas(opt);
    const { fontCacheC2d, fontCacheCanvas } = createFontCache();
    const app = initApp({ canvas, ...gopt });
    const gameHandlers = createScopeHandlers(app);
    const sceneScope = createSceneScope(app, gameHandlers);
    const appScope = createAppScope(gameHandlers);
    attachScopeHandlersToGameObjRaw(gameHandlers);

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
    const assets = initAssets(gfx, opt);
    const audio = initAudio();
    const game = createGame();

    // Frame rendering
    const frameRenderer = createFrameRenderer(
        app,
        appGfx,
        game,
        opt.pixelDensity ?? 1,
    );

    // Debug mode
    const debug = createDebug(opt, app, appGfx, audio, game, frameRenderer);

    // Register default factories

    // Transform Serialization
    registerPrefabFactory("anchor", anchorFactory);
    registerPrefabFactory("fixed", fixedFactory);
    // `follow()` missing, we should figure a way to serialize an object reference (probably use named())
    // `layer()` missing, needs investigation
    registerPrefabFactory("move", moveFactory);
    // `offscreen()` missing
    registerPrefabFactory("pos", posFactory);
    registerPrefabFactory("rotate", rotateFactory);
    registerPrefabFactory("scale", scaleFactory);
    registerPrefabFactory("z", zFactory);

    // Draw Serialization
    registerPrefabFactory("blend", blendFactory);
    registerPrefabFactory("circle", circleFactory);
    registerPrefabFactory("color", colorFactory);
    // `drawon()` missing
    registerPrefabFactory("ellipse", ellipseFactory);
    // `fadeIn()` missing
    registerPrefabFactory("mask", maskFactory);
    registerPrefabFactory("opacity", opacityFactory);
    registerPrefabFactory("outline", outlineFactory);
    // `particles()` missing
    // `picture()` missing
    // `raycast()` missing, anyway, is not a component
    registerPrefabFactory("rect", rectFactory);
    registerPrefabFactory("sprite", spriteFactory);
    registerPrefabFactory("text", textFactory);
    // `uvquad()` missing
    // `video()` missing

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
        sceneScope,
        appScope,
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

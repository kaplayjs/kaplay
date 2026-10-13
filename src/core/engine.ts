// The engine is what KAPLAY needs for running and proccesing all it's stuff

import { initApp } from "../app/app";
import { initAssets } from "../assets/asset";
import { initAudio } from "../audio/audio";
import { createDebug } from "../debug/debug";
import { blendFactory } from "../ecs/components/draw/blend";
import { circleFactory } from "../ecs/components/draw/circle";
import { colorFactory } from "../ecs/components/draw/color";
import { ellipseFactory } from "../ecs/components/draw/ellipse";
import { fillFactory } from "../ecs/components/draw/fill";
import { maskFactory } from "../ecs/components/draw/mask";
import { opacityFactory } from "../ecs/components/draw/opacity";
import { outlineFactory } from "../ecs/components/draw/outline";
import { rectFactory } from "../ecs/components/draw/rect";
import { shaderFactory } from "../ecs/components/draw/shader";
import { spriteFactory } from "../ecs/components/draw/sprite";
import { textFactory } from "../ecs/components/draw/text";
import { uvquadFactory } from "../ecs/components/draw/uvquad";
import { videoFactory } from "../ecs/components/draw/video";
import { agentFactory } from "../ecs/components/level/agent";
import { levelFactory } from "../ecs/components/level/level";
import { patrolFactory } from "../ecs/components/level/patrol";
import { sentryFactory } from "../ecs/components/level/sentry";
import { tileFactory } from "../ecs/components/level/tile";
import { fakeMouseFactory } from "../ecs/components/misc/fakeMouse";
import { healthFactory } from "../ecs/components/misc/health";
import { lifespanFactory } from "../ecs/components/misc/lifespan";
import { namedFactory } from "../ecs/components/misc/named";
import { stateFactory } from "../ecs/components/misc/state";
import { stayFactory } from "../ecs/components/misc/stay";
import { textInputFactory } from "../ecs/components/misc/textInput";
import { areaFactory } from "../ecs/components/physics/area";
import { bodyFactory } from "../ecs/components/physics/body";
import { doubleJumpFactory } from "../ecs/components/physics/doubleJump";
import { anchorFactory } from "../ecs/components/transform/anchor";
import { fixedFactory } from "../ecs/components/transform/fixed";
import { followFactory } from "../ecs/components/transform/follow";
import { layerFactory } from "../ecs/components/transform/layer";
import { moveFactory } from "../ecs/components/transform/move";
import { offscreenFactory } from "../ecs/components/transform/offscreen";
import { posFactory } from "../ecs/components/transform/pos";
import { rotateFactory } from "../ecs/components/transform/rotate";
import { scaleFactory } from "../ecs/components/transform/scale";
import { skewFactory } from "../ecs/components/transform/skew";
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
    const sceneScope = createSceneScope(gameHandlers);
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

    // TODO: Investigate correctly what's the different between GFX and AppGFX and reduce to 1 method
    const gfx = initGfx(gl, opt);
    const appGfx = initAppGfx(gfx, opt, canvas);
    const assets = initAssets(gfx, opt, appGfx);
    const audio = initAudio();
    const game = createGame(opt.rng);

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
    // constraint() missing (has obj ref)
    registerPrefabFactory("fixed", fixedFactory);
    registerPrefabFactory("follow", followFactory);
    registerPrefabFactory("layer", layerFactory);
    registerPrefabFactory("move", moveFactory);
    registerPrefabFactory("offscreen", offscreenFactory);
    registerPrefabFactory("pos", posFactory);
    registerPrefabFactory("rotate", rotateFactory);
    registerPrefabFactory("scale", scaleFactory);
    registerPrefabFactory("skew", skewFactory);
    registerPrefabFactory("z", zFactory);

    // Draw Serialization
    registerPrefabFactory("blend", blendFactory);
    registerPrefabFactory("circle", circleFactory);
    registerPrefabFactory("color", colorFactory);
    // `drawon()` missing (has FrameBuffer, Picture refs)
    registerPrefabFactory("ellipse", ellipseFactory);
    registerPrefabFactory("fill", fillFactory);
    // `fadeIn()` missing, but wasn't it deprecated?
    registerPrefabFactory("mask", maskFactory);
    registerPrefabFactory("opacity", opacityFactory);
    registerPrefabFactory("outline", outlineFactory);
    // `particles()` missing (has Texture ref)
    // `picture()` missing (has Picture ref)
    // `polygon()` missing (has Texture ref)
    registerPrefabFactory("rect", rectFactory);
    registerPrefabFactory("shader", shaderFactory); // partial support (no uniform)
    registerPrefabFactory("sprite", spriteFactory);
    registerPrefabFactory("text", textFactory);
    registerPrefabFactory("uvquad", uvquadFactory);
    registerPrefabFactory("video", videoFactory);

    // Level Serialization
    registerPrefabFactory("agent", agentFactory);
    registerPrefabFactory("level", levelFactory);
    // `pathFinder()` & `pathfinderMap()?` missing (needs Graph)
    registerPrefabFactory("patrol", patrolFactory);
    registerPrefabFactory("sentry", sentryFactory); // partial support (no () => GameObj[] as candidates)
    registerPrefabFactory("tile", tileFactory);

    // Physics Serialization
    registerPrefabFactory("area", areaFactory);
    registerPrefabFactory("body", bodyFactory);
    registerPrefabFactory("doubleJump", doubleJumpFactory);
    // Effectors
    // `surfaceEffector()` missing
    // `areaEffector()` missing
    // `pointEffector()` missing
    // `constantForce()` missing
    // `platformEffector()` missing (has shouldCollide() fn opt)

    // Other & Misc Serialization
    // `animate()` missing (complicated)
    // `boom()` used only internally in `addKaboom()`
    registerPrefabFactory("fakeMouse", fakeMouseFactory);
    registerPrefabFactory("health", healthFactory);
    registerPrefabFactory("lifespan", lifespanFactory);
    registerPrefabFactory("named", namedFactory);
    registerPrefabFactory("state", stateFactory);
    registerPrefabFactory("stay", stayFactory);
    registerPrefabFactory("textInput", textInputFactory);
    // `timer()` missing

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
        // Patch, k it's only available after running kaplay()
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

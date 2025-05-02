// The definitive version!
import type { ButtonsDef } from "./app/inputBindings";
import { getFailedAssets, loadProgress } from "./assets/asset";
import { loadSprite } from "./assets/sprite";
import { createContext } from "./core/context";
import { createEngine } from "./core/engine";
import { handleErr } from "./core/errors";
import { plug } from "./core/plug";
import { getCollisionSystem } from "./ecs/systems/collision";
import { initEvents } from "./game/initEvents";
import { LCEvents, system } from "./game/systems";
import { drawDebug } from "./gfx/draw/drawDebug";
import { drawFrame } from "./gfx/draw/drawFrame";
import { drawLoadScreen } from "./gfx/draw/drawLoadingScreen";
import { updateViewport } from "./gfx/viewport";

import boomSpriteSrc from "./kassets/boom.png";
import kaSpriteSrc from "./kassets/ka.png";
import {
    type InfOpt,
    type KAPLAYCtx,
    type KAPLAYOpt,
    type KAPLAYPlugin,
    type MergePlugins,
    type Opt,
    type PluginList,
} from "./types";

/**
 * KAPLAY.js internal data
 */
export let _k: KAPLAYCtx["_k"];

// If KAPLAY was runned before
let runned = false;

type KAPLAYGame<O extends Opt | undefined> = O extends Opt
    ? InfOpt<O>["Plugins"] extends PluginList<any>
        ? KAPLAYCtx<O> & MergePlugins<InfOpt<O>["Plugins"]>
    : KAPLAYCtx<O>
    : KAPLAYCtx;

// extends undefined
//     ? KAPLAYCtx<O>
//     : KAPLAYCtx<O> & MergePlugins<O["Plugins"]>;

/**
 * Initialize KAPLAY context. The starting point of all KAPLAY games.
 *
 * @example
 * ```js
 * // Start KAPLAY with default options (will create a fullscreen canvas under <body>)
 * kaplay()
 *
 * // Init with some options
 * kaplay({
 *     width: 320,
 *     height: 240,
 *     font: "sans-serif",
 *     canvas: document.querySelector("#mycanvas"),
 *     background: [ 0, 0, 255, ],
 * })
 *
 * // All KAPLAY functions are imported to global after calling kaplay()
 * add()
 * onUpdate()
 * onKeyPress()
 * vec2()
 *
 * // If you want to prevent KAPLAY from importing all functions to global and use a context handle for all KAPLAY functions
 * const k = kaplay({ global: false })
 *
 * k.add(...)
 * k.onUpdate(...)
 * k.onKeyPress(...)
 * k.vec2(...)
 * ```
 *
 * @group Start
 */
export const kaplay = <
    const O extends Opt | undefined = undefined,
>(
    opt?: O extends undefined ? O : KAPLAYOpt,
): KAPLAYGame<O> => {
    const gopt: KAPLAYOpt = opt ?? {};

    if (runned) {
        console.warn(
            "KAPLAY was runned before, cleaning state",
        );

        // cleanup
        // @ts-ignore
        _k = null;
    }

    runned = true;

    _k = createEngine(gopt);

    const {
        assets,
        audio,
        frameRenderer,
        app,
        game,
        debug,
    } = _k;

    const { checkFrame } = getCollisionSystem({
        narrow: gopt.narrowPhaseCollisionAlgorithm || "gjk",
    });

    system("collision", checkFrame, [
        LCEvents.AfterFixedUpdate,
        LCEvents.AfterUpdate,
    ]);

    // TODO: make this an opt
    game.kaSprite = loadSprite(null, kaSpriteSrc);
    game.boomSprite = loadSprite(null, boomSpriteSrc);

    let isFirstFrame = true;

    // main game loop
    app.run(() => {
        try {
            if (assets.loaded) {
                if (!debug.paused) {
                    for (
                        const sys of game
                            .systemsByEvent[LCEvents.BeforeFixedUpdate]
                    ) {
                        sys.run();
                    }

                    frameRenderer.fixedUpdateFrame();

                    for (
                        const sys of game
                            .systemsByEvent[LCEvents.AfterFixedUpdate]
                    ) {
                        sys.run();
                    }
                }

                // checkFrame();
            }
        } catch (e) {
            handleErr(e as Error);
        }
    }, (processInput, resetInput) => {
        try {
            processInput();

            if (!assets.loaded) {
                if (loadProgress() === 1 && !isFirstFrame) {
                    assets.loaded = true;
                    getFailedAssets().forEach(details =>
                        game.events.trigger("loadError", ...details)
                    );
                    game.events.trigger("load");
                }
            }

            if (
                !assets.loaded && gopt.loadingScreen !== false
                || isFirstFrame
            ) {
                frameRenderer.frameStart();
                // TODO: Currently if assets are not initially loaded no updates or timers will be run, however they will run if loadingScreen is set to false. What's the desired behavior or should we make them consistent?
                drawLoadScreen();
                frameRenderer.frameEnd();
            }
            else {
                if (!debug.paused) {
                    for (
                        const sys of game
                            .systemsByEvent[LCEvents.BeforeUpdate]
                    ) {
                        sys.run();
                    }

                    frameRenderer.updateFrame();

                    for (
                        const sys of game
                            .systemsByEvent[LCEvents.AfterUpdate]
                    ) {
                        sys.run();
                    }
                }

                // checkFrame();
                frameRenderer.frameStart();

                for (
                    const sys of game.systemsByEvent[LCEvents.BeforeDraw]
                ) {
                    sys.run();
                }

                drawFrame();
                if (gopt.debug !== false) drawDebug();

                for (const sys of game.systemsByEvent[LCEvents.AfterDraw]) {
                    sys.run();
                }

                frameRenderer.frameEnd();
            }

            if (isFirstFrame) {
                isFirstFrame = false;
            }

            game.events.trigger("frameEnd");

            resetInput();
        } catch (e) {
            handleErr(e as Error);
        }
    });

    updateViewport();
    initEvents();

    // the exported ctx handle
    const ctx: KAPLAYCtx = createContext(game, app, audio, debug);
    ctx._k = _k;
    _k.k = ctx;

    const plugins = gopt.plugins as unknown as KAPLAYPlugin<
        Record<string, unknown>
    >[];

    if (plugins) {
        plugins.forEach(plug);
    }

    // export everything to window if global is set
    if (gopt.global !== false) {
        for (const key in ctx) {
            (<any> window[<any> key]) = ctx[key as keyof KAPLAYCtx];
        }
    }

    if (gopt.focus !== false) {
        app.canvas.focus();
    }

    // @ts-ignore Just believe it's the correct type
    return ctx;
};

export default kaplay;

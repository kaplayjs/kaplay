import type { App } from "../app/app.js";
import { initAppEvents } from "../app/appEvents.js";
import {
    type AssetsCtx,
    getFailedAssets,
    loadProgress,
} from "../assets/asset.js";
import type { Debug } from "../debug/debug.js";
import { LCEvents } from "../ecs/systems/systems.js";
import type { Game } from "../game/game.js";
import { drawDebug } from "../gfx/draw/drawDebug.js";
import { drawFrame } from "../gfx/draw/drawFrame.js";
import { drawLoadScreen } from "../gfx/draw/drawLoadingScreen.js";
import { updateViewport } from "../gfx/viewport.js";
import type { KAPLAYOpt } from "../types.js";
import { handleErr } from "./errors.js";
import type { FrameRenderer } from "./frameRendering.js";

export function startEngineLoop(
    app: App,
    game: Game,
    assets: AssetsCtx,
    gopt: KAPLAYOpt,
    frameRenderer: FrameRenderer,
    debug: Debug,
) {
    let isFirstFrame = true;

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
    initAppEvents();
}

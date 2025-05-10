import type { App } from "../app/app";
import { initAppEvents } from "../app/appEvents";
import { type AssetsCtx, getFailedAssets, loadProgress } from "../assets/asset";
import type { Debug } from "../debug/debug";
import { LCEvents } from "../ecs/systems/systems";
import type { Game } from "../game/game";
import { drawDebug } from "../gfx/draw/drawDebug";
import { drawFrame } from "../gfx/draw/drawFrame";
import { drawLoadScreen } from "../gfx/draw/drawLoadingScreen";
import { updateViewport } from "../gfx/viewport";
import type { KAPLAYOpt } from "../types";
import { handleErr } from "./errors";
import type { FrameRenderer } from "./frameRendering";

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

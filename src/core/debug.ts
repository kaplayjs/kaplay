import type { App } from "../app/app";
import type { AudioCtx } from "../audio/audio";
import { LOG_MAX } from "../constants";
import type { Game } from "../game/game";
import type { AppGfxCtx } from "../gfx/gfxApp";
import type { Debug, KAPLAYOpt } from "../types";
import type { FrameRenderer } from "./frameRendering";

export const initDebug = (
    gopt: KAPLAYOpt,
    app: App,
    appGfx: AppGfxCtx,
    audio: AudioCtx,
    game: Game,
    fr: FrameRenderer,
): Debug => {
    let debugPaused = false;

    const debug = {
        inspect: false,
        set timeScale(timeScale: number) {
            app.state.timeScale = timeScale;
        },
        get timeScale() {
            return app.state.timeScale;
        },
        showLog: true,
        fps: () => app.fps(),
        numFrames: () => app.numFrames(),
        stepFrame: fr.updateFrame,
        drawCalls: () => appGfx.lastDrawCalls,
        clearLog: () => game.logs = [],
        log: (...msgs) => {
            const max = gopt.logMax ?? LOG_MAX;
            const msg = msgs.length > 1 ? msgs.concat(" ").join(" ") : msgs[0];

            game.logs.unshift({
                msg: msg,
                time: app.time(),
            });
            if (game.logs.length > max) {
                game.logs = game.logs.slice(0, max);
            }
        },
        error: (msg) =>
            debug.log(new Error(msg.toString ? msg.toString() : msg as string)),
        curRecording: null,
        numObjects: () => game.root.get("*", { recursive: true }).length,
        get paused() {
            return debugPaused;
        },
        set paused(v) {
            debugPaused = v;
            if (v) {
                audio.ctx.suspend();
            }
            else {
                audio.ctx.resume();
            }
        },
    } satisfies Debug;

    return debug;
};

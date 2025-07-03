import type { App } from "../app/app.js";
import type { AudioCtx } from "../audio/audio.js";
import { LOG_MAX } from "../constants/general.js";
import type { FrameRenderer } from "../core/frameRendering.js";
import type { Game } from "../game/game.js";
import type { AppGfxCtx } from "../gfx/gfxApp.js";
import { _k } from "../shared.js";
import type { KAPLAYOpt } from "../types.js";
import type { Recording } from "./record.js";

/**
 * An interface for debugging the game.
 *
 * @group Debug
 */
export interface Debug {
    /**
     * Pause the whole game.
     */
    paused: boolean;
    /**
     * Draw bounding boxes of all objects with `area()` component, hover to inspect their states.
     */
    inspect: boolean;
    /**
     * Global time scale.
     */
    timeScale: number;
    /**
     * Show the debug log or not.
     */
    showLog: boolean;
    /**
     * Current frames per second.
     */
    fps(): number;
    /**
     * Total number of frames elapsed.
     *
     * @since v3000.0
     */
    numFrames(): number;
    /**
     * Number of draw calls made last frame.
     */
    drawCalls(): number;
    /**
     * Step to the next frame. Useful with pausing.
     */
    stepFrame(): void;
    /**
     * Clear the debug log.
     */
    clearLog(): void;
    /**
     * Log some text to on screen debug log.
     */
    log(...msg: any): void;
    /**
     * Log an error message to on screen debug log.
     */
    error(msg: any): void;
    /**
     * The recording handle if currently in recording mode.
     *
     * @since v2000.1
     */
    curRecording: Recording | null;
    /**
     * Get total number of objects.
     *
     * @since v3001.0
     */
    numObjects(): number;
}

export const createDebug = (
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

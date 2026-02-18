import type { App } from "../app/app";
import type { InternalAudioCtx } from "../audio/audio";
import { LOG_MAX } from "../constants/general";
import type { FrameRenderer } from "../core/frameRendering";
import type { Game } from "../game/game";
import type { AppGfxCtx } from "../gfx/gfxApp";
import { _k } from "../shared";
import type { KAPLAYOpt } from "../types";
import type { Recording } from "./record";

/**
 * Available debugging message styles.
 *
 * @group Debug
 */
type DebugLogStyle = "info" | "warn" | "error";

/**
 * Acceptable values for debugging message.
 *
 * @group Debug
 */
type DebugMessage = string | { toString(): string } | Error;

/**
 * @group Debug
 */
export type DebugLog = { msg: string; time: number; style: DebugLogStyle };

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
     * Current frames per second, that the game is running using
     * (may be limited by the `maxFPS` or `maxTimeStep` options)
     */
    fps(): number;
    /**
     * Raw frames per second from the browser unaffected by
     * the `maxFPS` or `maxTimeStep` options.
     */
    rawFPS(): number;
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
     * Log a message to the on-screen debug log, with optional
     * style wrapping.
     *
     * @param message - The messages to log
     * @param wrapStyle - Style to wrap all messages
     *
     * @example
     * ```
     * debug.logMessage(["oh", "hi"], "warn");
     * ```
     *
     * @since v4000.0
     */
    logMessage(message: DebugMessage[], wrapStyle?: DebugLogStyle): void;
    /**
     * Log a message with the info style (white) in the debugging screen.
     *
     * @param message - THe message to log
     *
     * @example
     * ```
     * debug.log("oh", "hi")
     * ```
     */
    log(...message: DebugMessage[]): void;
    /**
     * Log a message with the warn style (yellow) in the debugging screen.
     *
     * @param message - THe message to log
     *
     * @example
     * ```
     * debug.warn("oh", "humm")
     * ```
     *
     * @since v4000.0
     */
    warn(...message: DebugMessage[]): void;
    /**
     * Log a message with the error style (pink since kaboom) in the debugging screen.
     *
     * @param message - THe message to log
     *
     * @example
     * ```
     * debug.error("oh", "no")
     * ```
     */
    error(...message: DebugMessage[]): void;
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
    audio: InternalAudioCtx,
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
        rawFPS: () => app.rawFPS(),
        numFrames: () => app.numFrames(),
        stepFrame: fr.updateFrame,
        drawCalls: () => appGfx.lastDrawCalls,
        clearLog: () => game.logs = [],
        logMessage: (message, wrapStyle = "info") => {
            const max = gopt.logMax ?? LOG_MAX;
            const msg = message.join(" ");

            game.logs.unshift({
                msg: msg,
                time: app.time(),
                style: wrapStyle,
            });

            if (game.logs.length > max) {
                game.logs = game.logs.slice(0, max);
            }
        },
        log: (...message) => {
            debug.logMessage(message, "info");
        },
        warn: (...message) => {
            debug.logMessage(message, "warn");
        },
        error: (...message) => {
            const msg = message.concat().map((m) => m.toString());
            debug.logMessage(msg, "error");
        },
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

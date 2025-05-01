import type { App } from "../app/app";
import type { AudioCtx } from "../audio/audio";
import { LOG_MAX } from "../constants/general";
import type { Game } from "../game/game";
import type { AppGfxCtx } from "../gfx/gfxApp";
import { _k } from "../kaplay";
import type { Debug, KAPLAYOpt, Recording } from "../types";
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

// TODO: Move all to a debug folder maybe
export const record = (frameRate?: number): Recording => {
    const stream = _k.app.canvas.captureStream(frameRate);
    const audioDest = _k.audio.ctx.createMediaStreamDestination();

    _k.audio.masterNode.connect(audioDest);

    // TODO: Enabling audio results in empty video if no audio received
    // const audioStream = audioDest.stream
    // const [firstAudioTrack] = audioStream.getAudioTracks()

    // stream.addTrack(firstAudioTrack);

    const recorder = new MediaRecorder(stream);
    const chunks: any[] = [];

    recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            chunks.push(e.data);
        }
    };

    recorder.onerror = () => {
        _k.audio.masterNode.disconnect(audioDest);
        stream.getTracks().forEach(t => t.stop());
    };

    recorder.start();

    return {
        resume() {
            recorder.resume();
        },

        pause() {
            recorder.pause();
        },

        stop(): Promise<Blob> {
            recorder.stop();
            // cleanup
            _k.audio.masterNode.disconnect(audioDest);
            stream.getTracks().forEach(t => t.stop());
            return new Promise((resolve) => {
                recorder.onstop = () => {
                    resolve(
                        new Blob(chunks, {
                            type: "video/mp4",
                        }),
                    );
                };
            });
        },

        download(filename = "kaboom.mp4") {
            this.stop().then((blob) => _k.k.downloadBlob(filename, blob));
        },
    };
};

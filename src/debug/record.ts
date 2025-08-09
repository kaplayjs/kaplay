import { SoundData } from "../assets/sound";
import { play } from "../audio/play";
import { _k } from "../shared";
import { downloadBlob } from "../utils/dataURL";

/**
 * Screen recording control handle.
 *
 * @group Data
 */
export interface Recording {
    /**
     * Pause the recording.
     */
    pause(): void;
    /**
     * Resume the recording.
     */
    resume(): void;
    /**
     * Stop the recording and get the video data as a Blob. This
     * finalizes the recording, so trying to do anything else with it
     * later will throw an error.
     *
     * @since v3000.0
     */
    stop(): Promise<Blob>;
    /**
     * Stop the recording and downloads the file. Like `stop()`, this finalizes
     * the recording, and trying to do anything else with it later will throw
     * an error.
     *
     * @param filename - The suggested file name to initially present to the player
     * (they can always change it in their browser's save dialog). If none is specified
     * the format is 'kaplay-{current date and time}.{file extension}'.
     */
    download(filename?: string): void;
    /**
     * The currently used MIME type that was selected when the recording was
     * started.
     */
    readonly mimeType: string;
    /**
     * The recommended file extension for the output file, minus the dot. For
     * MP4 this will be `"mp4"`, for WEBM, `"webm"`, etc.
     *
     * This value is calculated using the MIME type and so it might be wrong.
     * For example if you're in Safari and manage to get a recording started using
     * the `video/quicktime` format, this property will report `"quicktime"`, even
     * though the correct file extension is `.mov`.
     */
    readonly fileExt: string;
}

// https://stackoverflow.com/a/57168358/23626926

const a = new AudioBuffer({ length: 1, sampleRate: 44100 });
a.getChannelData(0).set([.01], 0);
const dummy = new SoundData(a);

export const record = (frameRate?: number, mimeTypes?: string[]): Recording => {
    if (_k.debug.curRecording !== null) {
        throw new Error("Recording is already in progress.");
    }

    const options: MediaRecorderOptions = {};

    if (mimeTypes !== undefined) {
        const mimeType = mimeTypes.find(mime =>
            MediaRecorder.isTypeSupported(mime)
        );

        if (mimeType === undefined) {
            throw new Error(
                `None of the provided MIME types (${
                    mimeTypes.join(", ")
                }) are supported for recording${
                    mimeTypes.some(mime => /^video\//.test(mime))
                        ? ""
                        : " (hint: it must look like 'video/xxx')"
                }.`,
            );
        }

        options.mimeType = mimeType;
    }

    const audioDest = _k.audio.ctx.createMediaStreamDestination();
    // dummy to make audio work
    play(dummy);

    _k.audio.masterNode.connect(audioDest);

    const audioStream = audioDest.stream;
    const [firstAudioTrack] = audioStream.getAudioTracks();
    const canvasStream = _k.app.canvas.captureStream(frameRate);
    const [firstCanvasTrack] = canvasStream.getVideoTracks();

    const recorder = new MediaRecorder(
        new MediaStream([firstAudioTrack, firstCanvasTrack]),
        options,
    );
    const chunks: any[] = [];

    const defaultExt = /\/(.+?)(;|$)/.exec(recorder.mimeType)![1]!;
    recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            chunks.push(e.data);
        }
    };

    recorder.onerror = () => {
        _k.audio.masterNode.disconnect(audioDest);
        canvasStream.getTracks().forEach(t => t.stop());
    };

    recorder.start();

    var finalized = false;

    const checkFinalized = () => {
        if (finalized) {
            throw new Error(
                "Recording has been finalized, you must start a new recording",
            );
        }
    };

    const rec: Recording = {
        resume() {
            checkFinalized();
            recorder.resume();
        },

        pause() {
            checkFinalized();
            recorder.pause();
        },

        stop(): Promise<Blob> {
            checkFinalized();
            finalized = true;
            _k.debug.curRecording = null;
            recorder.stop();
            // cleanup
            _k.audio.masterNode.disconnect(audioDest);
            canvasStream.getTracks().forEach(t => t.stop());
            return new Promise((resolve) => {
                recorder.onstop = () => {
                    resolve(
                        new Blob(chunks, {
                            type: recorder.mimeType,
                        }),
                    );
                };
            });
        },

        get mimeType() {
            return recorder.mimeType;
        },

        get fileExt() {
            return defaultExt;
        },

        download(
            filename = `kaplay-${new Date().toISOString()}.${defaultExt}`,
        ) {
            this.stop().then((blob) => downloadBlob(filename, blob));
        },
    };

    _k.debug.curRecording = rec;

    return rec;
};

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
     * Stop the recording and get the video data as mp4 Blob.
     *
     * @since v3000.0
     */
    stop(): Promise<Blob>;
    /**
     * Stop the recording and downloads the file as mp4. Trying to resume later will lead to error.
     */
    download(filename?: string): void;
}

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
            this.stop().then((blob) => downloadBlob(filename, blob));
        },
    };
};

import { Asset } from "../assets/asset";
import { resolveSound, type SoundData } from "../assets/sound";
import { KEvent, type KEventController } from "../events/events";
import { _k } from "../shared";
import type { MusicData } from "../types";
import { playMusic } from "./playMusic";

// TODO: enable setting on load, make part of SoundData
/**
 * Audio play configurations.
 *
 * @group Audio
 */
export interface AudioPlayOpt {
    /**
     * If audio should start out paused.
     *
     * @since v3000.0
     */
    paused?: boolean;
    /**
     * If audio should be played again from start when its ended.
     */
    loop?: boolean;
    /**
     * Volume of audio. 1.0 means full volume, 0.5 means half volume.
     */
    volume?: number;
    /**
     * Playback speed. 1.0 means normal playback speed, 2.0 means twice as fast.
     */
    speed?: number;
    /**
     * Detune the sound. Every 100 means a semitone.
     *
     * @example
     * ```js
     * // play a random note in the octave
     * play("noteC", {
     *     detune: randi(0, 12) * 100,
     * })
     * ```
     */
    detune?: number;
    /**
     * Wheter to reverse the sound, so it plays from finish to start, this doesn't affect time().
     *
     * @since v4000.0
     */
    reverse?: boolean;
    /**
     * The start time, in seconds.
     */
    seek?: number;
    /**
     * The stereo pan of the sound.
     * -1.0 means fully from the left channel, 0.0 means centered, 1.0 means fully right.
     *
     * @default 0.0
     */
    pan?: number;
    /**
     * If the audio node should start out connected to another audio node rather than
     * KAPLAY's default volume node. Defaults to undefined, i.e. use KAPLAY's volume node.
     */
    connectTo?: AudioNode;
}

/**
 * @group Audio
 */
export interface AudioPlay {
    /**
     * Start playing audio.
     *
     * @since v3000.0
     */
    play(time?: number): void;
    /**
     * Seek time.
     *
     * @since v3000.0
     */
    seek(time: number): void;
    /**
     * Stop the sound.
     *
     * @since v3001.0
     */
    stop(): void;
    /**
     * If the sound is paused.
     *
     * @since v2000.1
     */
    paused: boolean;
    /**
     * Playback speed of the sound. 1.0 means normal playback speed, 2.0 means twice as fast.
     */
    speed: number;
    /**
     * Detune the sound. Every 100 means a semitone.
     *
     * @example
     * ```js
     * // tune down a semitone
     * music.detune = -100
     *
     * // tune up an octave
     * music.detune = 1200
     * ```
     */
    detune: number;
    /**
     * Volume of the sound. 1.0 means full volume, 0.5 means half volume.
     */
    volume: number;
    /**
     * The stereo pan of the sound.
     * -1.0 means fully from the left channel, 0.0 means centered, 1.0 means fully right.
     *
     * @default 0.0
     */
    pan?: number;
    /**
     * If the audio should start again when it ends.
     */
    loop: boolean;
    /**
     * The current playing time.
     */
    time(): number;
    /**
     * The total duration.
     */
    duration(): number;
    /**
     * Register an event that runs when audio ends.
     *
     * @since v3000.0
     */
    onEnd(action: () => void): KEventController;
    then(action: () => void): KEventController;
    /**
     * Disconnect the audio node from whatever it is currently connected to
     * and connect it to the passed-in audio node, or to Kaplay's default volume node
     * if no node is passed.
     */
    connect(node?: AudioNode): void;
}

export function play(
    src:
        | string
        | SoundData
        | Asset<SoundData>
        | MusicData
        | Asset<MusicData>,
    opt: AudioPlayOpt = {},
): AudioPlay {
    if (typeof src === "string" && _k.assets.music[src]) {
        return playMusic(_k.assets.music[src], opt);
    }

    const ctx = _k.audio.ctx;
    let paused = opt.paused ?? false;
    let srcNode = ctx.createBufferSource();
    const onEndEvents = new KEvent();
    const gainNode = ctx.createGain();
    const panNode = ctx.createStereoPanner();
    // Buffer position (in seconds) at the moment `anchorTime` was taken.
    // While playing, the position advances by the playback rate.
    let anchorPos = opt.seek ?? 0;
    let anchorTime = 0;
    let started = false;

    srcNode.loop = Boolean(opt.loop);
    srcNode.detune.value = opt.detune ?? 0;
    srcNode.playbackRate.value = opt.speed ?? 1;
    srcNode.connect(panNode);
    srcNode.onended = () => {
        if (
            getTime()
                >= (srcNode.buffer?.duration ?? Number.POSITIVE_INFINITY)
        ) {
            onEndEvents.trigger();
        }
    };
    panNode.pan.value = opt.pan ?? 0;
    panNode.connect(gainNode);
    gainNode.connect(opt.connectTo ?? _k.audio.masterNode);
    gainNode.gain.value = opt.volume ?? 1;

    const start = (data: SoundData) => {
        if (opt.reverse) {
            // Create a new empty buffer
            const reversedBuffer = ctx.createBuffer(
                data.buf.numberOfChannels,
                data.buf.length,
                data.buf.sampleRate,
            );

            // Loop through each channel and reverse the data
            for (let i = 0; i < data.buf.numberOfChannels; i++) {
                const originalData = data.buf.getChannelData(i);
                const reversedData = reversedBuffer.getChannelData(i);

                // Copy and reverse
                reversedData.set(originalData.toReversed());
            }

            srcNode.buffer = reversedBuffer;
        }
        else srcNode.buffer = data.buf;

        if (!paused) {
            anchorTime = ctx.currentTime;
            srcNode.start(0, anchorPos);
            started = true;
        }
    };

    const snd = resolveSound(
        // @ts-expect-error Resolve Type Error
        src,
    );

    if (snd instanceof Asset) {
        snd.onLoad(start);
    }

    const rate = () =>
        srcNode.playbackRate.value * Math.pow(2, srcNode.detune.value / 1200);

    const position = () =>
        started
            ? anchorPos + (ctx.currentTime - anchorTime) * rate()
            : anchorPos;

    const wrap = (t: number) => {
        const d = srcNode.buffer?.duration ?? 0;
        if (!d) return 0;
        return srcNode.loop ? t % d : Math.min(t, d);
    };

    const reanchor = () => {
        if (!started) return;
        anchorPos = wrap(position());
        anchorTime = ctx.currentTime;
    };

    const getTime = () => {
        if (!srcNode.buffer) return 0;
        return wrap(position());
    };

    const cloneNode = (oldNode: AudioBufferSourceNode) => {
        const newNode = ctx.createBufferSource();
        newNode.buffer = oldNode.buffer;
        newNode.loop = oldNode.loop;
        newNode.playbackRate.value = oldNode.playbackRate.value;
        newNode.detune.value = oldNode.detune.value;
        newNode.onended = oldNode.onended;
        newNode.connect(panNode);
        return newNode;
    };

    return {
        stop() {
            this.paused = true;
            this.seek(0);
        },

        set paused(p: boolean) {
            if (paused === p) return;
            paused = p;
            if (p) {
                if (started) {
                    reanchor();
                    srcNode.stop();
                    started = false;
                }
            }
            else {
                srcNode = cloneNode(srcNode);
                srcNode.start(0, anchorPos);
                started = true;
                anchorTime = ctx.currentTime;
            }
        },

        get paused() {
            return paused;
        },

        play(time: number = 0) {
            this.seek(time);
            this.paused = false;
        },

        seek(time: number) {
            if (!srcNode.buffer?.duration) return;
            if (time > srcNode.buffer.duration) return;
            anchorPos = time;
            anchorTime = ctx.currentTime;
            if (paused) {
                srcNode = cloneNode(srcNode);
            }
            else {
                srcNode.stop();
                srcNode = cloneNode(srcNode);
                srcNode.start(0, time);
                started = true;
            }
        },

        set speed(val: number) {
            reanchor();
            srcNode.playbackRate.value = val;
        },

        get speed() {
            return srcNode.playbackRate.value;
        },

        set detune(val: number) {
            reanchor();
            srcNode.detune.value = val;
        },

        get detune() {
            return srcNode.detune.value;
        },

        set volume(val: number) {
            gainNode.gain.value = Math.max(val, 0);
        },

        get volume() {
            return gainNode.gain.value;
        },

        set pan(pan: number) {
            panNode.pan.value = pan;
        },

        get pan() {
            return panNode.pan.value;
        },

        set loop(l: boolean) {
            srcNode.loop = l;
        },

        get loop() {
            return srcNode.loop;
        },

        duration(): number {
            return srcNode.buffer?.duration ?? 0;
        },

        time(): number {
            return getTime() % this.duration();
        },

        onEnd(action: () => void) {
            return onEndEvents.add(action);
        },

        then(action: () => void) {
            return this.onEnd(action);
        },

        connect(node?: AudioNode) {
            gainNode.disconnect();
            gainNode.connect(node ?? _k.audio.masterNode);
        },
    };
}

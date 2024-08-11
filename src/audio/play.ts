import { Asset, resolveSound, type SoundData } from "../assets";
import { assets, audio } from "../kaplay";
import type { MusicData } from "../types";
import { KEvent, type KEventController } from "../utils";
import { playMusic } from "./playMusic";

// TODO: enable setting on load, make part of SoundData
/**
 * Audio play configurations.
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
     * The start time, in seconds.
     */
    seek?: number;
    /**
     * The stereo pan of the sound.
     * -1.0 means fully from the left channel, 0.0 means centered, 1.0 means fully right.
     * Defaults to 0.0.
     */
    pan?: number;
}

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
     * Defaults to 0.0.
     */
    pan?: number;
    /**
     * If the audio should start again when it ends.
     */
    loop: boolean;
    /**
     * The current playing time (not accurate if speed is changed).
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
    if (typeof src === "string" && assets.music[src]) {
        return playMusic(assets.music[src], opt);
    }

    const ctx = audio.ctx;
    let paused = opt.paused ?? false;
    let srcNode = ctx.createBufferSource();
    const onEndEvents = new KEvent();
    const gainNode = ctx.createGain();
    const panNode = ctx.createStereoPanner();
    const pos = opt.seek ?? 0;
    let startTime = 0;
    let stopTime = 0;
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
    gainNode.connect(audio.masterNode);
    gainNode.gain.value = opt.volume ?? 1;

    const start = (data: SoundData) => {
        srcNode.buffer = data.buf;
        if (!paused) {
            startTime = ctx.currentTime;
            srcNode.start(0, pos);
            started = true;
        }
    };

    // @ts-ignore
    const snd = resolveSound(src);

    if (snd instanceof Asset) {
        snd.onLoad(start);
    }

    const getTime = () => {
        if (!srcNode.buffer) return 0;
        const t = paused
            ? stopTime - startTime
            : ctx.currentTime - startTime;
        const d = srcNode.buffer.duration;
        return srcNode.loop ? t % d : Math.min(t, d);
    };

    const cloneNode = (oldNode: AudioBufferSourceNode) => {
        const newNode = ctx.createBufferSource();
        newNode.buffer = oldNode.buffer;
        newNode.loop = oldNode.loop;
        newNode.playbackRate.value = oldNode.playbackRate.value;
        newNode.detune.value = oldNode.detune.value;
        newNode.onended = oldNode.onended;
        newNode.connect(gainNode);
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
                    srcNode.stop();
                    started = false;
                }
                stopTime = ctx.currentTime;
            }
            else {
                srcNode = cloneNode(srcNode);
                const pos = stopTime - startTime;
                srcNode.start(0, pos);
                started = true;
                startTime = ctx.currentTime - pos;
                stopTime = 0;
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
            if (paused) {
                srcNode = cloneNode(srcNode);
                startTime = stopTime - time;
            }
            else {
                srcNode.stop();
                srcNode = cloneNode(srcNode);
                startTime = ctx.currentTime - time;
                srcNode.start(0, time);
                started = true;
                stopTime = 0;
            }
        },

        // TODO: affect time()
        set speed(val: number) {
            srcNode.playbackRate.value = val;
        },

        get speed() {
            return srcNode.playbackRate.value;
        },

        set detune(val: number) {
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
    };
}

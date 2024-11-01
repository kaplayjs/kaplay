import { app, audio, debug, globalOpt } from "../kaplay";
import { clamp } from "../math/math";
import { KEvent } from "../utils";
import type { AudioPlay, AudioPlayOpt } from "./play";

export function playMusic(url: string, opt: AudioPlayOpt = {}): AudioPlay {
    const onEndEvents = new KEvent();
    const el = new Audio(url);
    el.crossOrigin = "anonymous";
    const src = audio.ctx.createMediaElementSource(el);

    src.connect(opt.connectTo ?? audio.masterNode);

    function resumeAudioCtx() {
        if (debug.paused) return;
        if (app.isHidden() && !globalOpt.backgroundAudio) return;
        audio.ctx.resume();
    }

    function play() {
        resumeAudioCtx();
        el.play();
    }

    if (!opt.paused) {
        play();
    }

    el.onended = () => onEndEvents.trigger();

    return {
        play() {
            play();
        },

        seek(time: number) {
            el.currentTime = time;
        },

        stop() {
            el.pause();
            this.seek(0);
        },

        set loop(l: boolean) {
            el.loop = l;
        },

        get loop() {
            return el.loop;
        },

        set paused(p: boolean) {
            if (p) {
                el.pause();
            }
            else {
                play();
            }
        },

        get paused() {
            return el.paused;
        },

        time() {
            return el.currentTime;
        },

        duration() {
            return el.duration;
        },

        set volume(val: number) {
            el.volume = clamp(val, 0, 1);
        },

        get volume() {
            return el.volume;
        },

        set speed(s) {
            el.playbackRate = Math.max(s, 0);
        },

        get speed() {
            return el.playbackRate;
        },

        set detune(d) {
            // TODO
        },

        get detune() {
            // TODO
            return 0;
        },

        onEnd(action: () => void) {
            return onEndEvents.add(action);
        },

        then(action: () => void) {
            return this.onEnd(action);
        },

        connect(node?: AudioNode) {
            src.disconnect();
            src.connect(node ?? audio.masterNode);
        },
    };
}

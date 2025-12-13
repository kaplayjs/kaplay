import { KEvent } from "../events/events";
import { clamp } from "../math/clamp";
import { _k } from "../shared";
import type { AudioPlay, AudioPlayOpt } from "./play";

export function playMusic(url: string, opt: AudioPlayOpt = {}): AudioPlay {
    const onEndEvents = new KEvent();
    const el = new Audio(url);
    el.crossOrigin = "anonymous";
    el.loop = Boolean(opt.loop);
    el.volume = opt.volume ?? 1;
    el.playbackRate = opt.speed ?? 1;

    const src = _k.audio.ctx.createMediaElementSource(el);

    src.connect(opt.connectTo ?? _k.audio.masterNode);

    function resumeAudioCtx() {
        if (_k.debug.paused) return;
        if (_k.app.isHidden() && !_k.globalOpt.backgroundAudio) return;
        _k.audio.ctx.resume();
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
            throw new Error(
                "Music cannot be detuned (limitation of the browser APIs, womp womp)",
            );
        },

        get detune() {
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
            src.connect(node ?? _k.audio.masterNode);
        },
    };
}

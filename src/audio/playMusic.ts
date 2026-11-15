import { KEvent } from "../events/events";
import { clamp } from "../math/clamp";
import { _k } from "../shared";
import {
    type AudioBus,
    createAudioRoute,
    initialAudioDestination,
} from "./audioBus";
import type { AudioPlay, AudioPlayOpt } from "./play";

export function playMusic(url: string, opt: AudioPlayOpt = {}): AudioPlay {
    const audio = _k.audio;
    const initial = initialAudioDestination(audio, opt);
    const onEndEvents = new KEvent();
    const el = new Audio(url);
    el.crossOrigin = "anonymous";
    el.loop = Boolean(opt.loop);
    el.volume = opt.volume ?? 1;
    el.playbackRate = opt.speed ?? 1;

    const src = _k.audio.ctx.createMediaElementSource(el);

    const route = createAudioRoute(audio, src, initial);

    function resumeAudioCtx() {
        if (_k.debug.paused) return;
        if (_k.app.isHidden() && !_k.globalOpt.backgroundAudio) return;
        _k.audio.ctx.resume();
    }

    let playbackAttempt = 0;

    function releaseRoute() {
        playbackAttempt++;
        route.deactivate();
    }

    function play() {
        resumeAudioCtx();
        const attempt = ++playbackAttempt;
        const pending = el.play();
        route.activate();
        pending.catch(() => {
            if (attempt === playbackAttempt) route.deactivate();
        });
    }

    if (!opt.paused) {
        play();
    }

    el.onerror = releaseRoute;
    el.onended = () => {
        releaseRoute();
        onEndEvents.trigger();
    };

    return {
        play() {
            play();
        },

        seek(time: number) {
            el.currentTime = time;
        },

        stop() {
            el.pause();
            releaseRoute();
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
                releaseRoute();
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

        connect(node?: AudioNode | AudioBus) {
            route.connect(node);
        },

        get bus() {
            return route.bus;
        },
    };
}

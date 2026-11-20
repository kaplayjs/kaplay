import { KEvent, KEventController } from "../events/events";
import { clamp } from "../math/clamp";
import { _k } from "../shared";

// TODO: enable setting on load
/**
 * Music play configurations.
 *
 * @group Audio
 */
export interface MusicPlayOpt {
    /**
     * If music should start out paused.
     */
    paused?: boolean;
    /**
     * If music should be played again from start when its ended.
     */
    loop?: boolean;
    /**
     * Volume of music. 1.0 means full volume, 0.5 means half volume.
     */
    volume?: number;
    /**
     * Wheter the music is muted or not. Doesn't affect volume.
     */
    muted?: boolean;
    /**
     * Playback speed. 1.0 means normal playback speed, 2.0 means twice as fast.
     */
    speed?: number;
    /**
     * Wheter changing speed should also change the pitch.
     *
     * @default true
     */
    preservesPitch?: boolean;
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
export interface MusicPlay {
    /**
     * Start playing.
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
     * Stop the music.
     */
    stop(): void;
    /**
     * If the music is paused.
     */
    paused: boolean;
    /**
     * Playback speed of the music. 1.0 means normal playback speed, 2.0 means twice as fast.
     */
    speed: number;
    /**
     * Wheter changing speed should also change the pitch.
     */
    preservesPitch: boolean;
    /**
     * Volume of the music. 1.0 means full volume, 0.5 means half volume.
     */
    volume: number;
    /**
     * Wheter the music is muted or not. Doesn't affect volume.
     */
    muted: boolean;
    /**
     * The stereo pan of the music.
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
     * Register an event that runs when the music ends ends.
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

export function playMusic(url: string, opt: MusicPlayOpt = {}): MusicPlay {
    const src = _k.assets.music[url];

    const onEndEvents = new KEvent();
    const el = new Audio(src);
    el.crossOrigin = "anonymous";
    el.loop = Boolean(opt.loop);
    el.volume = opt.volume ?? 1;
    el.playbackRate = opt.speed ?? 1;
    el.muted = opt.muted ?? false;
    el.preservesPitch = opt.preservesPitch ?? true;

    const srcNode = _k.audio.ctx.createMediaElementSource(el);

    srcNode.connect(opt.connectTo ?? _k.audio.masterNode);

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

        set muted(val: boolean) {
            el.muted = val;
        },

        get muted() {
            return el.muted;
        },

        set speed(s) {
            el.playbackRate = Math.max(s, 0);
        },

        get speed() {
            return el.playbackRate;
        },

        get preservesPitch() {
            return el.preservesPitch;
        },

        set preservesPitch(v: boolean) {
            el.preservesPitch = v;
        },

        onEnd(action: () => void) {
            return onEndEvents.add(action);
        },

        then(action: () => void) {
            return this.onEnd(action);
        },

        connect(node?: AudioNode) {
            srcNode.disconnect();
            srcNode.connect(node ?? _k.audio.masterNode);
        },
    };
}

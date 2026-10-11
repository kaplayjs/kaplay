import type { SoundData } from "../assets/sound";
import { _k } from "../shared";
import { type AudioPlay, type AudioPlayOpt, play } from "./play";

/**
 * Audio stream that allows the user to play, control and mix independent audio files simultaneously.
 */
export type AudioChannel = {
    /** Channel name, e.g. "sfx" or "sfx.player" */
    name: string;
    /** The AudioNode this channel's sounds are routed through. Pass this
     * into play()'s existing `connectTo` option. */
    node: GainNode;
    /** Instant volume, 0-1 */
    volume: number;
    /** Mute this channel (and everything routed through it) */
    mute: boolean;
    /** A ReadonlySet that contains all of the sounds on this channel, they get cleared when they end */
    readonly sounds: ReadonlySet<AudioPlay>;
    /** Pauses all sounds in the channel */
    pauseAll(): void;
    /** Stops and removes all the sounds in the channel */
    resumeAll(): void;
    /** Play a sound through this channel. Thin wrapper around the
     * existing global play(), with connectTo pre-filled to this
     * channel's node — no playback logic is duplicated here. */
    play(src: string | SoundData, opt?: AudioPlayOpt): AudioPlay;
};

export type AudioChannelOpt = {
    /**
     * Starting volume of channel. 1.0 means full volume, 0.5 means half volume.
     */
    volume?: number;
    /**
     * Get the underlying browser AudioContext.
     */
    ctx?: AudioContext;
    /*
     * The node the channel is connected to.
     */
    parentNode?: AudioNode;
};

export function createChannel(
    name: string,
    opt: AudioChannelOpt = {},
): AudioChannel {
    const ctx = opt.ctx ?? _k.audio.ctx;
    const parentNode = opt.parentNode ?? _k.audio.masterNode;
    const gainNode = ctx.createGain();
    gainNode.gain.value = opt.volume ?? 1;
    gainNode.connect(parentNode);

    let muted = false;
    let volumeBeforeMute = opt.volume ?? 1;
    const sounds = new Set<AudioPlay>();

    // have to do it on the gainNode so we don't have to manually work it with every sound
    // this goes to every operation we do regarding channels
    const channel: AudioChannel = {
        name,
        node: gainNode,

        get volume() {
            return muted ? volumeBeforeMute : gainNode.gain.value;
        },
        set volume(v: number) {
            volumeBeforeMute = v;
            if (!muted) gainNode.gain.setValueAtTime(v, ctx.currentTime);
        },

        get mute() {
            return muted;
        },
        set mute(v: boolean) {
            muted = v;
            const now = ctx.currentTime;
            const target = v ? 0 : volumeBeforeMute;
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(target, now + 0.015);
        },

        get sounds() {
            return sounds as ReadonlySet<AudioPlay>;
        },

        play(src: string | SoundData, opt: AudioPlayOpt = {}) {
            // creates an AudioPlay instance with the gainNode created by the channel
            const sound = play(src, { ...opt, connectTo: gainNode });
            sounds.add(sound);
            sound.onEnd(() => sounds.delete(sound));
            return sound;
        },

        stopAll() {
            // sound.stop() doesn't trigger end
            // they get removed from the set when end
            // we have to clear them manually
            for (const sound of [...sounds]) sound.stop();
            sounds.clear();
        },

        fadeTo(target: number, duration = 0.5) {
            const now = ctx.currentTime;
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(target, now + duration);
            volumeBeforeMute = target;
            muted = false;
        },

        pauseAll() {
            for (const sound of sounds) sound.paused = true;
        },

        resumeAll() {
            for (const sound of sounds) sound.paused = false;
        },
    } as AudioChannel;

    return channel;
}

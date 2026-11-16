import type { SoundData } from "../assets/sound";
import { _k } from "../shared";
import { type AudioPlay, type AudioPlayOpt, play } from "./play";

/**
 * Audio stream that allows the user to play, control and mix independent audio files simultaneously.
 *
 * @since v4000.0
 * @group Audio
 */
export type AudioChannel = {
    /** Channel name, e.g. "sfx" or "sfx.player" */
    name: string;
    /** The AudioNode this channel's sounds are routed through. Pass this
     * into play()'s existing `connectTo` option. */
    node: GainNode;
    /** Instant volume, 0-1. */
    volume: number;
    /** Mute this channel (and everything routed through it). */
    mute: boolean;
    /** A ReadonlySet that contains all of the sounds on this channel, they get cleared when they end. */
    readonly sounds: ReadonlySet<AudioPlay>;
    /** Pauses all sounds in the channel. */
    pauseAll(): void;
    /** Resumes all sounds in the channel. */
    resumeAll(): void;
    /**
     * Play a sound through this channel. Thin wrapper around the
     * existing global play(), with connectTo pre-filled to this
     * channel's node — no playback logic is duplicated here.
     *
     * @returns A control handle.
     */
    play(src: string | SoundData, opt?: AudioPlayOpt): AudioPlay;
    /**
     * Lowers the volume in a duration of time.
     *
     * @param newVolume - The new volume.
     * @param duration - How long it'll take to fade the volume.
     */
    fadeTo(newVolume: number, duration: number): void;
};

/**
 * Options for the {@link createChannel `createChannel()`} function.
 *
 * @group Components
 * @subgroup Component Types
 */
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

    let volume = opt.volume ?? 1;
    let muted = false;
    gainNode.gain.value = muted ? 0 : volume;
    const sounds = new Set<AudioPlay>();

    const applyGain = (duration = 0) => {
        const now = ctx.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(
            muted ? 0 : volume,
            now + duration,
        );
    };

    // have to do it on the gainNode so we don't have to manually work it with every sound
    // this goes to every operation we do regarding channels
    const channel: AudioChannel = {
        name,
        node: gainNode,

        get volume() {
            return volume;
        },
        set volume(v: number) {
            volume = Math.max(v, 0);
            applyGain();
        },

        get mute() {
            return muted;
        },
        set mute(v: boolean) {
            if (v == muted) return;
            muted = v;
            applyGain();
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

        fadeTo(newVolume: number, duration = 0.5) {
            volume = Math.max(newVolume, 0);
            applyGain(duration);
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

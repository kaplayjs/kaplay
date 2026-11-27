import type { SoundData } from "../assets/sound";
import { _k } from "../shared";
import { playSound, type SoundPlay, type SoundPlayOpt } from "./play";
import { type MusicPlay, type MusicPlayOpt, playMusic } from "./playMusic";

/**
 * Audio stream that allows the user to play, control and mix independent audio files simultaneously.
 *
 * @since v4000.0
 * @group Audio
 */
export type AudioChannel = {
    /**
     * Channel name, e.g. "sfx" or "sfx.player"
     */
    name: string;
    /** The AudioNode this channel's sounds are routed through. Pass this
     * into playSound()'s or playMusic()'s existing `connectTo` option. */
    node: GainNode;
    /**
     * Volume of audios in the channel. 1.0 means full volume, 0.5 means half volume.
     */
    volume: number;
    /** Mute this channel (and everything routed through it). */
    mute: boolean;
    /** A ReadonlySet that contains all of the audios on this channel, they get cleared when they end. */
    readonly audios: ReadonlySet<SoundPlay | MusicPlay>;
    /** Pauses all sounds in the channel. */
    pauseAll(): void;
    /** Resumes all sounds in the channel. */
    resumeAll(): void;
    /**
     *  Removes a specific audio from this channel.
     *  @param audio The audio to remove from this channel.
     */
    clearAudio(audio: SoundPlay | MusicPlay): void;
    /**
     * Removes all of the audios in this channel.
     */
    clearAll(): void;
    /** Runs `stop()` on all of the {@link SoundPlay `SoundPlay`} and {@link MusicPlay `MusicPlay`} */
    stopAll(): void;
    /**
     * Play sound through this channel. Thin wrapper around the
     * playSound, with connectTo pre-filled to this
     * channel's node — no playback logic is duplicated here.
     *
     * @returns A control handle.
     */
    playSound(
        src: string | SoundData,
        opt?: SoundPlayOpt & {
            /** Wheter the sound should get cleared from the AudioChannel when it ends. */
            clearOnEnd?: boolean;
        },
    ): SoundPlay;
    /**
     * Play music through this channel. Thin wrapper around the
     * playMusic, with connectTo pre-filled to this
     * channel's node — no playback logic is duplicated here.
     *
     * @returns A control handle.
     */
    playMusic(
        src: string,
        opt?: MusicPlayOpt & {
            /** Wheter the music should get cleared from the AudioChannel when it ends. */
            clearOnEnd?: boolean;
        },
    ): MusicPlay;
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
    const audios = new Set<SoundPlay | MusicPlay>();

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

        get audios() {
            return audios as ReadonlySet<SoundPlay | MusicPlay>;
        },

        playSound(src, opt = {}) {
            // creates an SoundPlay instance with the gainNode created by the channel
            const sound = playSound(src, { ...opt, connectTo: gainNode });
            audios.add(sound);
            return sound;
        },

        playMusic(url: string, opt: MusicPlayOpt = {}) {
            // creates an MusicPlay instance with the gainNode created by the channel
            const music = playMusic(url, { ...opt, connectTo: gainNode });
            audios.add(music);
            return music;
        },

        fadeTo(newVolume: number, duration = 0.5) {
            volume = Math.max(newVolume, 0);
            applyGain(duration);
        },

        clearAudio(audio: SoundPlay | MusicPlay) {
            audios.delete(audio);
        },

        clearAll() {
            for (const audio of [...audios]) audios.delete(audio);
        },

        stopAll() {
            for (const audio of [...audios]) audio.stop();
        },

        pauseAll() {
            for (const audio of audios) audio.paused = true;
        },

        resumeAll() {
            for (const audio of audios) audio.paused = false;
        },
    } as AudioChannel;

    return channel;
}

import { type AudioPlay, type AudioPlayOpt, play } from "../../../audio/play";
import { KEvent, type KEventController } from "../../../events/events";
import { center, height, width } from "../../../gfx/stack";
import { clamp } from "../../../math/clamp";
import type { Comp, GameObj } from "../../../types";
import type { PosComp } from "../transform/pos";

/**
 * Options for the {@link sound `sound()`} component.
 *
 * @group Components
 * @subgroup Component Options
 */
export interface SoundCompOpt {
    /**
     * Play automatically when added to game object.
     *
     * @default false
     */
    autoPlay?: boolean;
    /**
     * Loop when finished.
     *
     * @default false
     */
    loop?: boolean;
    /**
     * Base volume (0-1).
     *
     * @default 1
     */
    volume?: number;
    /**
     * Playback speed.
     *
     * @default 1
     */
    speed?: number;
    /**
     * Detune in cents.
     *
     * @default 0
     */
    detune?: number;
    /**
     * Enable spatial audio (pan based on screen x, volume based on distance from center).
     *
     * @default false
     */
    spatial?: boolean;
    /**
     * Max distance for volume falloff in spatial audio.
     * Defaults to half the screen diagonal.
     */
    maxDistance?: number;
    /**
     * Start paused.
     *
     * @default false
     */
    paused?: boolean;
}

/**
 * The {@link sound `sound()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface SoundComp extends Comp {
    /**
     * The sound source name.
     */
    readonly sound: string;
    /**
     * Play the sound from the start or from a specific time.
     *
     * @param time - The time to start playing from (in seconds).
     */
    playSound(time?: number): void;
    /**
     * Stop the sound.
     */
    stopSound(): void;
    /**
     * Pause the sound.
     */
    pauseSound(): void;
    /**
     * Resume the sound.
     */
    resumeSound(): void;
    /**
     * Whether the sound is paused.
     */
    soundPaused: boolean;
    /**
     * Base volume (0-1). This is the volume before spatial audio adjustments.
     */
    volume: number;
    /**
     * Playback speed.
     */
    soundSpeed: number;
    /**
     * Detune in cents.
     */
    soundDetune: number;
    /**
     * Whether the sound loops.
     */
    soundLoop: boolean;
    /**
     * Whether spatial audio is enabled.
     */
    spatial: boolean;
    /**
     * Get the current playback time.
     */
    soundTime(): number;
    /**
     * Get the total duration of the sound.
     */
    soundDuration(): number;
    /**
     * Seek to a specific time.
     *
     * @param time - The time to seek to (in seconds).
     */
    seekSound(time: number): void;
    /**
     * Register an event handler that runs when the sound ends.
     */
    onSoundEnd(action: () => void): KEventController;
    /**
     * Get the underlying AudioPlay instance.
     */
    getAudioPlay(): AudioPlay | null;
}

/**
 * Attach a sound to a game object with optional spatial audio.
 *
 * @param src - The sound source name (loaded via `loadSound`).
 * @param opt - Sound component options.
 *
 * @returns The sound component.
 * @group Components
 */
export function sound(src: string, opt: SoundCompOpt = {}): SoundComp {
    let audioPlay: AudioPlay | null = null;
    let baseVolume = opt.volume ?? 1;
    let spatialEnabled = opt.spatial ?? false;
    let maxDistance = opt.maxDistance;
    let isDestroyed = false;
    const onEndEvents = new KEvent();

    // Calculate default max distance (half screen diagonal)
    const getMaxDistance = (): number => {
        if (maxDistance !== undefined) return maxDistance;
        const w = width();
        const h = height();
        return Math.sqrt(w * w + h * h) / 2;
    };

    const updateSpatialAudio = (obj: GameObj<SoundComp & PosComp>) => {
        if (!audioPlay || !spatialEnabled) return;

        // Get the screen position of the object
        const screenPos = obj.screenPos;
        if (!screenPos) return;

        const c = center();
        const w = width();

        // Calculate pan: -1 (left) to 1 (right)
        const pan = clamp((screenPos.x - c.x) / (w / 2), -1, 1);

        // Calculate distance from center for volume falloff
        const dx = screenPos.x - c.x;
        const dy = screenPos.y - c.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = getMaxDistance();
        const volumeMultiplier = clamp(1 - distance / maxDist, 0, 1);

        // Apply spatial adjustments
        audioPlay.pan = pan;
        audioPlay.volume = baseVolume * volumeMultiplier;
    };

    return {
        id: "sound",

        get sound(): string {
            return src;
        },

        add(this: GameObj<SoundComp & PosComp>) {
            const playOpt: AudioPlayOpt = {
                loop: opt.loop ?? false,
                volume: baseVolume,
                speed: opt.speed ?? 1,
                detune: opt.detune ?? 0,
                paused: opt.paused ?? !opt.autoPlay,
            };

            audioPlay = play(src, playOpt);

            // Forward end events
            audioPlay.onEnd(() => {
                if (!isDestroyed) {
                    onEndEvents.trigger();
                }
            });

            // Apply initial spatial audio if enabled
            if (spatialEnabled && this.screenPos) {
                updateSpatialAudio(this);
            }
        },

        update(this: GameObj<SoundComp & PosComp>) {
            if (spatialEnabled && audioPlay && !audioPlay.paused) {
                updateSpatialAudio(this);
            }
        },

        destroy() {
            isDestroyed = true;
            if (audioPlay) {
                audioPlay.stop();
                audioPlay = null;
            }
        },

        playSound(time?: number) {
            if (audioPlay) {
                audioPlay.play(time);
            }
        },

        stopSound() {
            if (audioPlay) {
                audioPlay.stop();
            }
        },

        pauseSound() {
            if (audioPlay) {
                audioPlay.paused = true;
            }
        },

        resumeSound() {
            if (audioPlay) {
                audioPlay.paused = false;
            }
        },

        get soundPaused(): boolean {
            return audioPlay?.paused ?? true;
        },

        set soundPaused(p: boolean) {
            if (audioPlay) {
                audioPlay.paused = p;
            }
        },

        get volume(): number {
            return baseVolume;
        },

        set volume(v: number) {
            baseVolume = v;
            if (audioPlay && !spatialEnabled) {
                audioPlay.volume = v;
            }
        },

        get soundSpeed(): number {
            return audioPlay?.speed ?? 1;
        },

        set soundSpeed(s: number) {
            if (audioPlay) {
                audioPlay.speed = s;
            }
        },

        get soundDetune(): number {
            return audioPlay?.detune ?? 0;
        },

        set soundDetune(d: number) {
            if (audioPlay) {
                audioPlay.detune = d;
            }
        },

        get soundLoop(): boolean {
            return audioPlay?.loop ?? false;
        },

        set soundLoop(l: boolean) {
            if (audioPlay) {
                audioPlay.loop = l;
            }
        },

        get spatial(): boolean {
            return spatialEnabled;
        },

        set spatial(s: boolean) {
            spatialEnabled = s;
            if (!s && audioPlay) {
                // Reset to base volume and center pan when disabling spatial
                audioPlay.volume = baseVolume;
                audioPlay.pan = 0;
            }
        },

        soundTime(): number {
            return audioPlay?.time() ?? 0;
        },

        soundDuration(): number {
            return audioPlay?.duration() ?? 0;
        },

        seekSound(time: number) {
            if (audioPlay) {
                audioPlay.seek(time);
            }
        },

        onSoundEnd(action: () => void): KEventController {
            return onEndEvents.add(action);
        },

        getAudioPlay(): AudioPlay | null {
            return audioPlay;
        },

        inspect() {
            const paused = audioPlay?.paused ? " (paused)" : "";
            const spatial = spatialEnabled ? " [spatial]" : "";
            return `sound: "${src}"${paused}${spatial}`;
        },
    };
}

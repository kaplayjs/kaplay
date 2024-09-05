import { SoundData } from "../assets";
import burpSoundSrc from "../kassets/burp.mp3";

export type AudioCtx = ReturnType<typeof initAudio>;

export function createEmptyAudioBuffer(ctx: AudioContext) {
    return ctx.createBuffer(1, 1, 44100);
}

export const initAudio = () => {
    const audio = (() => {
        const ctx = new (
            window.AudioContext || (window as any).webkitAudioContext
        )() as AudioContext;

        const masterNode = ctx.createGain();
        masterNode.connect(ctx.destination);

        // by default browsers can only load audio async, we don't deal with that and just start with an empty audio buffer
        const burpSnd = new SoundData(createEmptyAudioBuffer(ctx));

        // load that burp sound
        ctx.decodeAudioData(burpSoundSrc.buffer.slice(0)).then((buf) => {
            burpSnd.buf = buf;
        }).catch((err) => {
            console.error("Failed to load burp: ", err);
        });

        return {
            ctx,
            masterNode,
            burpSnd,
        };
    })();

    return audio;
};

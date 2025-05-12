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

        return {
            ctx,
            masterNode,
        };
    })();

    return audio;
};

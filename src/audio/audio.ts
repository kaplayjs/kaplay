/** @ignore */
export interface InternalAudioCtx {
    ctx: AudioContext;
    masterNode: GainNode;
}

/** @ignore */
export function createEmptyAudioBuffer(ctx: AudioContext) {
    return ctx.createBuffer(1, 1, 44100);
}

/** @ignore */
export const initAudio = (): InternalAudioCtx => {
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

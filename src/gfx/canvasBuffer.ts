import { _k } from "../shared.js";
import type { Canvas } from "../types.js";
import { FrameBuffer } from "./FrameBuffer.js";
import { flush } from "./stack.js";

export const makeCanvas = (w: number, h: number): Canvas => {
    const fb = new FrameBuffer(_k.ggl, w, h);

    return {
        clear: () => fb.clear(),
        free: () => fb.free(),
        toDataURL: () => fb.toDataURL(),
        toImageData: () => fb.toImageData(),
        width: fb.width,
        height: fb.height,
        draw: (action: () => void) => {
            flush();
            fb.bind();
            action();
            flush();
            fb.unbind();
        },
        get fb() {
            return fb;
        },
    };
};

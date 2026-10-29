import { _k } from "../shared";
import type { Canvas, CanvasSizeSource } from "../types";
import { FrameBuffer } from "./FrameBuffer";
import { drawToFrameBuffer } from "./renderTarget";
import { flush, height, width } from "./stack";

function dimensions(w: number, h: number): [number, number] {
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
        throw new Error("Canvas dimensions must be finite and positive");
    }
    return [Math.ceil(w), Math.ceil(h)];
}

function sourceDimensions(source: CanvasSizeSource): [number, number] {
    return source === "screen"
        ? dimensions(width(), height())
        : dimensions(source.width, source.height);
}

export function makeCanvas(w: number, h: number): Canvas;
export function makeCanvas(source: CanvasSizeSource): Canvas;
export function makeCanvas(
    size: number | CanvasSizeSource,
    h?: number,
): Canvas {
    const ctx = _k.ggl;
    let source = typeof size === "number" ? undefined : size;
    const initial = typeof size === "number"
        ? dimensions(size, h!)
        : sourceDimensions(size);
    let fb = new FrameBuffer(ctx, ...initial);
    let freed = false;
    const cancelCleanup = ctx.onDestroy(() => canvas.free());

    function assertLive() {
        if (freed) throw new Error("Canvas has been freed");
    }

    function replace(w: number, h: number) {
        if (fb.width === w && fb.height === h) return;
        if (fb.isBound) throw new Error("Cannot resize an active canvas");
        // Submit draws still referring to the old texture before retiring it.
        flush();
        const next = new FrameBuffer(ctx, w, h);
        const previous = fb;
        fb = next;
        previous.free();
    }

    function syncSize() {
        assertLive();
        if (source !== undefined) replace(...sourceDimensions(source));
    }

    function draw(action: () => void) {
        syncSize();
        drawToFrameBuffer(fb, action);
    }

    const canvas: Canvas = {
        get width() {
            return fb.width;
        },
        get height() {
            return fb.height;
        },
        get fb() {
            return fb;
        },
        resize(w, h) {
            assertLive();
            const size = dimensions(w, h);
            replace(...size);
            source = undefined;
        },
        syncSize,
        draw,
        clear() {
            draw(() => {
                const gl = ctx.gl;
                const color = gl.getParameter(gl.COLOR_CLEAR_VALUE);
                gl.clearColor(0, 0, 0, 0);
                try {
                    fb.clear();
                } finally {
                    gl.clearColor(color[0], color[1], color[2], color[3]);
                }
            });
        },
        toImageData() {
            syncSize();
            flush();
            return fb.toImageData();
        },
        toDataURL() {
            syncSize();
            flush();
            return fb.toDataURL();
        },
        free() {
            if (freed) return;
            if (fb.isBound) throw new Error("Cannot free an active canvas");
            flush();
            freed = true;
            source = undefined;
            cancelCleanup();
            fb.free();
        },
    };
    return canvas;
}

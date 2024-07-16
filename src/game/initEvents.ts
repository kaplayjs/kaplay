import { burp } from "../audio";
import { FrameBuffer, updateViewport } from "../gfx";
import {
    app,
    audio,
    canvas,
    debug,
    gfx,
    globalOpt,
    gscale,
    pixelDensity,
} from "../kaplay";
import { clamp } from "../math/math";
import { toFixed } from "../utils";

export function initEvents() {
    app.onHide(() => {
        if (!globalOpt.backgroundAudio) {
            audio.ctx.suspend();
        }
    });

    app.onShow(() => {
        if (!globalOpt.backgroundAudio && !debug.paused) {
            audio.ctx.resume();
        }
    });

    app.onResize(() => {
        if (app.isFullscreen()) return;
        const fixedSize = globalOpt.width && globalOpt.height;
        if (fixedSize && !globalOpt.stretch && !globalOpt.letterbox) return;

        canvas.width = canvas.offsetWidth * pixelDensity;
        canvas.height = canvas.offsetHeight * pixelDensity;

        updateViewport();

        if (!fixedSize) {
            gfx.frameBuffer.free();
            gfx.frameBuffer = new FrameBuffer(
                gfx.ggl,
                gfx.ggl.gl.drawingBufferWidth,
                gfx.ggl.gl.drawingBufferHeight,
            );
            gfx.width = gfx.ggl.gl.drawingBufferWidth / pixelDensity / gscale;
            gfx.height = gfx.ggl.gl.drawingBufferHeight / pixelDensity / gscale;
        }
    });

    if (globalOpt.debug !== false) {
        app.onKeyPress(
            globalOpt.debugKey ?? "f1",
            () => debug.inspect = !debug.inspect,
        );
        app.onKeyPress("f2", () => debug.clearLog());
        app.onKeyPress("f8", () => debug.paused = !debug.paused);
        app.onKeyPress("f7", () => {
            debug.timeScale = toFixed(
                clamp(debug.timeScale - 0.2, 0, 2),
                1,
            );
        });
        app.onKeyPress("f9", () => {
            debug.timeScale = toFixed(
                clamp(debug.timeScale + 0.2, 0, 2),
                1,
            );
        });
        app.onKeyPress("f10", () => debug.stepFrame());
    }

    // burp mode initialization
    if (globalOpt.burp) {
        app.onKeyPress("b", () => burp());
    }
}

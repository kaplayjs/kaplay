import { _k } from "../shared";
import type { RenderTarget } from "../types";
import { beginPicture, endPicture, Picture } from "./draw/drawPicture";
import { FrameBuffer } from "./FrameBuffer";
import { flush } from "./stack";

// Each consumer remembers the storage it last rendered into, including consumers
// that have not been traversed since a shared canvas was resized.
const canvasBuffers = new WeakMap<RenderTarget, FrameBuffer>();

export function drawToFrameBuffer(fb: FrameBuffer, action: () => void) {
    const gl = fb.ctx.gl;
    const stencilEnabled = gl.isEnabled(gl.STENCIL_TEST);
    const stencil = stencilEnabled
        ? [
            gl.STENCIL_FUNC,
            gl.STENCIL_REF,
            gl.STENCIL_VALUE_MASK,
            gl.STENCIL_FAIL,
            gl.STENCIL_PASS_DEPTH_FAIL,
            gl.STENCIL_PASS_DEPTH_PASS,
        ]
            .map(parameter => gl.getParameter(parameter))
        : undefined;
    const renderer = _k.gfx.renderer;
    const picture = renderer.picture;
    flush();
    renderer.picture = null;
    gl.disable(gl.STENCIL_TEST);
    try {
        fb.draw(() => {
            try {
                action();
            } finally {
                flush();
            }
        });
    } finally {
        renderer.picture = picture;
        if (stencil) {
            gl.stencilFunc(stencil[0], stencil[1], stencil[2]);
            gl.stencilOp(stencil[3], stencil[4], stencil[5]);
            gl.enable(gl.STENCIL_TEST);
        }
        else {
            gl.disable(gl.STENCIL_TEST);
        }
    }
}

export function drawRenderTarget(
    target: RenderTarget | undefined,
    action: () => void,
) {
    const destination = target?.destination;
    const canvas = destination && !(destination instanceof FrameBuffer)
            && !(destination instanceof Picture)
        ? destination
        : undefined;

    if (canvas && target) {
        canvas.syncSize();
        if (canvasBuffers.get(target) !== canvas.fb) target.isFresh = false;
    }
    if (target?.refreshOnly && target.isFresh) return;

    if (canvas) {
        canvas.draw(action);
        canvasBuffers.set(target!, canvas.fb);
    }
    else if (destination instanceof FrameBuffer) {
        drawToFrameBuffer(destination, action);
    }
    else if (destination instanceof Picture) {
        flush();
        beginPicture(destination);
        try {
            action();
        } finally {
            try {
                flush();
            } finally {
                endPicture();
            }
        }
    }
    else {
        action();
    }

    // Failed draws must remain eligible for another refresh.
    if (target?.refreshOnly) target.isFresh = true;
}

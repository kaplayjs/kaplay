import { _k } from "../../shared";
import { flush } from "../stack";

let activeMask = 0;
let activeRef = 0;
let activeDepth = 0;

function stencilState(gl: WebGLRenderingContext) {
    return {
        enabled: gl.isEnabled(gl.STENCIL_TEST),
        func: gl.getParameter(gl.STENCIL_FUNC),
        ref: gl.getParameter(gl.STENCIL_REF),
        valueMask: gl.getParameter(gl.STENCIL_VALUE_MASK),
        writeMask: gl.getParameter(gl.STENCIL_WRITEMASK),
        fail: gl.getParameter(gl.STENCIL_FAIL),
        depthFail: gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL),
        depthPass: gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS),
        clearValue: gl.getParameter(gl.STENCIL_CLEAR_VALUE),
    };
}

function restoreStencilState(
    gl: WebGLRenderingContext,
    state: ReturnType<typeof stencilState>,
) {
    gl.stencilFunc(state.func, state.ref, state.valueMask);
    gl.stencilMask(state.writeMask);
    gl.stencilOp(state.fail, state.depthFail, state.depthPass);
    gl.clearStencil(state.clearValue);
    if (state.enabled) gl.enable(gl.STENCIL_TEST);
    else gl.disable(gl.STENCIL_TEST);
}

export function suspendStencil(): () => void {
    const gl = _k.gfx.ggl.gl;
    if (!gl.isEnabled(gl.STENCIL_TEST)) return () => {};

    const state = stencilState(gl);
    const mask = activeMask;
    const ref = activeRef;
    const depth = activeDepth;
    activeMask = 0;
    activeRef = 0;
    activeDepth = 0;
    gl.disable(gl.STENCIL_TEST);

    return () => {
        restoreStencilState(gl, state);
        activeMask = mask;
        activeRef = ref;
        activeDepth = depth;
    };
}

export function drawStenciled(
    content: () => void,
    mask: () => void,
    test: GLenum,
) {
    const gl = _k.gfx.ggl.gl;
    const state = stencilState(gl);
    const parentMask = activeMask;
    const parentRef = activeRef;
    const bitCount = gl.getParameter(gl.STENCIL_BITS) as number;
    const stencilMask = (1 << bitCount) - 1;
    const bit = 1 << activeDepth;
    if (bitCount === 0 || bit > stencilMask) {
        throw new Error("Mask nesting exceeds the available stencil buffer");
    }

    flush();
    gl.stencilMask(activeDepth === 0 ? stencilMask : bit);
    gl.clearStencil(0);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.enable(gl.STENCIL_TEST);
    const colorMask = gl.getParameter(gl.COLOR_WRITEMASK) as boolean[];
    const depthMask = gl.getParameter(gl.DEPTH_WRITEMASK) as boolean;
    let enteredContent = false;

    try {
        // Mask geometry updates only this level's bit and cannot draw pixels.
        gl.stencilFunc(gl.EQUAL, parentRef | bit, parentMask);
        gl.stencilMask(bit);
        gl.stencilOp(gl.KEEP, gl.REPLACE, gl.REPLACE);
        gl.colorMask(false, false, false, false);
        gl.depthMask(false);
        mask();
        flush();

        gl.colorMask(
            colorMask[0],
            colorMask[1],
            colorMask[2],
            colorMask[3],
        );
        gl.depthMask(depthMask);

        activeMask = parentMask | bit;
        activeRef = test === gl.NOTEQUAL ? parentRef : parentRef | bit;
        activeDepth++;
        enteredContent = true;
        gl.stencilFunc(gl.EQUAL, activeRef, activeMask);
        gl.stencilMask(0);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        content();
        flush();
    } finally {
        activeMask = parentMask;
        activeRef = parentRef;
        if (enteredContent) activeDepth--;
        gl.colorMask(
            colorMask[0],
            colorMask[1],
            colorMask[2],
            colorMask[3],
        );
        gl.depthMask(depthMask);
        restoreStencilState(gl, state);
    }
}

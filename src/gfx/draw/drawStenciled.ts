import { gfx } from "../../kaplay";
import { flush } from "../stack";

export function drawStenciled(
    content: () => void,
    mask: () => void,
    test: number,
) {
    const gl = gfx.ggl.gl;

    flush();
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.enable(gl.STENCIL_TEST);

    // don't perform test, pure write
    gl.stencilFunc(
        gl.NEVER,
        1,
        0xFF,
    );

    // always replace since we're writing to the buffer
    gl.stencilOp(
        gl.REPLACE,
        gl.REPLACE,
        gl.REPLACE,
    );

    mask();
    flush();

    // perform test
    gl.stencilFunc(
        test,
        1,
        0xFF,
    );

    // don't write since we're only testing
    gl.stencilOp(
        gl.KEEP,
        gl.KEEP,
        gl.KEEP,
    );

    content();
    flush();
    gl.disable(gl.STENCIL_TEST);
}

import { gfx } from "../../kaplay";
import { drawStenciled } from "./drawStenciled";

export function drawMasked(content: () => void, mask: () => void) {
    const gl = gfx.ggl.gl;

    drawStenciled(content, mask, gl.EQUAL);
}

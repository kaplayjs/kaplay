import { _k } from "../../kaplay";
import { drawStenciled } from "./drawStenciled";

export function drawMasked(content: () => void, mask: () => void) {
    const gl = _k.gfx.ggl.gl;

    drawStenciled(content, mask, gl.EQUAL);
}

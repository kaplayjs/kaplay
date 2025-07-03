import { _k } from "../../shared.js";
import { drawStenciled } from "./drawStenciled.js";

export function drawMasked(content: () => void, mask: () => void) {
    const gl = _k.gfx.ggl.gl;

    drawStenciled(content, mask, gl.EQUAL);
}

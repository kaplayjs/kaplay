import { _k } from "../../shared.js";
import { drawStenciled } from "./drawStenciled.js";

export function drawSubtracted(content: () => void, mask: () => void) {
    const gl = _k.gfx.ggl.gl;

    drawStenciled(content, mask, gl.NOTEQUAL);
}

import { _k } from "../../shared";
import { drawStenciled } from "./drawStenciled";

export function drawSubtracted(content: () => void, mask: () => void) {
    const gl = _k.gfx.ggl.gl;

    drawStenciled(content, mask, gl.NOTEQUAL);
}

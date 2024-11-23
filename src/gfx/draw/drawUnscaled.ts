import { _k } from "../../kaplay";
import { flush } from "../stack";

export function drawUnscaled(content: () => void) {
    flush();
    const ow = _k.gfx.width;
    const oh = _k.gfx.height;
    _k.gfx.width = _k.gfx.viewport.width;
    _k.gfx.height = _k.gfx.viewport.height;
    content();
    flush();
    _k.gfx.width = ow;
    _k.gfx.height = oh;
}

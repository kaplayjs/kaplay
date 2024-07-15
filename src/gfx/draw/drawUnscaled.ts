import { gfx } from "../../kaplay";
import { flush } from "../stack";

export function drawUnscaled(content: () => void) {
    flush();
    const ow = gfx.width;
    const oh = gfx.height;
    gfx.width = gfx.viewport.width;
    gfx.height = gfx.viewport.height;
    content();
    flush();
    gfx.width = ow;
    gfx.height = oh;
}

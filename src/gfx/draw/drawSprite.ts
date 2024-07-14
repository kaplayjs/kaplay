import { resolveSprite } from "../../assets/sprite";
import type { DrawSpriteOpt } from "../../kaboom";
import { Quad } from "../../math";
import { drawTexture } from "./drawTexture";

export function drawSprite(opt: DrawSpriteOpt) {
    if (!opt.sprite) {
        throw new Error("drawSprite() requires property \"sprite\"");
    }

    // TODO: slow
    const spr = resolveSprite(opt.sprite);

    if (!spr || !spr.data) {
        return;
    }

    const q = spr.data.frames[opt.frame ?? 0];

    if (!q) {
        throw new Error(`Frame not found: ${opt.frame ?? 0}`);
    }

    drawTexture(Object.assign({}, opt, {
        tex: spr.data.tex,
        quad: q.scale(opt.quad ?? new Quad(0, 0, 1, 1)),
    }));
}

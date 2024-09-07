import { type Asset, resolveSprite, type SpriteData } from "../../assets";
import { Quad, type Vec2 } from "../../math";
import type { Anchor, RenderProps } from "../../types";
import { drawTexture } from "./drawTexture";

/**
 * How the sprite should look like.
 */
export type DrawSpriteOpt = RenderProps & {
    /**
     * The sprite name in the asset manager, or the raw sprite data.
     */
    sprite: string | SpriteData | Asset<SpriteData>;
    /**
     * If the sprite is loaded with multiple frames, or sliced, use the frame option to specify which frame to draw.
     */
    frame?: number;
    /**
     * Width of sprite. If `height` is not specified it'll stretch with aspect ratio. If `tiled` is set to true it'll tiled to the specified width horizontally.
     */
    width?: number;
    /**
     * Height of sprite. If `width` is not specified it'll stretch with aspect ratio. If `tiled` is set to true it'll tiled to the specified width vertically.
     */
    height?: number;
    /**
     * When set to true, `width` and `height` will not scale the sprite but instead render multiple tiled copies of them until the specified width and height. Useful for background texture pattern etc.
     */
    tiled?: boolean;
    /**
     * If flip the texture horizontally.
     */
    flipX?: boolean;
    /**
     * If flip the texture vertically.
     */
    flipY?: boolean;
    /**
     * The sub-area to render from the texture, by default it'll render the whole `quad(0, 0, 1, 1)`
     */
    quad?: Quad;
    /**
     * The anchor point, or the pivot point. Default to "topleft".
     */
    anchor?: Anchor | Vec2;
    /**
     * The position
     */
    pos?: Vec2;
};

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

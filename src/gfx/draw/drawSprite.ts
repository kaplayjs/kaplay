import type { Asset } from "../../assets/asset";
import { resolveSprite, type SpriteData } from "../../assets/sprite";
import { DEF_ANCHOR } from "../../constants/general";
import { Quad, quad } from "../../math/math";
import { Vec2 } from "../../math/Vec2";
import type { Anchor, RenderProps } from "../../types";
import { anchorPt } from "../anchor";
import { drawTexture } from "./drawTexture";

/**
 * How the sprite should look like.
 *
 * @group Draw
 * @subgroup Types
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

    const spriteData = spr.data;
    const q = spriteData.frames[opt.frame ?? 0];

    if (!q) {
        throw new Error(`Frame not found: ${opt.frame ?? 0}`);
    }

    const width = opt.width ?? spriteData.width;
    const height = opt.height ?? spriteData.height;

    if (spriteData.slice9) {
        // TODO: tile
        // TODO: use scale or width / height, or both?
        const { left, right, top, bottom } = spriteData.slice9;
        const tw = spriteData.tex.width * q.w;
        const th = spriteData.tex.height * q.h;
        const iw = width - left - right;
        const ih = height - top - bottom;
        const w1 = left / tw;
        const w3 = right / tw;
        const w2 = 1 - w1 - w3;
        const h1 = top / th;
        const h3 = bottom / th;
        const h2 = 1 - h1 - h3;
        const quads = [
            // uv
            quad(0, 0, w1, h1),
            quad(w1, 0, w2, h1),
            quad(w1 + w2, 0, w3, h1),
            quad(0, h1, w1, h2),
            quad(w1, h1, w2, h2),
            quad(w1 + w2, h1, w3, h2),
            quad(0, h1 + h2, w1, h3),
            quad(w1, h1 + h2, w2, h3),
            quad(w1 + w2, h1 + h2, w3, h3),
            // transform
            quad(0, 0, left, top),
            quad(left, 0, iw, top),
            quad(left + iw, 0, right, top),
            quad(0, top, left, ih),
            quad(left, top, iw, ih),
            quad(left + iw, top, right, ih),
            quad(0, top + ih, left, bottom),
            quad(left, top + ih, iw, bottom),
            quad(left + iw, top + ih, right, bottom),
        ];
        const props = opt;
        const offset = anchorPt(props.anchor || DEF_ANCHOR);
        const offsetX = -(offset.x + 1) * 0.5 * width + (opt.pos?.x ?? 0);
        const offsetY = -(offset.y + 1) * 0.5 * height + (opt.pos?.y ?? 0);
        for (let i = 0; i < 9; i++) {
            const uv = quads[i];
            const transform = quads[i + 9];
            if (transform.w == 0 || transform.h == 0) {
                continue;
            }
            drawTexture(
                Object.assign(props, {
                    pos: transform.pos().add(offsetX, offsetY),
                    anchor: "topleft",
                    tex: spriteData.tex,
                    quad: q.scale(uv),
                    flipX: opt.flipX,
                    flipY: opt.flipY,
                    tiled: opt.tiled,
                    width: transform.w,
                    height: transform.h,
                }),
            );
        }
    }
    else {
        drawTexture(
            Object.assign(opt, {
                tex: spriteData.tex,
                quad: q.scale(opt.quad ?? new Quad(0, 0, 1, 1)),
                width: width,
                height: height,
            }),
        );
    }

    /*drawTexture(Object.assign({}, opt, {
        tex: spr.data.tex,
        quad: q.scale(opt.quad ?? new Quad(0, 0, 1, 1)),
    }));*/
}

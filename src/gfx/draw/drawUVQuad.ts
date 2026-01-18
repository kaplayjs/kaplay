import { DEF_ANCHOR } from "../../constants/general";
import { Color } from "../../math/color";
import { Quad } from "../../math/math";
import { Vec2 } from "../../math/Vec2";
import { type Anchor, BlendMode, type RenderProps } from "../../types";
import { anchorPt } from "../anchor";
import type { Texture } from "../gfx";
import {
    multRotate,
    multScaleV,
    multSkewV,
    multTranslate,
    multTranslateV,
    popTransform,
    pushTransform,
} from "../stack";
import { drawRaw } from "./drawRaw";

/**
 * How the UV Quad should look like.
 *
 * @group Draw
 * @subgroup Types
 */
export type DrawUVQuadOpt = RenderProps & {
    /**
     * Width of the UV quad.
     */
    width: number;
    /**
     * Height of the UV quad.
     */
    height: number;
    /**
     * If flip the texture horizontally.
     */
    flipX?: boolean;
    /**
     * If flip the texture vertically.
     */
    flipY?: boolean;
    /**
     * The texture to sample for this quad.
     */
    tex?: Texture;
    /**
     * The texture sampling area.
     */
    quad?: Quad;
    /**
     * The anchor point, or the pivot point. Default to "topleft".
     */
    anchor?: Anchor | Vec2;
};

export function drawUVQuad(opt: DrawUVQuadOpt) {
    if (opt.width === undefined || opt.height === undefined) {
        throw new Error(
            "drawUVQuad() requires property \"width\" and \"height\".",
        );
    }

    if (opt.width <= 0 || opt.height <= 0) {
        return;
    }

    const w = opt.width;
    const h = opt.height;
    const anchor = anchorPt(opt.anchor || DEF_ANCHOR);
    const offsetX = anchor.x * w * -0.5;
    const offsetY = anchor.y * h * -0.5;
    const q = opt.quad || new Quad(0, 0, 1, 1);
    const color = opt.color || Color.WHITE;
    const opacity = opt.opacity ?? 1;

    pushTransform();
    multTranslateV(opt.pos);
    multRotate(opt.angle);
    multScaleV(opt.scale);
    multSkewV(opt.skew);
    multTranslate(offsetX, offsetY);

    drawRaw(
        {
            pos: [
                -w / 2,
                h / 2,
                -w / 2,
                -h / 2,
                w / 2,
                -h / 2,
                w / 2,
                h / 2,
            ],
            uv: [
                opt.flipX ? q.x + q.w : q.x,
                opt.flipY ? q.y : q.y + q.h,
                opt.flipX ? q.x + q.w : q.x,
                opt.flipY ? q.y + q.h : q.y,
                opt.flipX ? q.x : q.x + q.w,
                opt.flipY ? q.y + q.h : q.y,
                opt.flipX ? q.x : q.x + q.w,
                opt.flipY ? q.y : q.y + q.h,
            ],
            color: [
                color.r,
                color.g,
                color.b,
                color.r,
                color.g,
                color.b,
                color.r,
                color.g,
                color.b,
                color.r,
                color.g,
                color.b,
            ],
            opacity: [
                opacity,
                opacity,
                opacity,
                opacity,
            ],
        },
        [0, 1, 3, 1, 2, 3],
        opt.fixed,
        opt.tex,
        opt.shader,
        opt.uniform ?? undefined,
        opt.blend ?? BlendMode.Normal,
    );

    popTransform();
}

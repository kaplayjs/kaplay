import { DEF_ANCHOR } from "../../constants";
import { Color } from "../../math/color";
import { Quad, Vec2 } from "../../math/math";
import type { DrawTextureOpt, Vertex } from "../../types";
import { anchorPt } from "../anchor";
import { drawRaw } from "./drawRaw";
import { drawUVQuad } from "./drawUVQuad";

export function drawTexture(opt: DrawTextureOpt) {
    if (!opt.tex) {
        throw new Error("drawTexture() requires property \"tex\".");
    }

    const q = opt.quad ?? new Quad(0, 0, 1, 1);
    const w = opt.tex.width * q.w;
    const h = opt.tex.height * q.h;
    const scale = new Vec2(1);

    if (opt.tiled) {
        const anchor = anchorPt(opt.anchor || DEF_ANCHOR).add(
            new Vec2(1, 1),
        ).scale(0.5);
        const offset = anchor.scale(opt.width || w, opt.height || h);

        const fcols = (opt.width || w) / w;
        const frows = (opt.height || h) / h;
        const cols = Math.floor(fcols);
        const rows = Math.floor(frows);
        const fracX = fcols - cols;
        const fracY = frows - rows;
        const n = (cols + fracX ? 1 : 0) * (rows + fracY ? 1 : 0);
        const indices = new Array<number>(n * 6);
        const vertices = new Array<Vertex>(n * 4);
        let index = 0;

        /*drawUVQuad(Object.assign({}, opt, {
            scale: scale.scale(opt.scale || new Vec2(1)),
        }));*/

        const addQuad = (
            x: number,
            y: number,
            w: number,
            h: number,
            q: Quad,
        ) => {
            indices[index * 6 + 0] = index * 4 + 0;
            indices[index * 6 + 1] = index * 4 + 1;
            indices[index * 6 + 2] = index * 4 + 3;
            indices[index * 6 + 3] = index * 4 + 1;
            indices[index * 6 + 4] = index * 4 + 2;
            indices[index * 6 + 5] = index * 4 + 3;

            vertices[index * 4 + 0] = {
                pos: new Vec2(x - offset.x, y - offset.y),
                uv: new Vec2(q.x, q.y),
                color: opt.color || Color.WHITE,
                opacity: opt.opacity || 1,
            };
            vertices[index * 4 + 1] = {
                pos: new Vec2(x + w - offset.x, y - offset.y),
                uv: new Vec2(q.x + q.w, q.y),
                color: opt.color || Color.WHITE,
                opacity: opt.opacity || 1,
            };
            vertices[index * 4 + 2] = {
                pos: new Vec2(x + w - offset.x, y + h - offset.y),
                uv: new Vec2(q.x + q.w, q.y + q.h),
                color: opt.color || Color.WHITE,
                opacity: opt.opacity || 1,
            };
            vertices[index * 4 + 3] = {
                pos: new Vec2(x - offset.x, y + h - offset.y),
                uv: new Vec2(q.x, q.y + q.h),
                color: opt.color || Color.WHITE,
                opacity: opt.opacity || 1,
            };
            index++;
        };

        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                addQuad(i * w, j * h, w, h, q);
            }

            if (fracX) {
                addQuad(
                    cols * w,
                    j * h,
                    w * fracX,
                    h,
                    new Quad(q.x, q.y, q.w * fracX, q.h),
                );
            }
        }

        if (fracY) {
            for (let i = 0; i < cols; i++) {
                addQuad(
                    i * w,
                    rows * h,
                    w,
                    h * fracY,
                    new Quad(q.x, q.y, q.w, q.h * fracY),
                );
            }

            if (fracX) {
                addQuad(
                    cols * w,
                    rows * h,
                    w * fracX,
                    h * fracY,
                    new Quad(q.x, q.y, q.w * fracX, q.h * fracY),
                );
            }
        }

        drawRaw(
            vertices,
            indices,
            opt.fixed,
            opt.tex,
            opt.shader,
            opt.uniform ?? undefined,
        );
    }
    else {
        // TODO: should this ignore scale?
        if (opt.width && opt.height) {
            scale.x = opt.width / w;
            scale.y = opt.height / h;
        }
        else if (opt.width) {
            scale.x = opt.width / w;
            scale.y = scale.x;
        }
        else if (opt.height) {
            scale.y = opt.height / h;
            scale.x = scale.y;
        }

        drawUVQuad(Object.assign({}, opt, {
            scale: scale.scale(opt.scale || new Vec2(1)),
            tex: opt.tex,
            quad: q,
            width: w,
            height: h,
        }));
    }
}

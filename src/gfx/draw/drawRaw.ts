import { Asset, resolveShader, type Uniform } from "../../assets";
import { game, gfx } from "../../kaplay";
import { Vec2, vec2 } from "../../math/math";
import { screen2ndc } from "../../math/various";
import type { Attributes, RenderProps } from "../../types";
import type { Texture } from "../gfx";
import { height, width } from "../stack";

const scratchPt = new Vec2();

export function drawRaw(
    attributes: Attributes,
    indices: number[],
    fixed: boolean = false,
    tex?: Texture,
    shaderSrc?: RenderProps["shader"],
    uniform?: Uniform,
) {
    const parsedTex = tex ?? gfx.defTex;
    const parsedShader = shaderSrc ?? gfx.defShader;
    const shader = resolveShader(parsedShader);

    if (!shader || shader instanceof Asset) {
        return;
    }

    const transform = (gfx.fixed || fixed)
        ? gfx.transform
        : game.cam.transform.mul(gfx.transform);

    const vertLength = attributes.pos.length / 2;
    const vv: number[] = new Array(vertLength * 8);

    const w = width();
    const h = height();
    let index = 0;
    for (let i = 0; i < vertLength; i++) {
        scratchPt.x = attributes.pos[i * 2];
        scratchPt.y = attributes.pos[i * 2 + 1];
        // normalized world space coordinate [-1.0 ~ 1.0]
        screen2ndc(
            transform.transformPoint(scratchPt, scratchPt),
            w,
            h,
            scratchPt,
        );

        vv[index++] = scratchPt.x;
        vv[index++] = scratchPt.y;
        vv[index++] = attributes.uv[i * 2];
        vv[index++] = attributes.uv[i * 2 + 1];
        vv[index++] = attributes.color[i * 3] / 255;
        vv[index++] = attributes.color[i * 3 + 1] / 255;
        vv[index++] = attributes.color[i * 3 + 2] / 255;
        vv[index++] = attributes.opacity[i];
    }

    gfx.renderer.push(
        gfx.ggl.gl.TRIANGLES,
        vv,
        indices,
        shader,
        parsedTex,
        uniform,
    );
}

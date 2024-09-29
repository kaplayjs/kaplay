import { Asset, resolveShader, type Uniform } from "../../assets";
import { game, gfx } from "../../kaplay";
import { Vec2, vec2 } from "../../math/math";
import { screen2ndc } from "../../math/various";
import type { RenderProps, Vertex } from "../../types";
import type { Texture } from "../gfx";
import { height, width } from "../stack";

export function drawRaw(
    verts: Vertex[],
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

    const vv: number[] = new Array(verts.length * 8);

    const pt = new Vec2();
    const w = width();
    const h = height();
    let index = 0;
    for (let i = 0; i < verts.length; i++) {
        const v = verts[i];
        // normalized world space coordinate [-1.0 ~ 1.0]
        screen2ndc(transform.transformPoint(verts[i].pos, pt), w, h, pt);

        vv[index++] = pt.x;
        vv[index++] = pt.y;
        vv[index++] = v.uv.x;
        vv[index++] = v.uv.y;
        vv[index++] = v.color.r / 255;
        vv[index++] = v.color.g / 255;
        vv[index++] = v.color.b / 255;
        vv[index++] = v.opacity;
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

import { Asset, resolveShader, type Uniform } from "../../assets";
import { _k } from "../../kaplay";
import { screen2ndc } from "../../math/various";
import type { RenderProps, Vertex } from "../../types";
import type { Texture } from "../gfx";

export function drawRaw(
    verts: Vertex[],
    indices: number[],
    fixed: boolean = false,
    tex?: Texture,
    shaderSrc?: RenderProps["shader"],
    uniform: Uniform = {},
) {
    const parsedTex = tex ?? _k.gfx.defTex;
    const parsedShader = shaderSrc ?? _k.gfx.defShader;
    const shader = resolveShader(parsedShader);

    if (!shader || shader instanceof Asset) {
        return;
    }

    const transform = (_k.gfx.fixed || fixed)
        ? _k.gfx.transform
        : _k.game.cam.transform.mult(_k.gfx.transform);

    const vv: number[] = [];

    for (const v of verts) {
        // normalized world space coordinate [-1.0 ~ 1.0]
        const pt = screen2ndc(transform.multVec2(v.pos));

        vv.push(
            pt.x,
            pt.y,
            v.uv.x,
            v.uv.y,
            v.color.r / 255,
            v.color.g / 255,
            v.color.b / 255,
            v.opacity,
        );
    }

    _k.gfx.renderer.push(
        _k.gfx.ggl.gl.TRIANGLES,
        vv,
        indices,
        shader,
        parsedTex,
        uniform,
    );
}

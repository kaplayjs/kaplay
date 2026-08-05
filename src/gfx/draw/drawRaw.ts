import { Asset } from "../../assets/asset";
import { resolveShader, type Uniform } from "../../assets/shader";
import { _k } from "../../shared";
import { type Attributes, BlendMode, type RenderProps } from "../../types";
import type { Texture } from "../gfx";
import { height, width } from "../stack";

export function drawRaw(
    attributes: Attributes,
    indices: number[],
    fixed: boolean = false,
    tex?: Texture,
    shaderSrc?: RenderProps["shader"],
    uniform?: Uniform,
    blend?: BlendMode,
) {
    const parsedTex = tex ?? _k.gfx.whitePixel.tex;
    const parsedShader = shaderSrc ?? _k.gfx.defShader;
    const shader = resolveShader(parsedShader);

    if (!shader || shader instanceof Asset) {
        return;
    }

    const transform = _k.gfx.transform;

    const vertLength = attributes.pos.length / 2;
    const vv: number[] = new Array(vertLength * 8);

    let index = 0;
    for (let i = 0; i < vertLength; i++) {
        _k.gfx.scratchPt.x = attributes.pos[i * 2];
        _k.gfx.scratchPt.y = attributes.pos[i * 2 + 1];
        transform.transformPointV(_k.gfx.scratchPt, _k.gfx.scratchPt);

        vv[index++] = _k.gfx.scratchPt.x;
        vv[index++] = _k.gfx.scratchPt.y;
        vv[index++] = attributes.uv[i * 2];
        vv[index++] = attributes.uv[i * 2 + 1];
        vv[index++] = attributes.color[i * 3] / 255;
        vv[index++] = attributes.color[i * 3 + 1] / 255;
        vv[index++] = attributes.color[i * 3 + 2] / 255;
        vv[index++] = attributes.opacity[i];
    }

    _k.gfx.renderer.push(
        _k.gfx.ggl.gl.TRIANGLES,
        vv,
        indices,
        shader,
        parsedTex,
        uniform,
        blend ?? BlendMode.Normal,
        width(),
        height(),
        _k.gfx.fixed || fixed,
    );
}

import { Asset } from "../../assets/asset";
import { resolveShader } from "../../assets/shader";
import { IDENTITY_MATRIX } from "../../constants/math";
import { getCamTransform } from "../../game/camera";
import { _k } from "../../shared";
import type { Mesh, RenderProps } from "../../types";
import type { Texture } from "../gfx";
import { height, width } from "../stack";

/**
 * @group Draw
 * @subgroup Types
 */
export type DrawMeshOpt =
    & Omit<RenderProps, "outline" | "color" | "opacity" | "blend">
    & {
        mesh: Mesh;
        primitive?: GLenum;
        index?: number;
        count?: number;
        texture?: Texture;
    };

export function drawMesh(opt: DrawMeshOpt) {
    const ctx = _k.ggl;
    const gl = ctx.gl;
    const shader = (opt.shader ? resolveShader(opt.shader) : undefined)
        || _k.gfx.defShader;
    const texture = opt.texture ?? _k.gfx.whitePixel.tex;

    if (!shader || shader instanceof Asset) {
        return;
    }

    const transform = _k.gfx.transform.clone();
    if (opt.pos) transform.translateSelfV(opt.pos);
    if (opt.angle) transform.rotateSelf(opt.angle);
    if (opt.scale) transform.scaleSelfV(opt.scale);
    if (opt.skew) transform.skewSelfV(opt.skew);

    const w = width();
    const h = height();
    _k.gfx.renderer.flush(w, h);

    shader.bind();
    shader.send({
        width: w,
        height: h,
        camera: opt.fixed === true ? IDENTITY_MATRIX : getCamTransform(),
        transform: transform,
    });
    if (opt.uniform) {
        shader.send(opt.uniform);
    }
    texture.bind();
    opt.mesh.draw(opt.primitive ?? gl.TRIANGLES, opt.index, opt.count);
    texture.unbind();
    shader.unbind();

    ctx.pushArrayBuffer(_k.gfx.renderer.glVBuf);
    // We restore the pointers to this vertex buffer again
    ctx.setVertexFormat(_k.gfx.renderer.vertexFormat, false);
    // And pop the buffer to balance
    ctx.popArrayBuffer();
}

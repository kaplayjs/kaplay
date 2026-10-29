import { Asset } from "../assets/asset";
import { resolveShader } from "../assets/shader";
import { _k } from "../shared";
import { type Attributes, BlendMode, type RenderProps } from "../types";
import { drawPicture, Picture } from "./draw/drawPicture";
import { drawRaw } from "./draw/drawRaw";
import { Mesh } from "./gfx";
import type { Frame } from "./TexPacker";

export class BakedTiles {
    private pictures: Picture[] = [];
    private color = [1, 1, 1, 1];

    rebuild(
        rows: readonly (readonly (Frame | undefined)[])[],
        tileWidth: number,
        tileHeight: number,
    ) {
        const pictures: Picture[] = [];
        let picture = new Picture();
        const finish = () => {
            if (!picture.indices.length) return;
            picture.mesh = new Mesh(
                _k.gfx.renderer.ctx,
                _k.gfx.renderer.vertexFormat,
                picture.vertices,
                picture.indices,
            );
            pictures.push(picture);
            picture = new Picture();
        };

        try {
            for (let y = 0; y < rows.length; y++) {
                for (let x = 0; x < rows[y].length; x++) {
                    const frame = rows[y][x];
                    if (!frame) continue;
                    if (picture.vertices.length / 8 + 4 > 65536) finish();

                    const base = picture.vertices.length / 8;
                    const left = x * tileWidth;
                    const top = y * tileHeight;
                    const right = left + tileWidth;
                    const bottom = top + tileHeight;
                    const q = frame.q;
                    picture.vertices.push(
                        left,
                        bottom,
                        q.x,
                        q.y + q.h,
                        ...this.color,
                        left,
                        top,
                        q.x,
                        q.y,
                        ...this.color,
                        right,
                        top,
                        q.x + q.w,
                        q.y,
                        ...this.color,
                        right,
                        bottom,
                        q.x + q.w,
                        q.y + q.h,
                        ...this.color,
                    );
                    const index = picture.indices.length;
                    picture.indices.push(
                        base,
                        base + 1,
                        base + 3,
                        base + 1,
                        base + 2,
                        base + 3,
                    );
                    const last = picture.commands.at(-1);
                    if (last?.material.tex === frame.tex) {
                        last.count += 6;
                    }
                    else {
                        picture.commands.push({
                            material: { tex: frame.tex },
                            index,
                            count: 6,
                        });
                    }
                }
            }
            finish();
        } catch (error) {
            for (const built of pictures) built.free();
            throw error;
        }

        this.free();
        this.pictures = pictures;
    }

    draw(opt: RenderProps) {
        const shader = resolveShader(opt.shader ?? _k.gfx.defShader);
        if (!shader || shader instanceof Asset) return;
        const color = [
            (opt.color?.r ?? 255) / 255,
            (opt.color?.g ?? 255) / 255,
            (opt.color?.b ?? 255) / 255,
            opt.opacity ?? 1,
        ];
        if (color.some((value, i) => value !== this.color[i])) {
            this.color = color;
            const ctx = _k.gfx.renderer.ctx;
            for (const picture of this.pictures) {
                for (let i = 0; i < picture.vertices.length; i += 8) {
                    for (let channel = 0; channel < 4; channel++) {
                        picture.vertices[i + 4 + channel] = color[channel];
                    }
                }
                ctx.pushArrayBuffer(picture.mesh!.glVBuf);
                ctx.gl.bufferSubData(
                    ctx.gl.ARRAY_BUFFER,
                    0,
                    new Float32Array(picture.vertices),
                );
                ctx.popArrayBuffer();
            }
        }
        for (const picture of this.pictures) {
            if (_k.gfx.renderer.picture) {
                for (const command of picture.commands) {
                    const start = picture.indices[command.index];
                    const end = start + command.count / 6 * 4;
                    const attributes: Attributes = {
                        pos: [],
                        uv: [],
                        color: [],
                        opacity: [],
                    };
                    for (let vertex = start; vertex < end; vertex++) {
                        const i = vertex * 8;
                        const v = picture.vertices;
                        attributes.pos.push(v[i], v[i + 1]);
                        attributes.uv.push(v[i + 2], v[i + 3]);
                        attributes.color.push(
                            v[i + 4] * 255,
                            v[i + 5] * 255,
                            v[i + 6] * 255,
                        );
                        attributes.opacity.push(v[i + 7]);
                    }
                    drawRaw(
                        attributes,
                        picture.indices.slice(
                            command.index,
                            command.index + command.count,
                        )
                            .map(index => index - start),
                        _k.gfx.fixed,
                        command.material.tex,
                        shader,
                        opt.uniform ?? undefined,
                        opt.blend ?? BlendMode.Normal,
                    );
                }
            }
            else {
                for (const command of picture.commands) {
                    command.material.shader = shader;
                    command.material.uniform = opt.uniform ?? undefined;
                    command.material.blend = opt.blend ?? BlendMode.Normal;
                }
                drawPicture(picture, { fixed: _k.gfx.fixed });
            }
        }
    }

    free() {
        for (const picture of this.pictures) picture.free();
        this.pictures = [];
    }
}

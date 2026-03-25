import type { Color } from "../math/color";
import type { Vec2 } from "../math/Vec2";
import type { Vec3 } from "../math/vec3";
import { _k } from "../shared";
import type { Canvas, Mesh, SerializedMesh } from "../types";
import { FrameBuffer } from "./FrameBuffer";
import { MeshBuffer, type VertexFormat } from "./gfx";
import { flush } from "./stack";

export const makeCanvas = (w: number, h: number): Canvas => {
    const fb = new FrameBuffer(_k.ggl, w, h);

    return {
        clear: () => fb.clear(),
        free: () => fb.free(),
        toDataURL: () => fb.toDataURL(),
        toImageData: () => fb.toImageData(),
        width: fb.width,
        height: fb.height,
        draw: (action: () => void) => {
            flush();
            fb.bind();
            action();
            flush();
            fb.unbind();
        },
        get fb() {
            return fb;
        },
    };
};

export const makeMesh = (
    format: VertexFormat,
    vertices: number[],
    indices: number[],
): Mesh => {
    let dirtyMin = Number.MAX_VALUE;
    let dirtyMax = Number.MIN_VALUE;
    const offsets: number[] = [];
    const size = format.reduce((sum, f) => {
        offsets.push(sum);
        return sum + f.size;
    }, 0);
    const ctx = _k.ggl;
    const gl = ctx.gl;
    const mesh = new MeshBuffer(ctx, format, vertices, indices);

    return {
        draw(primitive?: GLenum, index?: GLuint, count?: GLuint) {
            index ??= 0;
            count ??= indices.length;
            if (
                dirtyMin !== Number.MAX_VALUE && index < dirtyMax
                && index + count > dirtyMin
            ) {
                ctx.pushArrayBuffer(mesh.glVBuf);
                gl.bufferSubData(
                    gl.ARRAY_BUFFER,
                    0,
                    new Float32Array(vertices),
                );
                ctx.popArrayBuffer();
                dirtyMin = Number.MAX_VALUE;
                dirtyMax = Number.MIN_VALUE;
            }
            mesh.draw(primitive, index, count);
        },
        free() {
            mesh.free();
        },
        setVertex(vertexIndex: GLuint, ...attributes: number[]) {
            for (let i = 0; i < size; i++) {
                vertices[vertexIndex * size + i] = attributes[i];
            }
            dirtyMin = Math.min(dirtyMin, vertexIndex);
            dirtyMax = Math.max(dirtyMax, vertexIndex);
        },
        setVertexAttribute(
            vertexIndex: GLuint,
            attributeIndex: GLuint,
            ...values: number[]
        ) {
            for (let i = 0; i < format[attributeIndex].size; i++) {
                vertices[vertexIndex * size + offsets[attributeIndex] + i] =
                    values[i];
            }
            dirtyMin = Math.min(dirtyMin, vertexIndex);
            dirtyMax = Math.max(dirtyMax, vertexIndex);
        },
        setVertexVec2(vertexIndex: GLuint, attributeIndex: GLuint, v: Vec2) {
            this.setVertexAttribute(vertexIndex, attributeIndex, v.x, v.y);
        },
        setVertexVec3(vertexIndex: GLuint, attributeIndex: GLuint, v: Vec3) {
            this.setVertexAttribute(vertexIndex, attributeIndex, v.x, v.y, v.z);
        },
        setVertexColor(
            vertexIndex: GLuint,
            attributeIndex: GLuint,
            color: Color,
            opacity: number,
        ) {
            this.setVertexAttribute(
                vertexIndex,
                attributeIndex,
                color.r,
                color.g,
                color.b,
                opacity,
            );
        },
        get vertices() {
            return vertices;
        },
        get indices() {
            return indices;
        },
        get mesh() {
            return mesh;
        },
        get vertexSize() {
            return size;
        },
        serialize(): SerializedMesh {
            return {
                format: format.slice(),
                vertices: this.vertices.slice(),
                indices: this.indices.slice(),
            };
        },
    };
};

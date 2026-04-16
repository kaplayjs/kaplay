import { DEF_ANCHOR } from "../../../constants/general";
import { getRenderProps } from "../../../game/utils";
import { anchorPt } from "../../../gfx/anchor";
import { makeMesh } from "../../../gfx/canvasBuffer";
import { drawMesh } from "../../../gfx/draw/drawMesh";
import { Rect, vec2 } from "../../../math/math";
import type { Comp, GameObj, Mesh, SerializedMesh } from "../../../types";
import { nextRenderAreaVersion } from "../physics/area";
import type { AnchorComp } from "../transform/anchor";
import type { PosComp } from "../transform/pos";

/**
 * The serialized {@link mesh `mesh()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedMeshComp {
    mesh: SerializedMesh;
}

/**
 * The {@link mesh `mesh()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface MeshComp extends Comp {
    mesh: Mesh;
    draw: Comp["draw"];
    renderArea(): Rect;
    serialize(): SerializedMeshComp;
}

/**
 * Options for the {@link mesh `mesh()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface MeshCompOpt {
    mesh: Mesh;
}

export function mesh(
    opt: MeshCompOpt,
): MeshComp & { _renderAreaVersion: number } {
    let _shape: Rect | undefined;
    return {
        id: "mesh",
        get mesh() {
            return opt.mesh;
        },
        draw(this: GameObj<MeshComp | PosComp | AnchorComp>) {
            if (this.has("anchor")) {
                const rect = this.renderArea();
                const anchorOffset = anchorPt(this.anchor);
                const offset = vec2(
                    - (anchorOffset.x + 1) * 0.5 * (rect.width),
                    - (anchorOffset.y + 1) * 0.5 * (rect.height)
                );
                drawMesh(Object.assign(getRenderProps(this), { mesh: opt.mesh, offset }));
            }
            else {
                drawMesh(Object.assign(getRenderProps(this), { mesh: opt.mesh }));
            }
        },
        renderArea() {
            if (!_shape) {
                const min = vec2(this.mesh.vertices[0], this.mesh.vertices[1]);
                const max = min.clone();
                for (
                    let i = this.mesh.vertexSize;
                    i < this.mesh.vertices.length;
                    i += this.mesh.vertexSize
                ) {
                    const x = this.mesh.vertices[i];
                    const y = this.mesh.vertices[i + 1];
                    if (x < min.x) min.x = x;
                    if (y < min.y) min.y = y;
                    if (x > max.x) max.x = x;
                    if (y > max.y) max.y = y;
                }
                _shape = new Rect(min, max.x - min.x, max.y - min.y);
                this._renderAreaVersion = nextRenderAreaVersion();
            }
            return _shape;
        },
        _renderAreaVersion: 0,
        inspect() {
            return `mesh: (v: ${this.mesh.vertices.length}, i: ${this.mesh.indices.length})`;
        },
        serialize(this: GameObj<MeshComp>) {
            const data: SerializedMeshComp = { mesh: this.mesh.serialize() };
            return data;
        },
    };
}

export function meshFactory(data: SerializedMeshComp) {
    const opt: MeshCompOpt = {
        mesh: makeMesh(data.mesh.format, data.mesh.vertices, data.mesh.indices),
    };

    return mesh(opt);
}

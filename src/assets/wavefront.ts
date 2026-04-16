import { vec2 } from "../math/math";
import type { Vec2 } from "../math/Vec2";
import { Vec3, vec3 } from "../math/vec3";
import { _k } from "../shared";
import { type Asset, fetchText } from "./asset";

/**
 * @group Assets
 * @subgroup Data
 */
export type WavefrontMaterial = {
    texture: string;
};

/**
 * @group Assets
 * @subgroup Data
 */
export type WavefrontMesh = {
    material: WavefrontMaterial;
    vertices: number[];
    indices: number[];
};

/**
 * @group Assets
 * @subgroup Data
 */
export type WavefrontData = {
    meshes: Array<WavefrontMesh>;
};

export function loadWavefront(
    name: string,
    objSrc: string,
    mtlSrc: string,
): Asset<WavefrontData> {
    const resolveObj = typeof objSrc === "string"
        ? fetchText(objSrc)
        : Promise.resolve(objSrc);

    return _k.assets.meshes.add(
        name,
        resolveObj.then((text: string) => {
            const data: WavefrontData = {
                meshes: [],
            };
            let mesh: WavefrontMesh | undefined;
            let posList: Vec3[] = [];
            let uvList: Vec2[] = [];
            let vertexMap = new Map<string, number[]>();
            const getVertex = (def: string) => {
                let vert = vertexMap.get(def);
                if (vert === undefined) {
                    const parts = def.split("/");
                    const pos = posList[parseInt(parts[0]) - 1];
                    const uv = uvList[parseInt(parts[1]) - 1];
                    vert = [pos.x, pos.y, pos.z, uv.x, uv.y];
                }
                return vert;
            };
            const lines = text.split("\n");
            for (let i = 0; i < lines.length; i++) {
                if (lines[0].startsWith("#")) continue;
                const parts = lines[i].split(" ");
                switch (parts[0]) {
                    case "o":
                        mesh = {
                            material: { texture: "" },
                            vertices: [],
                            indices: [],
                        };
                        data.meshes.push(mesh);
                        break;
                    case "v":
                        posList.push(
                            vec3(
                                parseFloat(parts[1]),
                                parseFloat(parts[2]),
                                parseFloat(parts[3]),
                            ),
                        );
                        break;
                    case "vt":
                        uvList.push(
                            vec2(parseFloat(parts[1]), parseFloat(parts[2])),
                        );
                        break;
                    case "usemtl":
                        mesh!.material.texture = parts[1];
                        break;
                    case "f":
                        if (parts.length == 4) { // Triangle
                            mesh?.vertices.push(...getVertex(parts[1]));
                            mesh?.vertices.push(...getVertex(parts[2]));
                            mesh?.vertices.push(...getVertex(parts[3]));
                        }
                        if (parts.length == 5) { // Quad
                            mesh?.vertices.push(...getVertex(parts[1]));
                            mesh?.vertices.push(...getVertex(parts[2]));
                            mesh?.vertices.push(...getVertex(parts[3]));
                            mesh?.vertices.push(...getVertex(parts[1]));
                            mesh?.vertices.push(...getVertex(parts[3]));
                            mesh?.vertices.push(...getVertex(parts[4]));
                        }
                }
            }

            if (mtlSrc) {
                const resolveMtl = typeof mtlSrc === "string"
                    ? fetchText(mtlSrc)
                    : Promise.resolve(mtlSrc);

                return resolveMtl.then((text: string) => {
                    const lines = text.split("\n");
                    let currentMaterial;
                    for (let i = 0; i < lines.length; i++) {
                        const parts = lines[i].split(" ");
                        switch (parts[0]) {
                            case "newmtl":
                                currentMaterial = parts[1];
                                break;
                            case "map_kd":
                                const texture = parts[1];
                                for (const mesh of data.meshes) {
                                    if (
                                        mesh.material.texture == currentMaterial
                                    ) {
                                        mesh.material.texture = texture;
                                    }
                                }
                                break;
                        }
                    }

                    return data;
                });
            }
            else {
                return data;
            }
        }),
    );
}

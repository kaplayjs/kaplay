import { makeMesh } from "../gfx/canvasBuffer";
import { vec2 } from "../math/math";
import type { Vec2 } from "../math/Vec2";
import { Vec3, vec3 } from "../math/vec3";
import { _k } from "../shared";
import type { Mesh } from "../types";
import { type Asset, fetchText } from "./asset";
import { loadSprite, SpriteData } from "./sprite";

/**
 * @group Assets
 * @subgroup Data
 */
export type WavefrontMaterial = {
    texture?: SpriteData;
};

/**
 * @group Assets
 * @subgroup Data
 */
export type WavefrontData = {
    meshes: Map<string, Mesh>;
};

class MaterialLibrary {
    materials = new Map<string, WavefrontMaterial>();
    constructor() {
    }
    add(name: string, material: WavefrontMaterial) {
        this.materials.set(name, material);
    }
}

function loadWavefrontMaterialLibrary(
    mtlSrc: string,
): Promise<MaterialLibrary> {
    const resolveMtl = typeof mtlSrc === "string"
        ? fetchText(mtlSrc)
        : Promise.resolve(mtlSrc);

    return resolveMtl.then(async (text: string) => {
        const lib = new MaterialLibrary();
        const lines = text.split("\n");
        let currentMaterial;
        for (let i = 0; i < lines.length; i++) {
            const parts = lines[i].split(" ");
            switch (parts[0]) {
                case "newmtl":
                    currentMaterial = parts[1];
                    break;
                case "map_kd":
                    if (currentMaterial) {
                        const spritePath = parts[1];
                        const texture = await loadSprite(
                            spritePath,
                            spritePath,
                        );
                        lib.add(currentMaterial, { texture });
                    }
                    break;
            }
        }

        return lib;
    });
}

const WavefrontVertexFormat = [
    { name: "a_pos", size: 3 },
    { name: "a_uv", size: 2 },
];

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
        resolveObj.then(async (text: string) => {
            const data: WavefrontData = { meshes: new Map<string, Mesh>() };
            const libs = new Map<string, MaterialLibrary>();
            let meshName;
            let meshData: {
                vertices: number[];
                indices: number[];
                ranges: [SpriteData, number, number][];
            } | undefined = undefined;
            let posList: Vec3[] = [];
            let uvList: Vec2[] = [];
            let vertexMap = new Map<string, [number, number[]]>();
            let currentMaterial;
            let currentMaterialName;
            const getVertex = (
                def: string,
                materialName: string,
                material: WavefrontMaterial,
            ) => {
                const key = materialName + def;
                const pair = vertexMap.get(key);
                if (pair) {
                    let [index, vert] = pair;
                    return index;
                }
                const parts = def.split("/");
                const pos = posList[parseInt(parts[0]) - 1];
                const uv = uvList[parseInt(parts[1]) - 1].clone();
                // uv is from 0,0 to 1,1, but the sprite is in a sprite sheet, so transform it
                const q = material.texture!.frames[0].q;
                uv.x = uv.x * q.w + q.x;
                uv.y = uv.y * q.h + q.y;
                // Add vertex data
                const index = vertexMap.size;
                const vert = [pos.x, pos.y, pos.z, uv.x, uv.y];
                meshData?.vertices.push(...vert);
                vertexMap.set(key, [index, vert]);
                return index;
            };
            const lines = text.split("\n");
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith("#")) continue;
                const parts = lines[i].split(" ");
                switch (parts[0]) {
                    case "o":
                        if (meshName) {
                            data.meshes.set(
                                meshName,
                                makeMesh(
                                    WavefrontVertexFormat,
                                    meshData!.vertices,
                                    meshData!.indices,
                                ),
                            );
                        }
                        meshName = parts[1];
                        meshData = {
                            vertices: [],
                            indices: [],
                            ranges: [],
                        };

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
                    case "mtllib":
                        const libraryPath = parts[1];
                        const lib = await loadWavefrontMaterialLibrary(
                            libraryPath,
                        );
                        libs.set(libraryPath, lib);
                        break;
                    case "usemtl":
                        const materialName = parts[1];
                        let material;
                        for (const lib of libs.values()) {
                            material = lib.materials.get(materialName);
                            if (material) {
                                break;
                            }
                        }
                        if (!material) {
                            console.error(
                                `Material ${materialName} not found.`,
                            );
                        }
                        if (meshData!.ranges.length) {
                            meshData!.ranges[meshData!.ranges.length - 1][2] =
                                meshData!.indices.length
                                - meshData!
                                    .ranges[meshData!.ranges.length - 1][1];
                        }
                        if (material?.texture) {
                            meshData!.ranges.push([
                                material?.texture,
                                meshData!.indices.length,
                                meshData!.indices.length,
                            ]);
                        }
                        currentMaterial = material;
                        currentMaterialName = parts[1];
                        break;
                    case "f":
                        if (parts.length == 4) { // Triangle
                            meshData?.indices.push(
                                getVertex(
                                    parts[1],
                                    currentMaterialName!,
                                    currentMaterial!,
                                ),
                            );
                            meshData?.indices.push(
                                getVertex(
                                    parts[2],
                                    currentMaterialName!,
                                    currentMaterial!,
                                ),
                            );
                            meshData?.indices.push(
                                getVertex(
                                    parts[3],
                                    currentMaterialName!,
                                    currentMaterial!,
                                ),
                            );
                        }
                        if (parts.length == 5) { // Quad
                            meshData?.indices.push(
                                getVertex(
                                    parts[1],
                                    currentMaterialName!,
                                    currentMaterial!,
                                ),
                            );
                            meshData?.indices.push(
                                getVertex(
                                    parts[2],
                                    currentMaterialName!,
                                    currentMaterial!,
                                ),
                            );
                            meshData?.indices.push(
                                getVertex(
                                    parts[3],
                                    currentMaterialName!,
                                    currentMaterial!,
                                ),
                            );
                            meshData?.indices.push(
                                getVertex(
                                    parts[1],
                                    currentMaterialName!,
                                    currentMaterial!,
                                ),
                            );
                            meshData?.indices.push(
                                getVertex(
                                    parts[3],
                                    currentMaterialName!,
                                    currentMaterial!,
                                ),
                            );
                            meshData?.indices.push(
                                getVertex(
                                    parts[4],
                                    currentMaterialName!,
                                    currentMaterial!,
                                ),
                            );
                        }
                        break;
                    default:
                        console.log(`Unknown tag <${parts[0]}>`);
                }
            }

            if (meshData!.ranges.length) {
                meshData!.ranges[meshData!.ranges.length - 1][2] =
                    meshData!.indices.length
                    - meshData!.ranges[meshData!.ranges.length - 1][1];
            }
            if (meshName) {
                data.meshes.set(
                    meshName,
                    makeMesh(
                        WavefrontVertexFormat,
                        meshData!.vertices,
                        meshData!.indices,
                    ),
                );
            }

            return data;
        }),
    );
}

export function getWavefront(name: string): Asset<WavefrontData> | null {
    return _k.assets.meshes.get(name) ?? null;
}

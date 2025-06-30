import type { Comp, GameObj } from "../../types"
import { _k } from "../../shared"; import { Asset, AssetBucket, fetchJSON, loadJSON } from "../../assets/asset";
import { fixURL } from "../../assets/utils";
;

const factoryMethods: { [key: string]: (data: object) => Comp } = {};
const prefabAssets = new AssetBucket<any>();

// Deserialization
function registerPrefabFactory(id: string, factoryMethod: (data: object) => Comp) {
    factoryMethods[id] = factoryMethod;
}

function deserializePrefabAsset(prefabAsset: { [key: string]: any }) {
    const list: Comp[] = [];
    for (const id in prefabAsset) {
        if (id in factoryMethods) {
            list.push(factoryMethods[id](prefabAsset[id]));
        }
    }
    return list;
}

export function loadPrefab(name: string, url: string) {
    return prefabAssets.add(name, fetchJSON(fixURL(url)));
}

// Serialization
export function createPrefab(nameOrObject: string | GameObj, object?: GameObj) {
    const data: { [key: string]: any } = {};
    const obj: GameObj = object ? object : nameOrObject as GameObj;
    for (const id in obj.ids) {
        const c = obj.c(id);
        if (c && "serialize" in c) {
            data[id] = (c.serialize as () => any)();
        }
    }
    if (object) {
        prefabAssets.add(nameOrObject as string, Promise.resolve(new Asset<any>(data as any)));
    }
    return data;
}

// Instancing
export function addPrefab(name: object | string) {
    let data: object;
    if (typeof name === "string") {
        if (name in prefabAssets) {
            data = prefabAssets.get("name")?.data;
        }
        else {
            throw new Error(`Can't add unknown prefab named ${name}`);
        }
    }
    else {
        data = name;
    }
    return _k.game.root.add(deserializePrefabAsset(data));
}
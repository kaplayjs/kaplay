import { Asset, fetchJSON } from "../../assets/asset";
import { fixURL } from "../../assets/utils";
import { _k } from "../../shared";
import type { Comp, GameObj } from "../../types";
import type { InternalGameObjRaw } from "./GameObjRaw";

const factoryMethods: { [key: string]: (data: object) => Comp } = {};

// #region Deserialization
export function registerPrefabFactory(
    id: string,
    factoryMethod: (data: object) => Comp,
) {
    factoryMethods[id] = factoryMethod;
}

export function deserializePrefabAsset(prefabAsset: { [key: string]: any }) {
    const list: Comp[] = [];
    for (const id in prefabAsset) {
        if (id in factoryMethods) {
            list.push(factoryMethods[id](prefabAsset[id]));
        }
    }

    return list;
}

export function deserializeComp(id: string, data: any) {
    if (id in factoryMethods) {
        return factoryMethods[id](data);
    }
    throw new Error(`No factory found to deserialize component with id ${id}`);
}
// #endregion

// #region Loading
export function loadPrefab(name: string, url: string) {
    return _k.assets.prefabAssets.add(name, fetchJSON(fixURL(url)));
}
// #endregion

// #region Serialization
export function createPrefab(nameOrObject: string | GameObj, object?: GameObj) {
    const data: { [key: string]: any } = {};
    const obj: InternalGameObjRaw = object
        ? object as InternalGameObjRaw
        : nameOrObject as InternalGameObjRaw;

    for (const [id, c] of obj._compStates) {
        if ("serialize" in c) {
            data[id] = (c.serialize as () => any)();
        }
    }
    if (object) {
        _k.assets.prefabAssets.add(
            nameOrObject as string,
            Promise.resolve(new Asset<any>(data as any)),
        );
    }
    return data;
}
// #endregion

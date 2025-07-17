import { Asset, fetchJSON } from "../../assets/asset";
import { fixURL } from "../../assets/utils";
import { _k } from "../../shared";
import type { Comp, CompList, GameObj } from "../../types";
import type { GameObjRaw, InternalGameObjRaw } from "./GameObjRaw";

/**
 * A serialized game object. Created using {@link GameObjRaw.serialize `GameObjRaw.serialize()` } method.
 *
 * @since v4000.0
 * @group Serialization
 */
export interface SerializedGameObj {
    components: Record<string, any>;
    tags: string[];
    children?: SerializedGameObj[];
}

const factoryMethods: { [key: string]: (data: object) => Comp } = {};

// #region Deserialization
export function registerPrefabFactory(
    id: string,
    factoryMethod: (data: any) => Comp,
) {
    factoryMethods[id] = factoryMethod;
}

export function deserializePrefabAsset(serializedPrefab: SerializedGameObj) {
    const list: CompList<unknown> = [];

    for (const id in serializedPrefab.components) {
        if (id in factoryMethods) {
            list.push(factoryMethods[id](serializedPrefab.components[id]));
        }
    }

    for (const tag of serializedPrefab.tags) {
        list.push(tag);
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

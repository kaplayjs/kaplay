import { Asset, fetchJSON } from "../../assets/asset";
import { rootURL } from "../../assets/utils";
import { calcTransform } from "../../math/various";
import { _k } from "../../shared";
import type { Comp, CompList, GameObj } from "../../types";
import type { GameObjRaw, InternalGameObjRaw } from "./GameObjRaw";
import { applyComponents, make } from "./make";
import {
    createPrefabDecoder,
    createPrefabEncoder,
    type PrefabData,
} from "./prefabData";

/**
 * A serialized game object. Created using {@link GameObjRaw.serialize `GameObjRaw.serialize()` } method.
 *
 * @since v4000.0
 * @group Game Obj
 * @subgroup Prefabs
 */
export interface SerializedGameObj {
    components: Record<string, any>;
    tags: string[];
    children?: SerializedGameObj[];
    data?: PrefabData;
}

const factoryMethods = new Map<string, (data: any) => Comp>();

// #region Deserialization
export function registerPrefabFactory(
    id: string,
    factoryMethod: (data: any) => Comp,
) {
    factoryMethods.set(id, factoryMethod);
}

export function deserializePrefabAsset(serializedPrefab: SerializedGameObj) {
    const list: CompList<unknown> = [];

    for (const id in serializedPrefab.components) {
        if (factoryMethods.has(id)) {
            list.push(factoryMethods.get(id)!(serializedPrefab.components[id]));
        }
    }

    for (const tag of serializedPrefab.tags) {
        list.push(tag);
    }

    return list;
}

export function deserializeComp(id: string, data: any) {
    if (factoryMethods.has(id)) {
        return factoryMethods.get(id)!(data);
    }
    throw new Error(`No factory found to deserialize component with id ${id}`);
}

export function instantiatePrefab(
    parent: GameObj,
    prefab: SerializedGameObj,
    extra: CompList<unknown> = [],
): GameObj {
    const nodes: SerializedGameObj[] = [];
    const parents: number[] = [];
    function visit(node: SerializedGameObj, parentIndex: number) {
        const index = nodes.length;
        nodes.push(node);
        parents.push(parentIndex);
        for (const child of node.children ?? []) visit(child, index);
    }
    visit(prefab, -1);

    // Validate factories before construction can publish any object.
    for (const node of nodes) {
        for (const id of Object.keys(node.components)) {
            if (!factoryMethods.has(id)) {
                throw new Error(`No factory found for component ${id}`);
            }
        }
    }
    const objects = nodes.map(() => make([]));
    let decode: (value: any) => any;
    let payloads = nodes.map(node => Object.entries(node.components));
    if (prefab.data) {
        decode = createPrefabDecoder(prefab.data, objects);
    }
    else {
        // Legacy tree payloads also get fresh, independent component data.
        const encoder = createPrefabEncoder([]);
        payloads = payloads.map(entries =>
            entries.map(([id, value]) => [id, encoder.encode(value)])
        );
        decode = createPrefabDecoder(encoder.data, []);
    }
    const components: CompList<unknown>[] = payloads.map((entries, index) => [
        ...entries.map(([id, data]) => deserializeComp(id, decode(data))),
        ...nodes[index].tags,
    ]);
    components[0].push(...extra);
    for (let i = 0; i < objects.length; i++) {
        applyComponents(objects[i], components[i]);
    }
    for (let i = 1; i < objects.length; i++) {
        objects[i].parent = objects[parents[i]];
    }
    objects[0].parent = parent;
    for (const object of objects) {
        calcTransform(object, object.transform);
        _k.game.gameObjEvents.trigger("add", object);
        object.trigger("add", object);
    }
    return objects[0];
}
// #endregion

// #region Loading
export function loadPrefab(name: string, url: string) {
    return _k.assets.prefabAssets.add(name, fetchJSON(rootURL(url)));
}
// #endregion

// #region Serialization
export function createPrefab(nameOrObject: string | GameObj, object?: GameObj) {
    const obj: InternalGameObjRaw = object
        ? object as InternalGameObjRaw
        : nameOrObject as InternalGameObjRaw;

    const data = obj.serialize();

    if (object) {
        _k.assets.prefabAssets.addLoaded(
            nameOrObject as string,
            data,
        );
    }
    return data;
}

export function serializePrefab(root: InternalGameObjRaw): SerializedGameObj {
    const objects: InternalGameObjRaw[] = [];
    function collect(object: InternalGameObjRaw) {
        if (object.id === null) {
            throw new Error("Can't serialize destroyed object");
        }
        objects.push(object);
        for (const child of object.children) {
            collect(child as InternalGameObjRaw);
        }
    }
    collect(root);
    const encoder = createPrefabEncoder(objects);
    const serialized = new Map<GameObj, SerializedGameObj>();
    for (const object of objects) {
        const components: Record<string, any> = Object.create(null);
        for (const [id, component] of object._compStates) {
            if (typeof component.serialize === "function") {
                components[id] = encoder.encode(component.serialize());
            }
        }
        serialized.set(object, { components, tags: [...object.tags] });
    }
    for (const object of objects) {
        if (object.children.length) {
            serialized.get(object)!.children = object.children.map(child =>
                serialized.get(child)!
            );
        }
    }
    const result = serialized.get(root)!;
    result.data = encoder.data;
    return result;
}
// #endregion

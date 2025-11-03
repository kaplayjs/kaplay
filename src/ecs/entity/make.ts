// Make is the entity factory function

import { KEvent, KEventHandler } from "../../events/events";
import { Mat23 } from "../../math/math";
import { _k } from "../../shared";
import type { Comp, CompList, GameObj } from "../../types";
import { GameObjRawPrototype } from "./GameObjRaw";

/*
Order of making a game object:

1. We receive an array of components and tags from add([])
2. We create the GameObjRaw object using our prototype
3. We call .use() or .tag() on elements in the compAndTags array
*/

/*
We use makeInternal() to create the root game object, and make() to create
the rest of the game objects.
*/
export function makeInternal<T extends CompList<unknown>>(
    id: number,
    compsAndTags?: [...T],
): GameObj<T[number]> {
    const addCompIdsToTags = id == 0
        ? false
        : _k.globalOpt.tagComponentIds;

    // The game object from the prototype
    const obj: GameObj = Object.create(GameObjRawPrototype);

    // Shadow individual properties
    obj._parent = null as unknown as GameObj;
    obj._onCurCompCleanup = null;
    obj.children = [];
    obj._cleanups = {};
    obj._compStates = new Map();
    obj._compsIds = new Set();
    obj._anonymousCompStates = [];
    obj._tags = new Set("*");
    obj._events = new KEventHandler();
    obj._updateEvents = new KEvent<[]>();
    obj._fixedUpdateEvents = new KEvent<[]>();
    obj._drawEvents = new KEvent<[]>();
    obj._inputEvents = [];
    obj.paused = false;
    obj.hidden = false;
    obj.id = id;
    obj.transform = new Mat23();

    // Adding components passed from add([]);
    // We register here: The objects, because you can also pass tags to add().
    if (!compsAndTags) return obj as GameObj<T[number]>;

    let comps: Comp[] = [];
    let tagList = [];

    for (const compOrTag of compsAndTags) {
        if (typeof compOrTag == "string") {
            tagList.push(compOrTag);
        }
        else {
            const compId = (compOrTag as Comp).id;

            if (compId) {
                obj._compsIds.add(compId);
                if (addCompIdsToTags) tagList.push(compId);
            }

            comps.push(compOrTag as Comp);
        }
    }

    const sortedComps = sortComps(comps);

    // Using .use and .tag we trigger onUse and onTag events correctly
    for (const comp of sortedComps) {
        obj.use(comp);
    }

    for (const tag of tagList) {
        obj.tag(tag);
    }

    // We cast the type as .use() doesn't add the types
    return obj as GameObj<T[number]>;
}

export function make<T extends CompList<unknown>>(
    compsAndTags: [...T],
): GameObj<T[number]> {
    const obj = makeInternal(_k.game.gameObjLastId, compsAndTags);
    _k.game.gameObjLastId++;
    return obj;
}

function sortComps(compList: Comp[]): Comp[] {
    const visited = new Set();
    const visiting = new Set();
    const compsById = compList.reduce((acc, comp) => {
        acc[comp.id as string] = comp;
        return acc;
    }, {} as Record<string, Comp>);
    const order: Comp[] = [];

    function visit(comp: Comp) {
        if (visited.has(comp.id)) return;
        if (visiting.has(comp.id)) {
            throw new Error("Circular Dependency Found");
        }

        visiting.add(comp.id);

        if (comp.require) {
            for (const dep of comp.require) {
                visit(compsById[dep]);
            }
        }

        visiting.delete(comp.id);
        visited.add(comp.id);
        order.push(comp);
    }

    for (const comp of compList) {
        if (!visited.has(comp.id)) {
            visit(comp);
        }
    }

    return order;
}

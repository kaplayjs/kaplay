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
    currentMaking.push(obj);

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
    obj._paused = false;
    obj._hidden = false;
    obj.id = id;
    obj.transform = new Mat23();

    try {
        // Adding components passed from add([]);
        // We register here: The objects, because you can also pass tags to add().
        if (!compsAndTags) return obj as GameObj<T[number]>;

        let comps = [];
        let tagList = [];

        for (const compOrTag of compsAndTags) {
            if (typeof compOrTag == "string") {
                tagList.push(compOrTag);
            }
            else {
                const compId = (<Comp> compOrTag).id;

                if (compId) {
                    obj._compsIds.add(compId);
                    if (addCompIdsToTags) tagList.push(compId);
                }

                comps.push(compOrTag);
            }
        }

        // Using .use and .tag we trigger onUse and onTag events correctly
        for (const comp of comps) {
            obj.use(<Comp> comp);
        }

        for (const tag of tagList) {
            obj.tag(tag);
        }

        // We cast the type as .use() doesn't add the types
        return obj as GameObj<T[number]>;
    } finally {
        currentMaking.pop();
    }
}

export function make<T extends CompList<unknown>>(
    compsAndTags: [...T],
): GameObj<T[number]> {
    const obj = makeInternal(_k.game.gameObjLastId, compsAndTags);
    _k.game.gameObjLastId++;
    return obj;
}

let currentMaking: GameObj[] = [];
export function internalIsMaking(obj: GameObj): boolean {
    return currentMaking.includes(obj);
}

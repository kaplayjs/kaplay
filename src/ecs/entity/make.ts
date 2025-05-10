// Make is the entity factory function

import { KEvent, KEventHandler } from "../../events/events";
import { _k } from "../../kaplay";
import { Mat23 } from "../../math/math";
import type { Comp, CompList, GameObj } from "../../types";
import { attachAppToGameObjRaw, GameObjRawPrototype } from "./GameObjRaw";

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
export function makeInternal<T extends CompList>(
    compsAndTags: [...T],
    id: number,
): GameObj<T[number]> {
    const addCompIdsToTags = id == 0
        ? false
        : _k.globalOpt.tagsAsComponents;

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

    // We only need to modify the prototype the first time, when we know App
    // state is available (at the moment of create the root game object)
    if (id == 0) {
        attachAppToGameObjRaw();
    }

    // Adding components passed from add([]);
    // We register here: The objects, because you can also pass tags to add().
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
}

export function make<T extends CompList>(
    compsAndTags: [...T],
): GameObj<T[number]> {
    const obj = makeInternal(compsAndTags, _k.game.gameObjLastId);
    _k.game.gameObjLastId++;
    return obj;
}

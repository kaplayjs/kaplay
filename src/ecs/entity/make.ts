// The E of KAPLAY

import { KEvent, KEventController, KEventHandler } from "../../events/events";
import { _k } from "../../kaplay";
import { Mat23 } from "../../math/math";
import type { Comp, CompList, GameObj } from "../../types";
import { uid } from "../../utils/uid";
import {
    type AppEvents,
    type GameObjRaw,
    type GameObjRawProperties,
    GameObjRawPrototype,
} from "./GameObjRawPrototype";

export enum KeepFlags {
    Pos = 1,
    Angle = 2,
    Scale = 4,
    All = 7,
}

export type SetParentOpt = {
    keep: KeepFlags;
};

/*
Order of making a game object:

1. We receive an array of components and tags from add([])
2. We create the GameObjRaw interface
3. We call .use() or .tag() on elements in the compAndTags array
*/
export function make<T extends CompList<unknown>>(
    compsAndTags: [...T],
): GameObj<T[number]> {
    const id = uid();
    const addCompIdsToTags = id == 0
        ? false
        : _k.globalOpt.tagsAsComponents;

    // The game object without the app event methods, added later
    const obj: GameObjRaw = Object.create(
        GameObjRawPrototype,
        {
            _parent: {
                value: null,
                writable: true,
            },
            _onCurCompCleanup: {
                value: null,
                writable: true,
                enumerable: true,
            },
            children: {
                value: [],
                writable: true,
                enumerable: true,
            },
            _cleanups: {
                value: {},
            },
            _compStates: {
                value: new Map(),
            },
            _compsIds: {
                value: new Set(),
            },
            _anonymousCompStates: {
                value: [],
            },
            _tags: {
                value: new Set("*"),
            },
            _events: {
                value: new KEventHandler(),
            },
            _updateEvents: {
                value: new KEvent<[]>(),
            },
            _fixedUpdateEvents: {
                value: new KEvent<[]>(),
            },
            _drawEvents: {
                value: new KEvent<[]>(),
            },
            _inputEvents: {
                value: [],
            },
            id: {
                value: id,
            },
            paused: {
                value: false,
            },
            hidden: {
                value: false,
            },
            parent: {
                set(this: GameObjRaw, p: GameObj) {
                    if (this._parent === p) return;
                    const index = this._parent
                        ? this._parent.children.indexOf(this)
                        : -1;
                    if (index !== -1) {
                        this._parent.children.splice(index, 1);
                    }
                    this._parent = p;
                    if (p) {
                        p.children.push(this);
                    }
                },
                get(this: GameObjRaw) {
                    return this._parent;
                },
            },
            tags: {
                get(this: GameObjRaw) {
                    return Array.from(this._tags);
                },
            },
            transform: {
                value: new Mat23(),
            },
            target: {
                value: null,
                writable: true,
            },
        } as {
            [K in keyof GameObjRawProperties]: PropertyDescriptor;
        },
    );

    // We add App Events for "attaching" it to game object
    const appEvs = [
        "onKeyPress",
        "onKeyPressRepeat",
        "onKeyDown",
        "onKeyRelease",
        "onMousePress",
        "onMouseDown",
        "onMouseRelease",
        "onMouseMove",
        "onCharInput",
        "onMouseMove",
        "onTouchStart",
        "onTouchMove",
        "onTouchEnd",
        "onScroll",
        "onGamepadButtonPress",
        "onGamepadButtonDown",
        "onGamepadButtonRelease",
        "onGamepadStick",
        "onButtonPress",
        "onButtonDown",
        "onButtonRelease",
    ] satisfies [...AppEvents[]];

    for (const e of appEvs) {
        // @ts-ignore
        obj[e] = (...args: [any]) => {
            // @ts-ignore
            const ev = _k.app[e]?.(...args);
            obj._inputEvents.push(ev);

            obj.onDestroy(() => ev.cancel());

            // This only happens if obj.has("stay");
            obj.on("sceneEnter", () => {
                // All app events are already canceled by changing the scene
                // so we don't need to event.cancel();
                obj._inputEvents.splice(obj._inputEvents.indexOf(ev), 1);
                // create a new event with the same arguments
                // @ts-ignore
                const newEv = _k.app[e]?.(...args);

                // Replace the old event handler with the new one
                // old KEventController.cancel() => new KEventController.cancel()
                KEventController.replace(ev, newEv);
                obj._inputEvents.push(ev);
            });

            return ev;
        };
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

    return obj as unknown as GameObj<T[number]>;
}

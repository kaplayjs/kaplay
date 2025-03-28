// add an event to a tag

import { type Asset, getFailedAssets } from "../assets/asset";
import { _k } from "../kaplay";
import type { Collision, GameObj, Tag } from "../types";
import { overload2 } from "../utils/overload";
import type { GameObjEventNames, GameObjEvents } from "./eventMap";
import { KEventController } from "./events";

export type TupleWithoutFirst<T extends any[]> = T extends [infer R, ...infer E]
    ? E
    : never;

export function on<Ev extends GameObjEventNames>(
    event: Ev,
    tag: Tag,
    cb: (obj: GameObj, ...args: TupleWithoutFirst<GameObjEvents[Ev]>) => void,
): KEventController {
    let paused = false;
    let obj2Handler = new Map<GameObj, KEventController>();

    const handleNew = (obj: GameObj) => {
        const ec = obj.on(event, (...args) => {
            cb(obj, ...<TupleWithoutFirst<GameObjEvents[Ev]>> args);
        });
        ec.paused = paused;
        if (obj2Handler.has(obj)) obj2Handler.get(obj)!.cancel();
        obj2Handler.set(obj, ec);
    };

    const ecOnTag = _k.game.events.on("tag", (obj, newTag) => {
        if (newTag === tag) handleNew(obj);
    });
    const ecOnUntag = _k.game.events.on("untag", (obj, oldTag) => {
        if (oldTag === tag) {
            const ec = obj2Handler.get(obj)!;
            ec.cancel();
            obj2Handler.delete(obj);
        }
    });
    _k.game.root.get(tag, { recursive: true }).forEach(handleNew);

    return {
        get paused() {
            return paused;
        },
        set paused(p) {
            paused = p;
            obj2Handler.forEach(ec => ec.paused = p);
        },
        cancel() {
            obj2Handler.forEach(ec => ec.cancel());
            obj2Handler.clear();
            ecOnTag.cancel();
            ecOnUntag.cancel();
        },
    };
}

export const trigger = (event: string, tag: string, ...args: any[]) => {
    for (const obj of _k.game.root.children) {
        if (obj.is(tag)) {
            obj.trigger(event, args);
        }
    }
};

export const onFixedUpdate = overload2(
    (action: () => void): KEventController => {
        const obj = _k.game.root.add([{ fixedUpdate: action }]);
        return {
            get paused() {
                return obj.paused;
            },
            set paused(p) {
                obj.paused = p;
            },
            cancel: () => obj.destroy(),
        };
    },
    (tag: Tag, action: (obj: GameObj) => void) => {
        return on("fixedUpdate", tag, action);
    },
);

export const onUpdate = overload2((action: () => void): KEventController => {
    const obj = _k.game.root.add([{ update: action }]);
    return {
        get paused() {
            return obj.paused;
        },
        set paused(p) {
            obj.paused = p;
        },
        cancel: () => obj.destroy(),
    };
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("update", tag, action);
});

export const onDraw = overload2((action: () => void): KEventController => {
    const obj = _k.game.root.add([{ draw: action }]);
    return {
        get paused() {
            return obj.hidden;
        },
        set paused(p) {
            obj.hidden = p;
        },
        cancel: () => obj.destroy(),
    };
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("draw", tag, action);
});

export const onAdd = overload2((action: (obj: GameObj) => void) => {
    return _k.game.events.on("add", action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("add", tag, action);
});

export const onDestroy = overload2((action: (obj: GameObj) => void) => {
    return _k.game.events.on("destroy", action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("destroy", tag, action);
});

export const onUse = overload2((action: (obj: GameObj, id: string) => void) => {
    return _k.game.events.on("use", action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("use", tag, action);
});

export const onUnuse = overload2(
    (action: (obj: GameObj, id: string) => void) => {
        return _k.game.events.on("unuse", action);
    },
    (tag: Tag, action: (obj: GameObj) => void) => {
        return on("unuse", tag, action);
    },
);

export const onTag = overload2((action: (obj: GameObj, id: string) => void) => {
    return _k.game.events.on("tag", action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("tag", tag, action);
});

export const onUntag = overload2(
    (action: (obj: GameObj, id: string) => void) => {
        return _k.game.events.on("untag", action);
    },
    (tag: Tag, action: (obj: GameObj) => void) => {
        return on("untag", tag, action);
    },
);

// add an event that runs with objs with t1 collides with objs with t2
export function onCollide(
    t1: Tag,
    t2: Tag,
    f: (a: GameObj, b: GameObj, col?: Collision) => void,
): KEventController {
    return on("collide", t1, (a, b, col) => b.is(t2) && f(a, b, col));
}

export function onCollideUpdate(
    t1: Tag,
    t2: Tag,
    f: (a: GameObj, b: GameObj, col?: Collision) => void,
): KEventController {
    return on("collideUpdate", t1, (a, b, col) => b.is(t2) && f(a, b, col));
}

export function onCollideEnd(
    t1: Tag,
    t2: Tag,
    f: (a: GameObj, b: GameObj, col?: Collision) => void,
): KEventController {
    return on("collideEnd", t1, (a, b, col) => b.is(t2) && f(a, b, col));
}

export function forAllCurrentAndFuture(t: Tag, action: (obj: GameObj) => void) {
    _k.game.root.get(t, { recursive: true }).forEach(action);
    onAdd(t, action);
    onTag((obj, tag) => {
        if (tag === t) {
            action(obj);
        }
    });
}

export const onClick = overload2((action: () => void) => {
    return _k.app.onMousePress(action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    const events: KEventController[] = [];

    forAllCurrentAndFuture(tag, (obj) => {
        if (!obj.area) {
            throw new Error(
                "onClick() requires the object to have area() component",
            );
        }
        events.push(obj.onClick(() => action(obj)));
    });
    return KEventController.join(events);
});

// add an event that runs once when objs with tag t is hovered
export function onHover(
    t: Tag,
    action: (obj: GameObj) => void,
): KEventController {
    const events: KEventController[] = [];

    forAllCurrentAndFuture(t, (obj) => {
        if (!obj.area) {
            throw new Error(
                "onHover() requires the object to have area() component",
            );
        }
        events.push(obj.onHover(() => action(obj)));
    });
    return KEventController.join(events);
}

// add an event that runs once when objs with tag t is hovered
export function onHoverUpdate(
    t: Tag,
    action: (obj: GameObj) => void,
): KEventController {
    const events: KEventController[] = [];

    forAllCurrentAndFuture(t, (obj) => {
        if (!obj.area) {
            throw new Error(
                "onHoverUpdate() requires the object to have area() component",
            );
        }
        events.push(obj.onHoverUpdate(() => action(obj)));
    });
    return KEventController.join(events);
}

// add an event that runs once when objs with tag t is unhovered
export function onHoverEnd(
    t: Tag,
    action: (obj: GameObj) => void,
): KEventController {
    const events: KEventController[] = [];

    forAllCurrentAndFuture(t, (obj) => {
        if (!obj.area) {
            throw new Error(
                "onHoverEnd() requires the object to have area() component",
            );
        }
        events.push(obj.onHoverEnd(() => action(obj)));
    });
    return KEventController.join(events);
}

export function onLoading(action: (progress: number) => void) {
    return _k.game.events.on("loading", action);
}

export function onResize(action: () => void) {
    return _k.app.onResize(action);
}

export function onError(action: (err: Error) => void) {
    return _k.game.events.on("error", action);
}

export function onLoad(cb: () => void) {
    if (_k.assets.loaded) {
        cb();
    }
    else {
        return _k.game.events.on("load", cb);
    }
}

export function onLoadError(
    cb: (name: string, failedAsset: Asset<any>) => void,
) {
    if (_k.assets.loaded) {
        getFailedAssets().forEach(asset => cb(...asset));
    }
    else {
        return _k.game.events.on("loadError", cb);
    }
}

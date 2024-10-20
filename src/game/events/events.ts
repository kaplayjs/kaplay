// add an event to a tag

import { app, assets, game } from "../../kaplay";
import type { Collision, GameObj, Tag } from "../../types";
import { KEventController, overload2, Registry } from "../../utils";
import type { GameObjEventMap, GameObjEventNames } from "./eventMap";

export type TupleWithoutFirst<T extends any[]> = T extends [infer R, ...infer E]
    ? E
    : never;

export function on<Ev extends GameObjEventNames | string & {}>(
    event: Ev,
    tag: Tag,
    cb: (obj: GameObj, ...args: TupleWithoutFirst<GameObjEventMap[Ev]>) => void,
): KEventController {
    if (!game.objEvents.registers[<keyof GameObjEventMap> event]) {
        game.objEvents.registers[<keyof GameObjEventMap> event] =
            new Registry() as any;
    }

    return game.objEvents.on(<keyof GameObjEventMap> event, (obj, ...args) => {
        if (obj.is(tag)) {
            cb(obj, ...args as TupleWithoutFirst<GameObjEventMap[Ev]>);
        }
    });
}

export const onFixedUpdate = overload2(
    (action: () => void): KEventController => {
        const obj = game.root.add([{ fixedUpdate: action }]);
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
    const obj = game.root.add([{ update: action }]);
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
    const obj = game.root.add([{ draw: action }]);
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
    return game.events.on("add", action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("add", tag, action);
});

export const onDestroy = overload2((action: (obj: GameObj) => void) => {
    return game.events.on("destroy", action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("destroy", tag, action);
});

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
    game.root.get(t, { recursive: true }).forEach(action);
    onAdd(t, action);
}

export const onClick = overload2((action: () => void) => {
    return app.onMousePress(action);
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
    return game.events.on("loading", action);
}

export function onResize(action: () => void) {
    return app.onResize(action);
}

export function onError(action: (err: Error) => void) {
    return game.events.on("error", action);
}

export function onLoad(cb: () => void) {
    if (assets.loaded) {
        cb();
    }
    else {
        return game.events.on("load", cb);
    }
}

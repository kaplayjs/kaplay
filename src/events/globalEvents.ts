import { type Asset, getFailedAssets } from "../assets/asset";
import type { Collision } from "../ecs/systems/Collision";
import { _k } from "../shared";
import type { GameObj, Tag } from "../types";
import { overload2 } from "../utils/overload";
import { KEventController } from "./events";

export const trigger = (event: string, tag: string, ...args: any[]) => {
    for (const obj of _k.game.root.children) {
        if (obj.is(tag)) {
            obj.trigger(event, args);
        }
    }
};

// add an event that runs with objs with t1 collides with objs with t2
export function onCollide(
    t1: Tag,
    t2: Tag,
    f: (a: GameObj, b: GameObj, col?: Collision) => void,
): KEventController {
    return _k.sceneScope.on(
        "collide",
        t1,
        (a, b, col) => b.is(t2) && f(a, b, col),
    );
}

export function onCollideUpdate(
    t1: Tag,
    t2: Tag,
    f: (a: GameObj, b: GameObj, col?: Collision) => void,
): KEventController {
    return _k.sceneScope.on(
        "collideUpdate",
        t1,
        (a, b, col) => b.is(t2) && f(a, b, col),
    );
}

export function onCollideEnd(
    t1: Tag,
    t2: Tag,
    f: (a: GameObj, b: GameObj, col?: Collision) => void,
): KEventController {
    return _k.sceneScope.on(
        "collideEnd",
        t1,
        (a, b, col) => b.is(t2) && f(a, b, col),
    );
}

export function forAllCurrentAndFuture(t: Tag, action: (obj: GameObj) => void) {
    _k.game.root.get(t, { recursive: true }).forEach(action);
    _k.sceneScope.onAdd(t, action);
    _k.sceneScope.onTag((obj, tag) => {
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

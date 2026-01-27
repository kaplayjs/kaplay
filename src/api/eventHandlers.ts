// Global event handlers

import { type Asset, getFailedAssets } from "../assets/asset";
import {
    startClickHandler,
    startHoverSystem,
} from "../ecs/components/physics/area";
import type { Collision } from "../ecs/systems/Collision";
import type { GameObjEventNames, GameObjEvents } from "../events/eventMap";
import type { KEventController } from "../events/events";
import { _k } from "../shared";
import type { GameObj, Tag } from "../types";
import { overload2 } from "../utils/overload";
import type { TupleWithoutFirst } from "../utils/types";

export const trigger = (event: string, tag: string, ...args: any[]) => {
    for (const obj of _k.game.root.children) {
        if (obj.is(tag)) {
            obj.trigger(event, args);
        }
    }
};

export const on = <Ev extends GameObjEventNames | string & {}>(
    event: Ev,
    tag: Tag,
    cb: (
        obj: GameObj,
        ...args: TupleWithoutFirst<GameObjEvents[Ev]>
    ) => void,
): KEventController => {
    let paused = false;
    let obj2Handler = new Map<GameObj, KEventController>();

    const handleNew = (obj: GameObj) => {
        const ec = obj.on(event, (...args) => {
            cb(obj, ...<TupleWithoutFirst<GameObjEvents[Ev]>> args);
        });
        ec.paused = paused;

        let h;
        if (h = obj2Handler.get(obj)) h.cancel();

        obj2Handler.set(obj, ec);
    };

    const ecOnTag = _k.appScope.onTag((obj, newTag) => {
        if (newTag === tag) handleNew(obj);
    });

    const ecOnAdd = _k.appScope.onAdd(obj => {
        if (obj.is(tag)) handleNew(obj);
    });

    const ecOnUntag = _k.appScope.onUntag((obj, oldTag) => {
        if (oldTag === tag) {
            const ec = obj2Handler.get(obj)!;
            ec.cancel();
            obj2Handler.delete(obj);
        }
    });

    const ecOnDestroy = _k.appScope.onDestroy((obj) => {
        if (obj.is(tag)) {
            // event is automatically cancelled by GameObjRaw.remove
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
            ecOnAdd.cancel();
            ecOnUntag.cancel();
            ecOnDestroy.cancel();
        },
    };
};

export const onAdd = overload2((action: (obj: GameObj) => void) => {
    return _k.game.gameObjEvents.on("add", action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("add", tag, action);
});

export const onDestroy = overload2((action: (obj: GameObj) => void) => {
    return _k.game.gameObjEvents.on("destroy", action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("destroy", tag, action);
});

export const onUse = overload2(
    (action: (obj: GameObj, compId: string) => void) => {
        return _k.game.gameObjEvents.on("use", action);
    },
    (tag: Tag, action: (obj: GameObj, compId: string) => void) => {
        return on("use", tag, action);
    },
);

export const onUnuse = overload2(
    (action: (obj: GameObj, compId: string) => void) => {
        return _k.game.gameObjEvents.on("unuse", action);
    },
    (tag: Tag, action: (obj: GameObj, compId: string) => void) => {
        return on("unuse", tag, action);
    },
);

export const onTag = overload2(
    (action: (obj: GameObj, compId: string) => void) => {
        return _k.game.gameObjEvents.on("tag", action);
    },
    (tag: Tag, action: (obj: GameObj, compId: string) => void) => {
        return on("tag", tag, action);
    },
);

export const onUntag = overload2(
    (action: (obj: GameObj, compId: string) => void) => {
        return _k.game.gameObjEvents.on("untag", action);
    },
    (tag: Tag, action: (obj: GameObj, compId: string) => void) => {
        return on("untag", tag, action);
    },
);

// add an event that runs with objs with t1 collides with objs with t2
export function onCollide(
    t1: Tag,
    t2: Tag,
    f: (a: GameObj, b: GameObj, col?: Collision) => void,
): KEventController {
    return on(
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
    return on(
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
    return on(
        "collideEnd",
        t1,
        (a, b, col) => b.is(t2) && f(a, b, col),
    );
}

export const onFixedUpdate = overload2((action: () => void) => {
    return _k.app.state.events.on("fixedUpdate", action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("fixedUpdate", tag, action);
});

export const onUpdate = overload2((action: () => void) => {
    return _k.app.state.events.on("update", action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("update", tag, action);
});

export const onDraw = overload2((action: () => void) => {
    return _k.app.state.events.on("draw", action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("draw", tag, action);
});

export const onClick = (tag: Tag, action: (obj: GameObj) => void) => {
    startClickHandler();
    return on("click", tag, action);
};

export function onHover(tag: Tag, action: (obj: GameObj) => void) {
    startHoverSystem();
    return on("hover", tag, action);
}

export function onHoverEnd(tag: Tag, action: (obj: GameObj) => void) {
    startHoverSystem();
    return on("hoverEnd", tag, action);
}

export function onHoverUpdate(tag: Tag, action: (obj: GameObj) => void) {
    startHoverSystem();
    return on("hoverUpdate", tag, action);
}

// #region just ev handlers
export function onError(action: (err: Error) => void) {
    return _k.game.events.on("error", action);
}

export function onLoading(action: (progress: number) => void) {
    return _k.game.events.on("loading", action);
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

export function onSceneLeave(
    action: (newScene?: string) => void,
): KEventController {
    return _k.game.events.on("sceneLeave", action);
}
// #endregion

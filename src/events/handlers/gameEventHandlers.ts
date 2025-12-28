// Event handlers that uses the game state and game objects events.

import { getFailedAssets, type Asset } from "../../assets/asset";
import { _k } from "../../shared";
import type { GameObj, Tag } from "../../types";
import { overload2 } from "../../utils/overload";
import type { TupleWithoutFirst } from "../../utils/types";
import type { GameObjEventNames, GameObjEvents } from "../eventMap";
import type { KEventController } from "../events";

// Listen to game object events with a tag.
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
            cb(obj, ...<TupleWithoutFirst<GameObjEvents[Ev]>>args);
        });
        ec.paused = paused;
        if (obj2Handler.has(obj)) obj2Handler.get(obj)!.cancel();
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


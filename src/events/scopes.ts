import type { App } from "../app/app";
import {
    GameObjRawPrototype,
    type InternalGameObjRaw,
} from "../ecs/entity/GameObjRaw";
import { scene, type SceneDef } from "../game/scenes";
import type { KEventController } from "./events";
import {
    type GameEventHandlers,
    type GameEventHandlersForApp,
    type GameEventHandlersForGameObj,
} from "./gameEventHandlers";

export type SceneScope =
    & GameEventHandlersForApp
    & GameEventHandlersForGameObj
    & {
        (id: string, def: SceneDef): void;
    };

export const createSceneScope = (
    app: App,
    handlers: GameEventHandlers,
): SceneScope => {
    const sceneScope = scene;

    for (const e of Object.keys(handlers.canvasApp)) {
        // @ts-expect-error
        sceneScope[e] = function(this: InternalGameObjRaw, ...args: [any]) {
            // @ts-expect-error
            const ev: KEventController = handlers.canvasApp[e]?.(...args);

            app.state.sceneEvents.push(ev);

            return ev;
        };
    }

    for (const e of Object.keys(handlers.globalObj)) {
        // @ts-expect-error
        sceneScope[e] = function(this: InternalGameObjRaw, ...args: [any]) {
            // @ts-expect-error
            const ev: KEventController = handlers.globalObj[e]?.(...args);

            app.state.sceneEvents.push(ev);

            return ev;
        };
    }

    return sceneScope as SceneScope;
};

export type AppScope = GameEventHandlersForApp & GameEventHandlersForGameObj;

export const createAppScope = (handlers: GameEventHandlers): AppScope => {
    const appScope = {} as Record<string, any>;

    for (const e of Object.keys(handlers.canvasApp)) {
        appScope[e] = handlers.canvasApp[e as keyof GameEventHandlersForApp];
    }

    for (const e of Object.keys(handlers.globalObj)) {
        appScope[e] =
            handlers.globalObj[e as keyof GameEventHandlersForGameObj];
    }

    return appScope as AppScope;
};

export function attachAppHandlersToGameObjRaw(handlers: GameEventHandlers) {
    for (const e of Object.keys(handlers.canvasApp)) {
        const obj = GameObjRawPrototype as Record<string, any>;

        obj[e] = function(this: InternalGameObjRaw, ...args: [any]) {
            // @ts-ignore
            const ev: KEventController = handlers.canvasApp[e]?.(...args);
            ev.paused = this.paused;

            this._inputEvents.push(ev);

            this.onDestroy(() => ev.cancel());

            return ev;
        };
    }
}

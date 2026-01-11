import type { App } from "../app/app";
import {
    GameObjRawPrototype,
    type InternalGameObjRaw,
} from "../ecs/entity/GameObjRaw";
import { scene, type SceneDef } from "../game/scenes";
import type { KEventController } from "./events";
import { type GameEventHandlers } from "./gameEventHandlers";

export type SceneScope =
    & GameEventHandlers
    & {
        (id: string, def: SceneDef): void;
    };

export const createSceneScope = (
    app: App,
    handlers: GameEventHandlers,
): SceneScope => {
    const sceneScope = scene;

    for (const e of Object.keys(handlers)) {
        // @ts-expect-error
        sceneScope[e] = function(this: InternalGameObjRaw, ...args: [any]) {
            // @ts-expect-error
            const ev: KEventController = handlers[e]?.(...args);

            app.state.sceneEvents.push(ev);

            return ev;
        };
    }

    return sceneScope as SceneScope;
};

export type AppScope = GameEventHandlers;

export const createAppScope = (handlers: GameEventHandlers): AppScope => {
    const appScope = {} as Record<string, any>;

    for (const e of Object.keys(handlers)) {
        appScope[e] = handlers[e as keyof GameEventHandlers];
    }

    return appScope as AppScope;
};

const ignoreInGameObjRaw = [
    "onUpdate",
    "onFixedUpdate",
    "onDraw",
];

export function attachAppHandlersToGameObjRaw(handlers: GameEventHandlers) {
    for (const e of Object.keys(handlers)) {
        if (ignoreInGameObjRaw.includes(e)) {
            continue;
        }

        const obj = GameObjRawPrototype as Record<string, any>;

        obj[e] = function(this: InternalGameObjRaw, ...args: [any]) {
            // @ts-ignore
            const ev: KEventController = handlers[e]?.(...args);
            ev.controller = this;

            this._inputEvents.push(ev);

            this.onDestroy(() => ev.cancel());

            return ev;
        };
    }
}

import type { App } from "../app/app";
import {
    GameObjRawPrototype,
    type InternalGameObjRaw,
} from "../ecs/entity/GameObjRaw";
import { scene, type SceneDef } from "../game/scenes";
import type { KEventController } from "./events";
import { type ScopeHandlers } from "./scopeHandlers";

export type SceneScope =
    & ScopeHandlers
    & {
        (id: string, def: SceneDef): void;
    };

export const createSceneScope = (
    app: App,
    handlers: ScopeHandlers,
): SceneScope => {
    const sceneScope = scene;

    for (const e of Object.keys(handlers)) {
        // @ts-expect-error
        sceneScope[e] = function (this: InternalGameObjRaw, ...args: [any]) {
            // @ts-expect-error
            const ev: KEventController = handlers[e]?.(...args);

            app.state.sceneEvents.push(ev);

            return ev;
        };
    }

    return sceneScope as SceneScope;
};

export type AppScope = ScopeHandlers;

export const createAppScope = (handlers: ScopeHandlers): AppScope => {
    const appScope = {} as Record<string, any>;

    for (const e of Object.keys(handlers)) {
        appScope[e] = handlers[e as keyof ScopeHandlers];
    }

    return appScope as AppScope;
};

const eventHandlersInAppButNotAddedInGameObjRaw = [
    "onUpdate",
    "onFixedUpdate",
    "onDraw",
    "onAdd",
    "onDestroy",
    "onUse",
    "onUnuse",
    "onTag",
    "onUntag",
    "on",
] as const;

export type EventHandlersInAppButNotAddedInGameObjRaw =
    typeof eventHandlersInAppButNotAddedInGameObjRaw[number];

export function attachAppHandlersToGameObjRaw(handlers: ScopeHandlers) {
    for (const e of Object.keys(handlers)) {
        if (
            eventHandlersInAppButNotAddedInGameObjRaw.includes(
                e as EventHandlersInAppButNotAddedInGameObjRaw,
            )
        ) {
            continue;
        }

        const obj = GameObjRawPrototype as Record<string, any>;

        obj[e] = function (this: InternalGameObjRaw, ...args: [any]) {
            // @ts-ignore
            const ev: KEventController = handlers[e]?.(...args);
            ev.paused = this.paused;

            this._inputEvents.push(ev);

            this.onDestroy(() => ev.cancel());

            return ev;
        };
    }
}

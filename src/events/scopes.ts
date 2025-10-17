import type { App, AppEvents } from "../app/app";
import {
    GameObjRawPrototype,
    type InternalGameObjRaw,
} from "../ecs/entity/GameObjRaw";
import { scene, type SceneDef } from "../game/scenes";
import { _k } from "../shared";
import type { KEventController } from "./events";
import type { GameEventHandlers } from "./gameEventHandlers";

export type SceneScope = GameEventHandlers & {
    (id: string, def: SceneDef): void;
};

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

export const createSceneScope = (
    app: App,
    gameHandlers: GameEventHandlers,
): SceneScope => {
    const sceneScope = scene;

    for (const e of Object.keys(gameHandlers)) {
        // @ts-expect-error
        sceneScope[e] = function(this: InternalGameObjRaw, ...args: [any]) {
            // @ts-expect-error
            const ev: KEventController = gameHandlers[e]?.(...args);

            app.state.sceneEvents.push(ev);

            return ev;
        };
    }

    return sceneScope as SceneScope;
};

export type AppScope = {
    [K in keyof App as K extends `on${any}` ? K : never]: App[K];
};

export const createAppScope = (gameHandlers: GameEventHandlers): AppScope => {
    const appScope = {} as Record<string, any>;

    for (const e of Object.keys(gameHandlers)) {
        appScope[e] = gameHandlers[e as keyof GameEventHandlers];
    }

    return appScope as AppScope;
};

export function attachAppToGameObjRaw(app: App) {
    for (const e of appEvs) {
        const obj = GameObjRawPrototype as Record<string, any>;

        obj[e] = function(this: InternalGameObjRaw, ...args: [any]) {
            // @ts-ignore
            const ev: KEventController = app[e]?.(...args);
            ev.paused = this.paused;

            this._inputEvents.push(ev);

            this.onDestroy(() => ev.cancel());

            return ev;
        };
    }
}

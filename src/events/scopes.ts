import type { App, AppEvents } from "../app/app";
import {
    GameObjRawPrototype,
    type InternalGameObjRaw,
} from "../ecs/entity/GameObjRaw";
import { scene, type SceneDef } from "../game/scenes";
import type { KEventController } from "./events";

export type SceneScope =
    & {
        (id: string, def: SceneDef): void;
    }
    & {
        [K in keyof App as K extends `on${any}` ? K : never]: App[K];
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

// TODO: Maybe reach a better solution so we can properly clear the EventController instead qof just cancel the controllers?
export const initCanvasAppSceneScope = (app: App): SceneScope => {
    const sceneScope = scene;

    for (const e of appEvs) {
        // @ts-expect-error
        sceneScope[e] = function(this: InternalGameObjRaw, ...args: [any]) {
            // @ts-expect-error
            const ev: KEventController = app[e]?.(...args);

            app.state.sceneEvents.push(ev);

            return ev;
        };
    }

    return sceneScope as SceneScope;
};

export type AppScope = {
    [K in keyof App as K extends `on${any}` ? K : never]: App[K];
};

export const initCanvasAppAppScope = (app: App): AppScope => {
    const appScope = {} as Record<string, any>;

    for (const e of appEvs) {
        appScope[e] = app[e];
    }

    return appScope as SceneScope;
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

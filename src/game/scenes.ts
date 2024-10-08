import { app, game } from "../kaplay";
import { Mat23, vec2 } from "../math/math";
import type { KEventController } from "../utils";
import { initEvents } from "./initEvents";

/**
 * The name of a scene.
 */
export type SceneName = string;
export type SceneDef = (...args: any) => void;

export function scene(id: SceneName, def: SceneDef) {
    game.scenes[id] = def;
}

export function go(name: SceneName, ...args: unknown[]) {
    if (!game.scenes[name]) {
        throw new Error(`Scene not found: ${name}`);
    }

    game.events.onOnce("frameEnd", () => {
        game.events.trigger("sceneLeave", name);
        app.events.clear();
        game.events.clear();
        game.objEvents.clear();

        [...game.root.children].forEach((obj) => {
            if (
                !obj.stay
                || (obj.scenesToStay && !obj.scenesToStay.includes(name))
            ) {
                game.root.remove(obj);
            }
            else {
                obj.trigger("sceneEnter", name);
            }
        });

        game.root.clearEvents();
        initEvents();

        // cam
        game.cam = {
            pos: null,
            scale: vec2(1),
            angle: 0,
            shake: 0,
            transform: new Mat23(),
        };

        game.scenes[name](...args);
    });

    game.currentScene = name;
}

export function onSceneLeave(
    action: (newScene?: string) => void,
): KEventController {
    return game.events.on("sceneLeave", action);
}

export function getSceneName() {
    return game.currentScene;
}

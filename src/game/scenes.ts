import type { KEventController } from "../events/events";
import { _k } from "../kaplay";
import { Mat23, vec2 } from "../math/math";
import { initEvents } from "./initEvents";

/**
 * The name of a scene.
 */
export type SceneName = string;
export type SceneDef = (...args: any) => void;

export function scene(id: SceneName, def: SceneDef) {
    _k.game.scenes[id] = def;
}

export function go(name: SceneName, ...args: unknown[]) {
    if (!_k.game.scenes[name]) {
        throw new Error(`Scene not found: ${name}`);
    }

    _k.game.events.onOnce("frameEnd", () => {
        _k.game.events.trigger("sceneLeave", name);
        _k.app.events.clear();
        _k.game.events.clear();

        [..._k.game.root.children].forEach((obj) => {
            if (
                !obj.stay
                || (obj.scenesToStay && !obj.scenesToStay.includes(name))
            ) {
                _k.game.root.remove(obj);
            }
            else {
                obj.trigger("sceneEnter", name);
            }
        });

        _k.game.root.clearEvents();
        initEvents(_k.gfx);

        // cam
        _k.game.cam = {
            pos: null,
            scale: vec2(1),
            angle: 0,
            shake: 0,
            transform: new Mat23(),
        };

        _k.game.scenes[name](...args);
    });

    _k.game.currentScene = name;
}

export function onSceneLeave(
    action: (newScene?: string) => void,
): KEventController {
    return _k.game.events.on("sceneLeave", action);
}

export function getSceneName() {
    return _k.game.currentScene;
}

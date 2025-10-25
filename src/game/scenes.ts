import { initAppEvents } from "../app/appEvents";
import type { KEventController } from "../events/events";
import { Mat23, vec2 } from "../math/math";
import { _k } from "../shared";

/**
 * The function definition for a scene
 *
 * @group Scenes
 * @subgroup Types
 */
export type SceneDef = (...args: any) => void;

/**
 * The state of a scene.
 *
 * @group Scenes
 * @subgroup Types
 */
export type SceneState = {
    sceneID: string | null;
    args: unknown[];
};

export function scene(id: string, def: SceneDef) {
    _k.game.scenes[id] = def;
}

export function go(name: string, ...args: unknown[]) {
    if (!_k.game.scenes[name]) {
        throw new Error(`Scene not found: ${name}`);
    }

    _k.game.events.onOnce("frameEnd", () => {
        _k.game.events.trigger("sceneLeave", name);
        _k.game.events.clear();

        _k.app.state.sceneEvents.forEach((e) => e.cancel());

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
        initAppEvents();

        // cam
        _k.game.cam = {
            pos: null,
            scale: vec2(1),
            angle: 0,
            shake: 0,
            transform: new Mat23(),
        };

        _k.game.currentSceneArgs = args;
        _k.game.scenes[name](...args);
    });

    _k.game.currentScene = name;
}

export function pushScene(id: string, ...args: unknown[]) {
    _k.game.sceneStack.push({
        sceneID: _k.game.currentScene,
        args: _k.game.currentSceneArgs,
    });
    go(id, ...args);
    return;
}

export function popScene() {
    const sceneData: SceneState | undefined = _k.game.sceneStack.pop();

    if (sceneData === undefined) {
        throw new Error("No more scenes to pop!");
    }

    if (sceneData.sceneID === null) {
        throw new Error("The scene ID should not be null");
    }

    go(sceneData.sceneID, ...sceneData.args);
}

export function onSceneLeave(
    action: (newScene?: string) => void,
): KEventController {
    return _k.game.events.on("sceneLeave", action);
}

export function getSceneName() {
    return _k.game.currentScene;
}

export function getSceneArgs() {
    return _k.game.currentSceneArgs;
}

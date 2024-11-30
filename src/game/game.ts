import type { Asset } from "../assets";
import type { TimerComp } from "../components";
import { Mat4, Vec2 } from "../math/math";
import { type GameObj, type Key, type MouseButton } from "../types";
import { KEventHandler } from "../utils";
import type { GameObjEventMap } from "./events";
import { make } from "./make";
import type { SceneDef, SceneName } from "./scenes";

export type Game = ReturnType<typeof initGame>;

export const initGame = () => {
    const game = {
        // general events
        events: new KEventHandler<{
            mouseMove: [];
            mouseDown: [MouseButton];
            mousePress: [MouseButton];
            mouseRelease: [MouseButton];
            charInput: [string];
            keyPress: [Key];
            keyDown: [Key];
            keyPressRepeat: [Key];
            keyRelease: [Key];
            touchStart: [Vec2, Touch];
            touchMove: [Vec2, Touch];
            touchEnd: [Vec2, Touch];
            gamepadButtonDown: [string];
            gamepadButtonPress: [string];
            gamepadButtonRelease: [string];
            gamepadStick: [string, Vec2];
            gamepadConnect: [Gamepad];
            gamepadDisconnect: [Gamepad];
            scroll: [Vec2];
            add: [GameObj];
            destroy: [GameObj];
            use: [GameObj, string];
            unuse: [GameObj, string];
            tag: [GameObj, string];
            untag: [GameObj, string];
            load: [];
            loadError: [string, Asset<any>];
            loading: [number];
            error: [Error];
            input: [];
            frameEnd: [];
            resize: [];
            sceneLeave: [string];
            sceneEnter: [string];
        }>(),

        // object events
        objEvents: new KEventHandler<GameObjEventMap>(),

        // root game object
        root: make([]) as GameObj<TimerComp>,

        // misc
        gravity: null as Vec2 | null,
        scenes: {} as Record<SceneName, SceneDef>,
        currentScene: null as SceneName | null,
        layers: null as string[] | null,
        defaultLayerIndex: 0,

        // on screen log
        logs: [] as { msg: string | { toString(): string }; time: number }[],

        // camera
        cam: {
            pos: null as Vec2 | null,
            scale: new Vec2(1),
            angle: 0,
            shake: 0,
            transform: new Mat4(),
        },
    };

    return game;
};

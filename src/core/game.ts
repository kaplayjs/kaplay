import { Mat4, Vec2 } from "../math";
import {
    type GameObj,
    type Key,
    type MouseButton,
    type SceneDef,
    type SceneName,
    type TimerComp,
} from "../types";
import { KEventHandler } from "../utils/events";

export function initGame(rootGameObj: GameObj) {
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
            load: [];
            loading: [number];
            error: [Error];
            input: [];
            frameEnd: [];
            resize: [];
            sceneLeave: [string];
        }>(),

        // object events
        objEvents: new KEventHandler(),

        // root game object
        root: rootGameObj as GameObj<TimerComp>,

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
}

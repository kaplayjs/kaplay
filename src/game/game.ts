import type { Asset } from "../assets/asset";
import type { SpriteData } from "../assets/sprite";
import { timer, type TimerComp } from "../ecs/components/misc/timer";
import { make } from "../ecs/make";
import type { GameEventMap, GameObjEventMap } from "../events/eventMap";
import { KEventHandler } from "../events/events";
import { Mat23, Vec2 } from "../math/math";
import type { GameObj } from "../types";
import type { SceneDef, SceneName } from "./scenes";
import type { System } from "./systems";

/**
 * The "Game" it's all the state related to the game running
 */
export type Game = {
    /**
     * Where game object global events are stored.
     */
    events: KEventHandler<GameEventMap & GameObjEventMap>;
    /**
     * The root game object, parent of all game objects.
     */
    root: GameObj<TimerComp>;
    gravity: Vec2 | null;
    scenes: Record<SceneName, SceneDef>;
    currentScene: string | null;
    layers: string[] | null;
    defaultLayerIndex: number;
    systems: System[];
    systemsByEvent: [
        System[],
        System[],
        System[],
        System[],
        System[],
        System[],
    ];
    kaSprite: Asset<SpriteData> | null;
    boomSprite: Asset<SpriteData> | null;
    logs: Log[];
    cam: CamData;
};

export const initGame = (): Game => {
    const game = {
        // general events
        events: new KEventHandler<GameEventMap & GameObjEventMap>(),
        // root game object
        root: make([]) as GameObj<TimerComp>,

        // misc
        gravity: null as Vec2 | null,
        scenes: {} as Record<SceneName, SceneDef>,
        currentScene: null as SceneName | null,
        layers: null as string[] | null,
        defaultLayerIndex: 0,
        systems: [], // all systems added
        // we allocate systems
        systemsByEvent: [
            [], // afterDraw
            [], // afterFixedUpdate
            [], // afterUpdate
            [], // beforeDraw
            [], // beforeFixedUpdate
            [], // beforeUpdate
        ],

        // default assets
        kaSprite: null as unknown as Asset<SpriteData>,
        boomSprite: null as unknown as Asset<SpriteData>,

        // on screen log
        logs: [] as { msg: string | { toString(): string }; time: number }[],

        // camera
        cam: {
            pos: null as Vec2 | null,
            scale: new Vec2(1),
            angle: 0,
            shake: 0,
            transform: new Mat23(),
        },
    } satisfies Game;

    game.root.use(timer());

    return game;
};

// TODO: Move
type Log = { msg: string | { toString(): string }; time: number };

type CamData = {
    pos: Vec2 | null;
    scale: Vec2;
    angle: number;
    shake: number;
    transform: Mat23;
};

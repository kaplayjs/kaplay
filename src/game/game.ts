import type { Asset } from "../assets/asset";
import type { SpriteData } from "../assets/sprite";
import type { FakeMouseComp } from "../ecs/components/misc/fakeMouse";
import { timer, type TimerComp } from "../ecs/components/misc/timer";
import type { PosComp } from "../ecs/components/transform/pos";
import { makeInternal } from "../ecs/entity/make";
import type { GameEventMap, GameObjEventMap } from "../events/eventMap";
import { KEventHandler } from "../events/events";
import { Mat23, RNG } from "../math/math";
import { Vec2 } from "../math/Vec2";
import type { GameObj } from "../types";
import type { SceneDef, SceneName } from "./scenes";
import type { System } from "./systems";

/**
 * The "Game" it's all the state related to the game running
 */
export type Game = {
    /**
     * The last game object id used.
     */
    gameObjLastId: number;
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
    /**
     * The default RNG used by rng functions.
     */
    // TODO: let user pass seed
    defRNG: RNG;
    /**
     * If game just crashed.
     */
    crashed: boolean;
    /**
     * How many areas are in the game.
     */
    areaCount: number;
    /**
     * Fake Mouse game obj.
     */
    fakeMouse: GameObj<FakeMouseComp | PosComp> | null;
    /**
     * All text inputs in the game.
     */
    allTextInputs: Set<GameObj>;
    /**
     * Deprecated functions we already warned about.
     */
    warned: Set<string>;
};

export const initGame = (): Game => {
    const game = {
        gameObjLastId: 0,
        // general events
        events: new KEventHandler<GameEventMap & GameObjEventMap>(),
        // root game object
        root: makeInternal([], 0) as GameObj<TimerComp>,

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

        defRNG: new RNG(Date.now()),
        crashed: false,
        areaCount: 0,
        fakeMouse: null,
        allTextInputs: new Set<GameObj>(),
        warned: new Set<string>(),
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

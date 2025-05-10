// The Game is the interface that connects all related to a KAPLAY game state.
// It contains the game object tree, game object events, scenes, etc.

// All in /game folder is stuff that uses/modify the game state.

import type { Asset } from "../assets/asset";
import type { SpriteData } from "../assets/sprite";
import type { FakeMouseComp } from "../ecs/components/misc/fakeMouse";
import { timer, type TimerComp } from "../ecs/components/misc/timer";
import type { PosComp } from "../ecs/components/transform/pos";
import { makeInternal } from "../ecs/entity/make";
import type { System } from "../ecs/systems/systems";
import type { GameEventMap, GameObjEventMap } from "../events/eventMap";
import { KEventHandler } from "../events/events";
import { Mat23, RNG } from "../math/math";
import { Vec2 } from "../math/Vec2";
import type { GameObj } from "../types";
import type { SceneDef, SceneName } from "./scenes";

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
    /**
     * The gravity vector of the game.
     */
    gravity: Vec2 | null;
    /**
     * The scenes of the game.
     */
    scenes: Record<SceneName, SceneDef>;
    /**
     * The current scene of the game.
     */
    currentScene: string | null;
    /**
     * The layers of the game.
     */
    layers: string[] | null;
    /**
     * The default layer index of the game.
     */
    defaultLayerIndex: number;
    /**
     * All systems added to the game.
     */
    systems: System[];
    /**
     * The systems added to the game, sorted by event.
     */
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

type Log = { msg: string | { toString(): string }; time: number };

type CamData = {
    pos: Vec2 | null;
    scale: Vec2;
    angle: number;
    shake: number;
    transform: Mat23;
};

/**
 * Creates the Game interface.
 *
 * This will create:
 *
 * - The root game object
 * - The game object events
 * - The camera data
 *
 * @returns A Game
 */
export const createGame = (): Game => {
    const game: Game = {
        gameObjLastId: 0,
        root: makeInternal([], 0) as GameObj<TimerComp>,
        events: new KEventHandler<GameEventMap & GameObjEventMap>(),
        cam: {
            pos: null as Vec2 | null,
            scale: new Vec2(1),
            angle: 0,
            shake: 0,
            transform: new Mat23(),
        },

        // Systems
        systems: [], // all systems added
        // we allocate systems here
        systemsByEvent: [
            [], // afterDraw
            [], // afterFixedUpdate
            [], // afterUpdate
            [], // beforeDraw
            [], // beforeFixedUpdate
            [], // beforeUpdate
        ],

        // Scenes
        scenes: {} as Record<SceneName, SceneDef>,
        currentScene: null as SceneName | null,

        // Layers
        layers: null as string[] | null,
        defaultLayerIndex: 0,

        // Gravity
        gravity: null as Vec2 | null,

        // Assets
        kaSprite: null as unknown as Asset<SpriteData>,
        boomSprite: null as unknown as Asset<SpriteData>,

        // Logs
        logs: [] as { msg: string | { toString(): string }; time: number }[],

        // Fake mouse API
        fakeMouse: null,

        // Some state
        crashed: false,
        areaCount: 0,
        allTextInputs: new Set<GameObj>(),
        defRNG: new RNG(Date.now()),
        warned: new Set<string>(),
    };

    game.root.use(timer());
    game.gameObjLastId++;

    return game;
};

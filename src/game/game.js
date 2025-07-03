"use strict";
// The Game is the interface that connects all related to a KAPLAY game state.
// It contains the game object tree, game object events, scenes, etc.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGame = void 0;
var timer_1 = require("../ecs/components/misc/timer");
var make_1 = require("../ecs/entity/make");
var events_1 = require("../events/events");
var math_1 = require("../math/math");
var Vec2_1 = require("../math/Vec2");
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
var createGame = function () {
    var game = {
        gameObjLastId: 0,
        root: (0, make_1.makeInternal)([], 0),
        events: new events_1.KEventHandler(),
        cam: {
            pos: null,
            scale: new Vec2_1.Vec2(1),
            angle: 0,
            shake: 0,
            transform: new math_1.Mat23(),
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
        scenes: {},
        currentScene: null,
        // Layers
        layers: null,
        defaultLayerIndex: 0,
        // Gravity
        gravity: null,
        // Default assets
        defaultAssets: {},
        // Logs
        logs: [],
        // Fake mouse API
        fakeMouse: null,
        // Some state
        crashed: false,
        areaCount: 0,
        allTextInputs: new Set(),
        defRNG: new math_1.RNG(Date.now()),
        warned: new Set(),
    };
    game.root.use((0, timer_1.timer)());
    game.gameObjLastId++;
    return game;
};
exports.createGame = createGame;

import type { Asset } from "../assets/asset";
import { type sprite } from "../ecs/components/draw/sprite";
import { type agent } from "../ecs/components/level/agent";
import { type patrol } from "../ecs/components/level/patrol";
import { type sentry } from "../ecs/components/level/sentry";
import { type animate } from "../ecs/components/misc/animate";
import { type health } from "../ecs/components/misc/health";
import { type area } from "../ecs/components/physics/area";
import { type body } from "../ecs/components/physics/body";
import { type doubleJump } from "../ecs/components/physics/doubleJump";
import { type offscreen } from "../ecs/components/transform/offscreen";
import { type addLevel } from "../ecs/entity/premade/addLevel";
import type { Collision } from "../ecs/systems/Collision";
import type { Vec2 } from "../math/Vec2";
import type {
    GameObj,
    Key,
    KGamepad,
    KGamepadButton,
    MouseButton,
} from "../types";

/**
 * Game Object events with their arguments.
 *
 * If looking for use it with `obj.on()`, ignore first parameter (Game Obj)
 *
 * @group Events
 * @subgroup Game Obj
 */
export type GameObjEventMap = {
    /** Triggered every frame */
    update: [GameObj];
    /** Triggered every frame at a fixed 50fps rate */
    fixedUpdate: [GameObj];
    /** Triggered every frame before update */
    draw: [GameObj];
    /** Triggered when object is added */
    add: [GameObj];
    /** Triggered when object is destroyed */
    destroy: [GameObj];
    /** Triggered when component is used */
    use: [GameObj, string];
    /** Triggered when component is unused */
    unuse: [GameObj, string];
    /** Triggered when tag is added */
    tag: [GameObj, string];
    /** Triggered when tag is removed */
    untag: [GameObj, string];
    /**
     * Triggered when an object is clicked.
     *
     * From `area()` component.
     */
    click: [GameObj];
    /**
     * Triggered when an object is hovered.
     *
     * From `area()` component.
     */
    hover: [GameObj];
    /**
     * Triggered when an object stops being hovered.
     *
     * From `area()` component.
     */
    hoverEnd: [GameObj];
    /**
     * Triggered when an object is being hovered.
     *
     * From `area()` component.
     */
    hoverUpdate: [GameObj];
    /**
     * Triggered when object collides with another object
     *
     * From {@link area `area()`} component
     */
    collide: [GameObj, GameObj, Collision];
    /**
     * Triggered every frame when object collides with another object
     *
     * From {@link area `area()`} component
     */
    collideUpdate: [GameObj, GameObj, Collision];
    /**
     * Triggered when object stops colliding with another object
     *
     * From {@link area `area()`} component
     */
    collideEnd: [GameObj, GameObj, Collision];
    /**
     * Triggered when object is hurted
     *
     * From {@link health `health()`} component
     */
    hurt: [GameObj, hurt: number];
    /**
     * Triggered when object is healed
     *
     * From {@link health `health()`} component
     */
    heal: [GameObj, heal: number];
    /**
     * Triggered when object dies
     *
     * From {@link health `health()`} component
     */
    death: [GameObj];
    /**
     * Triggered before physics resolves
     *
     * From {@link body `body()`} component
     */
    beforePhysicsResolve: [GameObj, col: Collision];
    /**
     * Triggered after physics resolves
     *
     * From {@link body `body()`} component
     */
    physicsResolve: [GameObj, col: Collision];
    /**
     * Triggered when object is on the ground
     *
     * From {@link body `body()`} component
     */
    ground: [GameObj];
    /**
     * Triggered when object is falling
     *
     * From {@link body `body()`} component
     */
    fall: [GameObj];
    /**
     * Triggered when object stops falling
     *
     * From {@link body `body()`} component
     */
    fallOff: [GameObj];
    /**
     * Triggered when object head butt something (like Mario with brick)
     *
     * From {@link body `body()`} component
     */
    headbutt: [GameObj];
    /**
     * Triggered when an object lands on this object
     *
     * From {@link body `body()`} component
     */
    land: [GameObj];
    /**
     * Triggered when object is headbutted by another object
     *
     * From {@link body `body()`} component
     */
    headbutted: [GameObj];
    /**
     * Triggered when object double jumps
     *
     * From {@link doubleJump `doubleJump()`} component
     */
    doubleJump: [GameObj];
    /**
     * Triggered when object goes out of view
     *
     * From {@link offscreen `offscreen()`} component
     */
    exitView: [GameObj];
    /**
     * Triggered when object enters view
     *
     * From {@link offscreen `offscreen()`} component
     */
    enterView: [GameObj];
    /**
     * Triggered when a sprite animation starts
     *
     * From {@link sprite `sprite()`} component
     */
    animStart: [GameObj, anim: string];
    /**
     * Triggered when a sprite animation ends
     *
     * From {@link sprite `sprite()`} component
     */
    animEnd: [GameObj, anim: string];
    /**
     * From {@link agent `agent()`} component
     */
    navigationNext: [GameObj, GameObj, Vec2];
    /**
     * From {@link agent `agent()`} component
     */
    navigationEnded: [GameObj, GameObj];
    /**
     * From {@link agent `agent()`} component
     */
    navigationStarted: [GameObj, GameObj];
    /**
     * From {@link agent `agent()`} component
     */
    targetReached: [GameObj, GameObj];
    /**
     * From {@link patrol `patrol()`} component
     */
    patrolFinished: [GameObj];
    /**
     * From {@link sentry `sentry()`} component
     */
    objectSpotted: [GameObj, GameObj[]];
    /**
     * From {@link animate `animate()`} component
     */
    animateChannelFinished: [GameObj, channel: string];
    /**
     * From {@link animate `animate()`} component
     */
    animateFinished: [GameObj];
    /**
     * From level of {@link addLevel `addLevel()`} function
     */
    spatialMapChanged: [GameObj];
    /**
     * From level of {@link addLevel `addLevel()`} function
     */
    navigationMapInvalid: [GameObj];
    /**
     * From level of {@link addLevel `addLevel()`} function
     */
    navigationMapChanged: [GameObj];
};

/**
 * @group Events
 * @subgroup Game Obj
 */
export type GameObjEvents = GameObjEventMap & {
    [key: string]: any[];
};

/**
 * @group Events
 * @subgroup Game Obj
 */
export type GameObjEventNames = keyof GameObjEventMap;

/**
 * App events with their arguments
 *
 * @group Events
 */
export type AppEventMap = {
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
    gamepadButtonDown: [KGamepadButton, KGamepad];
    gamepadButtonPress: [KGamepadButton, KGamepad];
    gamepadButtonRelease: [KGamepadButton, KGamepad];
    gamepadStick: [string, Vec2, KGamepad];
    gamepadConnect: [KGamepad];
    gamepadDisconnect: [KGamepad];
    buttonDown: [string];
    buttonPress: [string];
    buttonRelease: [string];
    scroll: [Vec2];
    hide: [];
    show: [];
    resize: [];
    input: [];
    update: [];
    fixedUpdate: [];
    frameEnd: [];
    draw: [];
};

/**
 * All Game State events with their arguments
 *
 * @group Events
 */
export type GameEventMap = {
    load: [];
    loadError: [string, Asset<any>];
    loading: [number];
    error: [Error];
    sceneLeave: [string];
    sceneEnter: [string];
};

import {
    type agent,
    type animate,
    type area,
    type body,
    type doubleJump,
    type health,
    type offscreen,
    type patrol,
    type sentry,
    type sprite,
} from "../../components";
import type { Vec2 } from "../../math";
import type { Collision, GameObj } from "../../types";
import { type addLevel } from "../level";

// exclude mapped types
export type GameObjEventNames =
    | "update"
    | "draw"
    | "add"
    | "destroy"
    | "collide"
    | "collideUpdate"
    | "collideEnd"
    | "hurt"
    | "heal"
    | "death"
    | "beforePhysicsResolve"
    | "physicsResolve"
    | "ground"
    | "fall"
    | "fallOff"
    | "headbutt"
    | "doubleJump"
    | "exitView"
    | "enterView"
    | "animStart"
    | "animEnd"
    | "navigationNext"
    | "navigationEnded"
    | "navigationStarted"
    | "targetReached"
    | "patrolFinished"
    | "objectSpotted"
    | "animateChannelFinished"
    | "animateFinished"
    | "spatialMapChanged"
    | "navigationMapInvalid"
    | "navigationMapChanged";

/**
 * Game Object events.
 *
 * @group Events
 */
export type GameObjEventMap = {
    /** Triggered every frame */
    "update": [GameObj];
    /** Triggered every frame before update */
    "draw": [GameObj];
    /** Triggered when object is added */
    "add": [GameObj];
    /** Triggered when object is destroyed */
    "destroy": [GameObj];
    /**
     * Triggered when object collides with another object
     *
     * From {@link area `area()`} component
     */
    "collide": [GameObj, GameObj, Collision];
    /**
     * Triggered every frame when object collides with another object
     *
     * From {@link area `area()`} component
     */
    "collideUpdate": [GameObj, GameObj, Collision];
    /**
     * Triggered when object stops colliding with another object
     *
     * From {@link area `area()`} component
     */
    "collideEnd": [GameObj, GameObj, Collision];
    /**
     * Triggered when object is hurted
     *
     * From {@link health `health()`} component
     */
    "hurt": [GameObj, hurt: number];
    /**
     * Triggered when object is healed
     *
     * From {@link health `health()`} component
     */
    "heal": [GameObj, heal: number];
    /**
     * Triggered when object dies
     *
     * From {@link health `health()`} component
     */
    "death": [GameObj];
    /**
     * Triggered before physics resolves
     *
     * From {@link body `body()`} component
     */
    "beforePhysicsResolve": [GameObj, col: Collision];
    /**
     * Triggered after physics resolves
     *
     * From {@link body `body()`} component
     */
    "physicsResolve": [GameObj, col: Collision];
    /**
     * Triggered when object is on the ground
     *
     * From {@link body `body()`} component
     */
    "ground": [GameObj];
    /**
     * Triggered when object is falling
     *
     * From {@link body `body()`} component
     */
    "fall": [GameObj];
    /**
     * Triggered when object stops falling
     *
     * From {@link body `body()`} component
     */
    "fallOff": [GameObj];
    /**
     * Triggered when object head butt something (like Mario with brick)
     *
     * From {@link body `body()`} component
     */
    "headbutt": [GameObj];
    /**
     * Triggered when an object lands on this object
     *
     * From {@link body `body()`} component
     */
    "land": [GameObj];
    /**
     * Triggered when object is headbutted by another object
     *
     * From {@link body `body()`} component
     */
    "headbutted": [GameObj];
    /**
     * Triggered when object double jumps
     *
     * From {@link doubleJump `doubleJump()`} component
     */
    "doubleJump": [GameObj];
    /**
     * Triggered when object goes out of view
     *
     * From {@link offscreen `offscreen()`} component
     */
    "exitView": [GameObj];
    /**
     * Triggered when object enters view
     *
     * From {@link offscreen `offscreen()`} component
     */
    "enterView": [GameObj];
    /**
     * Triggered when a sprite animation starts
     *
     * From {@link sprite `sprite()`} component
     */
    "animStart": [GameObj, anim: string];
    /**
     * Triggered when a sprite animation ends
     *
     * From {@link sprite `sprite()`} component
     */
    "animEnd": [GameObj, anim: string];
    /**
     * From {@link agent `agent()`} component
     */
    "navigationNext": [GameObj, GameObj, Vec2];
    /**
     * From {@link agent `agent()`} component
     */
    "navigationEnded": [GameObj, GameObj];
    /**
     * From {@link agent `agent()`} component
     */
    "navigationStarted": [GameObj, GameObj];
    /**
     * From {@link agent `agent()`} component
     */
    "targetReached": [GameObj, GameObj];
    /**
     * From {@link patrol `patrol()`} component
     */
    "patrolFinished": [GameObj];
    /**
     * From {@link sentry `sentry()`} component
     */
    "objectSpotted": [GameObj, GameObj[]];
    /**
     * From {@link animate `animate()`} component
     */
    "animateChannelFinished": [GameObj, channel: string];
    /**
     * From {@link animate `animate()`} component
     */
    "animateFinished": [GameObj];
    /**
     * From level of {@link addLevel `addLevel()`} function
     */
    "spatialMapChanged": [GameObj];
    /**
     * From level of {@link addLevel `addLevel()`} function
     */
    "navigationMapInvalid": [GameObj];
    /**
     * From level of {@link addLevel `addLevel()`} function
     */
    "navigationMapChanged": [GameObj];

    [key: string]: any[];
};

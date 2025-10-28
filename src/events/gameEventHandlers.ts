import type { App } from "../app/app";
import type { Vec2 } from "../math/Vec2";
import { _k } from "../shared";
import type {
    GameObj,
    Key,
    KGamepad,
    KGamepadButton,
    KGamepadStick,
    MouseButton,
    Tag,
} from "../types";
import type { TupleWithoutFirst } from "../utils/types";
import type { GameObjEventNames, GameObjEvents } from "./eventMap";
import type { KEventController } from "./events";
import {
    on,
    onAdd,
    onDestroy,
    onDraw,
    onFixedUpdate,
    onTag,
    onUntag,
    onUnuse,
    onUpdate,
    onUse,
} from "./globalEvents";

export interface GameEventHandlersForGameObj {
    /**
     * Register an event on all game objs with certain tag.
     *
     * @param tag - The tag to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // a custom event defined by body() comp
     * // every time an obj with tag "bomb" hits the floor, destroy it and addKaboom()
     * on("ground", "bomb", (bomb) => {
     *     destroy(bomb)
     *     addKaboom(bomb.pos)
     * })
     *
     * // a custom event can be defined manually
     * // by passing an event name, a tag, and a callback function
     * // if you want any tag, use a tag of "*"
     * on("talk", "npc", (npc, message) => {
     *     npc.add([
     *         text(message),
     *         pos(0, -50),
     *         lifespan(2),
     *         opacity(),
     *     ])
     * });
     *
     * onKeyPress("space", () => {
     *     // the trigger method on game objs can be used to trigger a custom event
     *     npc.trigger("talk", "Hello, KAPLAY!");
     * });
     *
     * ```
     *
     * @returns The event controller.
     * @since v2000.0
     * @group Events
     */
    on<Ev extends GameObjEventNames | (string & {})>(
        event: Ev,
        tag: Tag,
        action: (
            obj: GameObj,
            ...args: TupleWithoutFirst<GameObjEvents[Ev]>
        ) => void,
    ): KEventController;
    /**
     * Register an event that runs at a fixed framerate.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Events
     */
    onFixedUpdate(action: () => void): KEventController;
    onFixedUpdate(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs every frame (~60 times per second) for all game objs with certain tag.
     *
     * @param tag - The tag to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // move every "tree" 120 pixels per second to the left, destroy it when it leaves screen
     * // there'll be nothing to run if there's no "tree" obj in the scene
     * onUpdate("tree", (tree) => {
     *     tree.move(-120, 0)
     *     if (tree.pos.x < 0) {
     *         destroy(tree)
     *     }
     * })
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Events
     */
    onUpdate(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs every frame (~60 times per second).
     *
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // This will run every frame
     * onUpdate(() => {
     *     debug.log("ohhi")
     * })
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Events
     */
    onUpdate(action: () => void): KEventController;
    /**
     * Register an event that runs every frame (~60 times per second) for all game objs with certain tag (this is the same as onUpdate but all draw events are run after update events, drawXXX() functions only work in this phase).
     *
     * @param tag - The tag to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Events
     */
    onDraw(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs every frame (~60 times per second) (this is the same as onUpdate but all draw events are run after update events, drawXXX() functions only work in this phase).
     *
     * @example
     * ```js
     * onDraw(() => {
     *     drawLine({
     *         p1: vec2(0),
     *         p2: mousePos(),
     *         color: rgb(0, 0, 255),
     *     })
     * })
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Events
     */
    onDraw(action: () => void): KEventController;
    /**
     * Register an event that runs when an object with the provided tag is added.
     *
     * @param tag - The tag to listen for.
     * @param action - The function that runs when an object is added.
     *
     * @example
     * ```js
     * // This will run when the object is added.
     * onAdd("player", () => {
     *     debug.log("ohhi");
     * });
     *
     * add([
     *     pos(),
     *     "player"
     * ]);
     * ```
     *
     * @returns The event controller.
     * @since v2000.0
     * @group Events
     */
    onAdd(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs when an object is added
     *
     * @param action - The function that runs when an object is added.
     *
     * @example
     * ```js
     * // This will run when the object is added.
     * onAdd(() => {
     *     debug.log("ohhi");
     * });
     *
     * add([
     *     pos(),
     * ]);
     * ```
     *
     * @returns The event controller.
     * @since v2000.0
     * @group Events
     */
    onAdd(action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs when an object with the provided tag is destroyed.
     *
     * @param action - The function that runs when an object is destroyed.
     *
     * @example
     * ```js
     * // This will run when the tagged object is destroyed.
     * onDestroy("bean", () => {
     *     debug.log("ohbye");
     * });
     *
     * let player = add([
     *     pos(),
     *     "bean"
     * ])
     *
     * // Destroy the tagged object
     * destroy(player);
     * ```
     *
     * @returns The event controller.
     * @since v2000.0
     * @group Events
     */
    onDestroy(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs when an object is destroyed.
     *
     * @param tag - The tag to match, only called for objects with a matching tag.
     * @param action - The function that runs when an object is destroyed.
     *
     * @example
     * ```js
     * // This will run when the object is destroyed.
     * onDestroy(() => {
     *     debug.log("ohbye");
     * });
     *
     * let ghosty = add([
     *     pos(),
     * ]);
     *
     * // Destroy the object
     * destroy(ghosty);
     * ```
     *
     * @returns The event controller.
     * @group Events
     */
    onDestroy(action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs when an object starts using a component.
     *
     * @param action - The function that runs when an object starts using component.
     * @param id - The id of the component that was added.
     *
     * @returns The event controller.
     * @since v3001.1
     * @group Events
     */
    onUse(action: (obj: GameObj, id: string) => void): KEventController;
    /**
     * Register an event that runs when an object stops using a component.
     *
     * @param action - The function that runs when an object stops using a component.
     * @param id - The id of the component that was removed.d
     *
     * @returns The event controller.
     * @since v3001.1
     * @group Events
     */
    onUnuse(action: (obj: GameObj, id: string) => void): KEventController;
    /**
     * Register an event that runs when an object gains a tag.
     *
     * @param action - The function that runs when an object gains a tag.
     * @param tag - The tag which was added.
     *
     * @returns The event controller.
     * @since v3001.1
     * @group Events
     */
    onTag(action: (obj: GameObj, tag: string) => void): KEventController;
    /**
     * Register an event that runs when an object loses a tag.
     *
     * @param action - The function that runs when an object loses a tag.
     * @param tag - The tag which was removed.
     *
     * @returns The event controller.
     * @since v3001.1
     * @group Events
     */
    onUntag(action: (obj: GameObj, tag: string) => void): KEventController;
    // #endregion
}

/**
 * General usage event handlers that are used across KAPLAYCtx, app & scene scopes and object.
 */
export interface GameEventHandlersForApp {
    // #region App Events
    /**
     * Register an event that runs every frame when a key is held down.
     *
     * @param key - The key(s) to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // move left by SPEED pixels per frame every frame when left arrow key is being held down
     * onKeyDown("left", () => {
     *     bean.move(-SPEED, 0)
     * });
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Keyboard
     */
    onKeyDown(key: Key | Key[], action: (key: Key) => void): KEventController;
    /**
     * Register an event that runs every frame when any key is held down.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Keyboard
     */
    onKeyDown(action: (key: Key) => void): KEventController;
    /**
     * Register an event that runs when user presses certain keys.
     *
     * @param k - The key(s) to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // .jump() once when "space" is just being pressed
     * onKeyPress("space", () => {
     *     bean.jump();
     * });
     *
     * onKeyPress(["up", "space"], () => {
     *     bean.jump();
     * });
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Keyboard
     */
    onKeyPress(key: Key | Key[], action: (key: Key) => void): KEventController;
    /**
     * Register an event that runs when user presses any key.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // Call restart() when player presses any key
     * onKeyPress((key) => {
     *     debug.log(`key pressed ${key}`);
     *     restart();
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Keyboard
     */
    onKeyPress(action: (key: Key) => void): KEventController;
    /**
     * Register an event that runs when user presses certain keys (also fires repeatedly when the keys are being held down).
     *
     * @param k - The key(s) to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // delete last character when "backspace" is being pressed and held
     * onKeyPressRepeat("backspace", () => {
     *     input.text = input.text.substring(0, input.text.length - 1);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.1
     * @group Input
     * @subgroup Keyboard
     */
    onKeyPressRepeat(
        k: Key | Key[],
        action: (k: Key) => void,
    ): KEventController;
    /**
     * Register an event that runs when user presses any key and fires repeatedly when the keys are being held down.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // delete last character when "backspace" is being pressed and held
     * onKeyPressRepeat((key) => {
     *     debug.log(`key ${key} is being repeatedly pressed`)
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.1
     * @group Input
     * @subgroup Keyboard
     */
    onKeyPressRepeat(action: (k: Key) => void): KEventController;
    /**
     * Register an event that runs when user release certain keys.
     *
     * @param k - = The key(s) to listen for. See {@link Key `Key`}.
     * @param action - The function that runs when a user releases certain keys
     *
     * @example
     * ```js
     * // release `a` or `b` keys
     * onKeyRelease([`a`, `b`], (k) => {
     *     debug.log(`Released the ${k} key...`);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Keyboard
     */
    onKeyRelease(k: Key | Key[], action: (k: Key) => void): KEventController;
    /**
     * Register an event that runs when user releases a key.
     *
     * @param action - The function that runs when a user releases a {@link Key `Key`}.
     *
     * @example
     * ```js
     * // release a key
     * onKeyRelease((k) => {
     *     debug.log(`Released the ${k} key...`);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     */
    onKeyRelease(action: (k: Key) => void): KEventController;
    /**
     * Register an event that runs when user inputs text.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // type into input
     * onCharInput((ch) => {
     *     input.text += ch
     * })
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Keyboard
     */
    onCharInput(action: (ch: string) => void): KEventController;
    /**
     * Register an event that runs every frame when certain mouse buttons are being held down.
     *
     * @param btn - The mouse button(s) to listen for. See {@link MouseButton `MouseButton`}.
     * @param action - The function that is run when certain mouse buttons are being held down.
     *
     * @example
     * ```js
     * // count time with left mouse button down
     * let mouseTime = 0;
     * onMouseDown("left", () => {
     *     mouseTime += dt();
     *     debug.log(`Time with mouse down: ${mouseTime});
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Mouse
     */
    onMouseDown(
        btn: MouseButton | MouseButton[],
        action: (m: MouseButton) => void,
    ): KEventController;
    /**
     * Register an event that runs every frame when any mouse button is being held down.
     *
     * @param action - The function that is run when any mouse button is being held down.
     *
     * @example
     * ```js
     * // count time with any mouse button down
     * let mouseTime = 0;
     * onMouseDown((m) => {
     *     mouseTime += dt();
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Mouse
     */
    onMouseDown(action: (m: MouseButton) => void): KEventController;
    /**
     * Register an event that runs when user clicks mouse.
     *
     * @param action - The function that is run when user clicks a mouse button.
     *
     * @example
     * ```js
     * // gives cookies on left press, remove on right press
     * let cookies = 0;
     * onMousePress(["left", "right"], (m) => {
     *     if (m == "left") {
     *         cookies++;
     *     } else {
     *         cookies--;
     *     }
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Mouse
     */
    onMousePress(action: (m: MouseButton) => void): KEventController;
    /**
     * Register an event that runs when user clicks mouse.
     *
     * @param btn - The mouse button(s) to listen for. See {@link MouseButton `MouseButton`}.
     * @param action - The function that is run what the user clicks cetain mouse buttons.
     *
     * @example
     * ```js
     * // gives cookies on any mouse press
     * let cookies = 0;
     * onMousePress((m) => {
     *     cookies++;
     *     debug.log(`Cookies: ${cookies}`);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Mouse
     */
    onMousePress(
        btn: MouseButton | MouseButton[],
        action: (m: MouseButton) => void,
    ): KEventController;
    /**
     * Register an event that runs when user releases mouse.
     *
     * @param action - The function that is run what the user clicks a provided mouse button.
     *
     * @example
     * ```js
     * // spawn bean where right mouse is released
     * onMouseRelease("right", (m) => {
     *     debug.log(`${m} released, spawning bean...`);
     *     add([
     *         pos(mousePos()),
     *         sprite("bean"),
     *         anchor("center"),
     *     ]);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Mouse
     */
    onMouseRelease(action: (m: MouseButton) => void): KEventController;
    /**
     * Register an event that runs when user releases mouse.
     *
     * @param btn - The button(s) to listen for. See {@link MouseButton `MouseButton`}.
     * @param action - The function that is run what the user clicks a provided mouse button.
     *
     * @example
     * ```js
     * // spawn bean where right mouse is released
     * onMouseRelease((m) => {
     *     if (m == "right") {
     *         debug.log(`${m} released, spawning bean...`);
     *         add([
     *             pos(mousePos()),
     *             sprite("bean"),
     *             anchor("center"),
     *         ]);
     *     });
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Mouse
     */
    onMouseRelease(
        btn: MouseButton | MouseButton[],
        action: (m: MouseButton) => void,
    ): KEventController;
    /**
     * Register an event that runs whenever user moves the mouse.
     *
     * @param action - The function that is run what the user moves the mouse.
     *
     * @example
     * ```js
     * // runs when the mouse has moved
     * onMouseMove((p, d) => {
     *     bean.pos = p; // set bean position to mouse position
     * });
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Mouse
     */
    onMouseMove(action: (pos: Vec2, delta: Vec2) => void): KEventController;
    /**
     * Register an event that runs when a touch starts.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Touch
     */
    onTouchStart(action: (pos: Vec2, t: Touch) => void): KEventController;
    /**
     * Register an event that runs when a touch ends.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Touch
     */
    onTouchEnd(action: (pos: Vec2, t: Touch) => void): KEventController;
    /**
     * Register an event that runs whenever touch moves.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Touch
     */
    onTouchMove(action: (pos: Vec2, t: Touch) => void): KEventController;
    /**
     * Register an event that runs when mouse wheel scrolled.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // Zoom camera on scroll
     * onScroll((delta) => {
     *     const zoom = delta.y / 500;
     *     camScale(camScale().add(zoom));
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Input
     * @subgroup Mouse
     */
    onScroll(action: (delta: Vec2) => void): KEventController;
    /**
     * Register an event that runs when a gamepad is connected.
     *
     * @param action - The function that runs when quit() is called.
     *
     * @example
     * ```js
     * // watch for a controller connecting
     * onGamepadConnect((gp) => {
     *     debug.log(`ohhi player ${gp.index + 1}`);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadConnect(action: (gamepad: KGamepad) => void): KEventController;
    /**
     * Register an event that runs when a gamepad is disconnected.
     *
     * @param action - The function that runs when quit() is called.
     *
     * @example
     * ```js
     * // watch for a controller disconnecting
     * onGamepadDisconnect((gp) => {
     *     debug.log(`ohbye player ${gp.index + 1}`);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadDisconnect(action: (gamepad: KGamepad) => void): KEventController;
    /**
     * Register an event that runs every frame when certain gamepad buttons are held down.
     *
     * @param btn - The button(s) to listen for. See {@link KGamepadButton `KGamepadButton`}.
     * @param action - The function that is run while certain gamepad buttons are held down.
     *
     * @example
     * ```js
     * // when button is being held down
     * onGamepadButtonDown("rtrigger", (gp) => {
     *     car.addForce(Vec2.fromAngle(car.angle).scale(10));
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadButtonDown(
        btn: KGamepadButton | KGamepadButton[],
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs every frame when any gamepad buttons are held down.
     *
     * @param action - The function that is run while any gamepad buttons are held down.
     *
     * @example
     * ```js
     * // when button is being held down
     * onGamepadButtonDown((btn, gp) => {
     *     if (btn == "rtrigger") {
     *         car.addForce(Vec2.fromAngle(car.angle).scale(10));
     *     } else if (btn == "ltrigger") {
     *         car.addForce(Vec2.fromAngle(car.angle).scale(-5));
     *     }
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadButtonDown(
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user presses certain gamepad button.
     *
     * @param btn - The button(s) to listen for. See {@link KGamepadButton `KGamepadButton`}.
     * @param action - The function that is run when certain gamepad buttons are pressed.
     *
     * @example
     * ```js
     * // when user presses button
     * onGamepadButtonPress("south", (btn, gp) => {
     *     player.jump(200);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadButtonPress(
        btn: KGamepadButton | KGamepadButton[],
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user presses any gamepad button.
     *
     * @param action - The function that is run when any gamepad buttons is pressed.
     *
     * @example
     * ```js
     * // when user presses button
     * onGamepadButtonPress((btn, gp) => {
     *     if (btn == "south") {
     *         player.jump(200);     // jump
     *     }
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadButtonPress(
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user releases certain gamepad button
     *
     * @param btn - The button(s) to listen for. See {@link KGamepadButton `KGamepadButton`}.
     * @param action - The function that is run when certain gamepad buttons are released.
     *
     * @example
     * ```js
     * // charged attack
     * let chargeTime = 0
     * onGamepadButtonPress("west", (btn, gp) => {
     *     chargeTime = time();
     * });
     *
     * // when a gamepad button is released, this is run
     * onGamepadButtonRelease("west", (btn, gp) => {
     *     let chargedt = time() - chargeTime;
     *     debug.log(`Used ${chargedt * 1000} power!`);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadButtonRelease(
        btn: KGamepadButton | KGamepadButton[],
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user releases any gamepad button.
     *
     * @param action - The function that is run when any gamepad buttons are released.
     *
     * @example
     * ```js
     * // when a gamepad button is released, this is run
     * onGamepadButtonRelease((btn, gp) => {
     *     if (btn == "north") {
     *         player.jump(500);
     *     }
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadButtonRelease(
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when the gamepad axis exists.
     *
     * @param button - The stick to listen for. See {@link KGamepadStick `GamepadStick`}.
     * @param action - The function that is run when a specific gamepad stick is moved.
     *
     * @example
     * ```js
     * // player move
     * let player = add([
     *     pos(center()),
     *     sprite(`bean`),
     * ]);
     *
     * // when left stick is moved
     * onGamepadStick("left", (stickVector, gp) => {
     *     player.move(stickVector.x, 0);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadStick(
        stick: KGamepadStick,
        action: (value: Vec2, gameepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user press a defined button
     * (like "jump") on any input (keyboard, gamepad).
     *
     * @param btn - The button(s) to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Buttons API
     */
    onButtonDown(
        btn: string | string[],
        action: (btn: string) => void,
    ): KEventController;
    onButtonDown(action: (btn: string) => void): KEventController;
    /**
     * Register an event that runs when user press a defined button
     * (like "jump") on any input (keyboard, gamepad).
     *
     * @param btn - The button(s) to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Buttons API
     */
    onButtonPress(
        btn: string | string[],
        action: (btn: string) => void,
    ): KEventController;
    onButtonPress(action: (btn: string) => void): KEventController;
    /**
     * Register an event that runs when user release a defined button
     * (like "jump") on any input (keyboard, gamepad).
     *
     * @param btn - The button(s) to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Buttons API
     */
    onButtonRelease(
        btn: string | string[],
        action: (btn: string) => void,
    ): KEventController;
    onButtonRelease(action: (btn: string) => void): KEventController;
    /**
     * Register an event that runs when tab is shown.
     *
     * @param action - The function that is run when the tab is shown.
     *
     * @example
     * ```js
     * // User has returned to this tab
     * onTabShow(() => {
     *     burp();
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Events
     */
    onTabShow(action: () => void): KEventController;
    /**
     * Register an event that runs when tab is hidden.
     *
     * @param action - The function that is run what the tab is hidden.
     *
     * @example
     * ```js
     * // spooky ghost
     * let ghosty = add([
     *     pos(center()),
     *     sprite("ghosty"),
     *     anchor("center"),
     * ]);
     *
     * // when switching tabs, this runs
     * onTabHide(() => {
     *     destroy(ghosty);
     *     add([
     *         text("There was never aa ghosttttt"),
     *         pos(center()),
     *         anchor("center")
     *     ]);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Events
     */
    onTabHide(action: () => void): KEventController;
    // #endregion

    // #region Game Root Events
    // #region Deprecated
    /**
     * @deprecated use `onTabHide` instead
     *
     * Register an event that runs when tab is hidden.
     *
     * @param action - The function that is run what the tab is hidden.
     *
     * @example
     * ```js
     * // spooky ghost
     * let ghosty = add([
     *     pos(center()),
     *     sprite("ghosty"),
     *     anchor("center"),
     * ]);
     *
     * // when switching tabs, this runs
     * onHide(() => {
     *     destroy(ghosty);
     *     add([
     *         text("There was never aa ghosttttt"),
     *         pos(center()),
     *         anchor("center")
     *     ]);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Events
     */
    onHide(action: () => void): KEventController;
    /**
     * @deprecated use `onTabShow` instead
     *
     * Register an event that runs when tab is shown.
     *
     * @param action - The function that is run when the tab is shown.
     *
     * @example
     * ```js
     * // user has returned to this tab
     * onShow(() => {
     *     burp();
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Events
     */
    onShow(action: () => void): KEventController;
    // #endregion
}

export type GameEventHandlers = {
    canvasApp: GameEventHandlersForApp;
    globalObj: GameEventHandlersForGameObj;
};

export const createGameEventHandlers = (app: App) => {
    const handlers: GameEventHandlers = {
        canvasApp: {
            onKeyDown: app.onKeyDown,
            onKeyPress: app.onKeyPress,
            onKeyPressRepeat: app.onKeyPressRepeat,
            onKeyRelease: app.onKeyRelease,
            onCharInput: app.onCharInput,
            onMouseDown: app.onMouseDown,
            onMousePress: app.onMousePress,
            onMouseRelease: app.onMouseRelease,
            onMouseMove: app.onMouseMove,
            onTouchStart: app.onTouchStart,
            onTouchEnd: app.onTouchEnd,
            onTouchMove: app.onTouchMove,
            onScroll: app.onScroll,
            onGamepadConnect: app.onGamepadConnect,
            onGamepadDisconnect: app.onGamepadDisconnect,
            onGamepadButtonDown: app.onGamepadButtonDown,
            onGamepadButtonPress: app.onGamepadButtonPress,
            onGamepadButtonRelease: app.onGamepadButtonRelease,
            onGamepadStick: app.onGamepadStick,
            onButtonDown: app.onButtonDown,
            onButtonPress: app.onButtonPress,
            onButtonRelease: app.onButtonRelease,
            onTabShow: app.onTabShow,
            onTabHide: app.onTabHide,
            // deprecated
            onShow: app.onShow,
            onHide: app.onHide,
        },
        globalObj: {
            on: on,
            onFixedUpdate: onFixedUpdate,
            onUpdate: onUpdate,
            onDraw: onDraw,
            onAdd: onAdd,
            onDestroy: onDestroy,
            onUse: onUse,
            onUnuse: onUnuse,
            onTag: onTag,
            onUntag: onUntag,
        },
    };

    return handlers;
};

// App is everything related to canvas, game loop and input

import type {
    Cursor,
    GameObj,
    KAPLAYOpt,
    Key,
    KGamepad,
    KGamepadButton,
    KGamepadStick,
    MouseButton,
    Tag,
} from "../types";

import { GP_MAP } from "../constants/general";
import type {
    AppEventMap,
    GameObjEventNames,
    GameObjEvents,
} from "../events/eventMap";
import { type KEventController, KEventHandler } from "../events/events";
import { canvasToViewport } from "../gfx/viewport";
import { map, vec2 } from "../math/math";
import { Vec2 } from "../math/Vec2";
import { _k } from "../shared";
import { deprecateMsg } from "../utils/log";
import { overload2 } from "../utils/overload";
import { isEqOrIncludes, setHasOrIncludes } from "../utils/sets";
import type { TupleWithoutFirst } from "../utils/types";
import {
    getButton,
    getButtons,
    pressButton,
    releaseButton,
    setButton,
} from "./buttons";
import {
    ButtonProcessor,
    type ButtonsDef,
    parseButtonBindings,
} from "./inputBindings";

export class ButtonState<T = string, A = never> {
    pressed = new Set<T>();
    pressedRepeat = new Set<T>();
    released = new Set<T>();
    down = new Set<T>();
    constructor(
        private _pressEv: keyof AppEventMap | null,
        private _pressRepeatEv: keyof AppEventMap | null,
        private _downEv: keyof AppEventMap | null,
        private _releaseEv: keyof AppEventMap | null,
        private _arg?: A,
    ) {}
    update() {
        this.pressed.clear();
        this.released.clear();
        this.pressedRepeat.clear();
    }
    process(state: AppState) {
        if (this._downEv !== null) {
            this.down.forEach(b => {
                state.events.trigger(this._downEv as any, b, this._arg);
            });
        }
    }
    press(btn: T, state: AppState) {
        const had = this.pressed.has(btn);
        this.pressed.add(btn);
        this.down.add(btn);
        if (!had && this._pressEv !== null) {
            state.events.trigger(this._pressEv as any, btn, this._arg);
        }
        this.pressRepeat(btn, state);
    }
    pressRepeat(btn: T, state: AppState) {
        const had = this.pressedRepeat.has(btn);
        this.pressedRepeat.add(btn);
        if (!had && this._pressRepeatEv !== null) {
            state.events.trigger(this._pressRepeatEv as any, btn, this._arg);
        }
    }
    release(btn: T, state: AppState) {
        const had = this.released.has(btn);
        this.down.delete(btn);
        this.pressed.delete(btn);
        this.released.add(btn);
        if (!had && this._releaseEv !== null) {
            state.events.trigger(this._releaseEv as any, btn, this._arg);
        }
    }
}

class GamepadState {
    // We allow null gamepad because one of these is used for the merged gamepad state which
    // doesn't fire the events. since they have to include the gamepad as the arg we just let
    // the individual gamepad states fire the events, and only collect the merged state here
    // for the purposes of isGamepadButtonDown() etc.
    constructor(gp: KGamepad | null) {
        this.buttonState = new ButtonState(
            gp && "gamepadButtonPress",
            null,
            gp && "gamepadButtonDown",
            gp && "gamepadButtonRelease",
            gp!,
        );
    }
    buttonState: ButtonState<KGamepadButton, KGamepad>;
    stickState: Map<KGamepadStick, Vec2> = new Map([
        ["left", new Vec2(0)],
        ["right", new Vec2(0)],
    ]);
    analogState = new Map<string, number>();
}

class FPSCounter {
    /** Window size */
    maxSamples = 10;
    history = new Float64Array(this.maxSamples);
    accumulator = 0;
    i = 0;
    fps = 0;
    curNSamples = 0;
    timer = 0;
    autoRecalculateInterval = 1;
    tick(dt: number) {
        this.timer += dt;
        this.accumulator += dt - this.history[this.i];
        this.history[this.i] = dt;
        this.i = (this.i + 1) % this.maxSamples;
        this.curNSamples = Math.min(this.curNSamples + 1, this.maxSamples);
        if (this.timer >= this.autoRecalculateInterval) {
            this.calculate();
            this.timer = 0;
        }
    }
    calculate() {
        return this.fps = this.curNSamples / this.accumulator;
    }
    ago(ago: number) {
        return this.history.at(this.i - ago - 1);
    }
    resize(samples: number) {
        this.history = new Float64Array(this.maxSamples = samples);
        this.i = this.curNSamples = 0;
    }
}

export type App = ReturnType<typeof initApp>;
export type AppState = ReturnType<typeof initAppState>;

/**
 * The App method names that will have a helper in GameObjRaw
 */
export type AppEvents = keyof {
    [K in keyof App as K extends `on${any}` ? K : never]: [never];
};

const fixedSpeeds = {
    friedPotato: 10,
    potato: 20,
    snail: 25,
    normal: 50,
    lightspeed: 80,
    ridiculous: 125,
    ludicrous: 160,
};

export type FixedSpeedOption = keyof typeof fixedSpeeds;

/**
 * Create the App state object.
 *
 * @ignore
 *
 * @param opt - Options.
 *
 * @returns The app state.
 */
export const initAppState = (opt: {
    canvas: HTMLCanvasElement;
    buttons?: ButtonsDef;
    fixedUpdateMode?: FixedSpeedOption;
    maxTimeStep?: number;
}) => {
    const buttons = opt.buttons ?? {};
    return {
        canvas: opt.canvas,
        buttons: buttons,
        buttonHandler: new ButtonProcessor(),
        loopID: null as null | number,
        stopped: false,
        dt: 0,
        fixedDt: 1 / 50,
        maxStep: opt.maxTimeStep ?? 0.1,
        restDt: 0,
        time: 0,
        realTime: 0,
        rawFPSCounter: new FPSCounter(),
        fpsCounter: new FPSCounter(),
        timeScale: 1,
        skipTime: false,
        isHidden: false,
        numFrames: 0,
        capsOn: false,
        mousePos: new Vec2(0),
        mouseDeltaPos: new Vec2(0),
        keyState: new ButtonState<Key>(
            "keyPress",
            "keyPressRepeat",
            "keyDown",
            "keyRelease",
        ),
        mouseState: new ButtonState<MouseButton>(
            "mousePress",
            null,
            "mouseDown",
            "mouseRelease",
        ),
        mergedGamepadState: new GamepadState(null),
        gamepadStates: new Map<number, GamepadState>(),
        lastInputDevice: null as "mouse" | "keyboard" | "gamepad" | null,
        // unified input state
        gamepads: [] as KGamepad[],
        charInputted: [] as string[],
        isMouseMoved: false,
        lastWidth: opt.canvas.offsetWidth,
        lastHeight: opt.canvas.offsetHeight,
        events: new KEventHandler<AppEventMap>(),
    };
};

/**
 * Create the App, the context, and handler for all things related to the game
 * canvas, input, and DOM interaction.
 *
 * @ignore
 *
 * @param opt - Options.
 *
 * @returns The app context.
 */
export const initApp = (
    opt: {
        canvas: HTMLCanvasElement;
    } & KAPLAYOpt,
) => {
    if (!opt.canvas) {
        throw new Error("Please provide a canvas");
    }

    const state = initAppState(opt);
    parseButtonBindings(state);
    if (opt.fixedUpdateMode) setFixedSpeed(opt.fixedUpdateMode);

    function dt() {
        return state.dt * state.timeScale;
    }

    function fixedDt() {
        return state.fixedDt * state.timeScale;
    }

    function restDt() {
        return state.restDt * state.timeScale;
    }

    function isHidden() {
        return state.isHidden;
    }

    function time() {
        return state.time;
    }

    function fps() {
        return state.fpsCounter.fps;
    }

    function rawFPS() {
        return state.rawFPSCounter.fps;
    }

    function numFrames() {
        return state.numFrames;
    }

    function screenshot(): string {
        return state.canvas.toDataURL();
    }

    function screenshotToBlob(): Promise<Blob> {
        return new Promise<Blob>((resolve, reject) => {
            state.canvas.toBlob(b => {
                if (b !== null) resolve(b);
                else reject(new Error("failed to make blob"));
            });
        });
    }

    function setCursor(c: Cursor): void {
        state.canvas.style.cursor = c;
    }

    function getCursor(): Cursor {
        return state.canvas.style.cursor;
    }

    function setCursorLocked(b: boolean): void {
        if (b) {
            try {
                const res = state.canvas
                    .requestPointerLock() as unknown as Promise<void>;
                if (res?.catch) {
                    res.catch((e) => console.error(e));
                }
            } catch (e) {
                console.error(e);
            }
        }
        else {
            document.exitPointerLock();
        }
    }

    function isCursorLocked(): boolean {
        return !!document.pointerLockElement;
    }

    // wrappers around full screen functions to work across browsers
    function enterFullscreen(el: HTMLElement) {
        if (el.requestFullscreen) el.requestFullscreen();
        // @ts-ignore
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }

    function exitFullscreen() {
        if (document.exitFullscreen) document.exitFullscreen();
        // @ts-ignore
        else if (document.webkitExitFullScreen) document.webkitExitFullScreen();
    }

    function setFullscreen(f: boolean = true) {
        if (f) {
            enterFullscreen(state.canvas);
        }
        else {
            exitFullscreen();
        }
    }

    function isFullscreen(): boolean {
        return document.fullscreenElement === state.canvas
            // @ts-ignore
            || document.webkitFullscreenElement === state.canvas;
    }

    const isFocused = () => {
        return document.activeElement === state.canvas;
    };

    function quit() {
        state.stopped = true;
        const ce = Object.entries(canvasEvents);
        const de = Object.entries(docEvents);
        const we = Object.entries(winEvents);
        type EL = EventListenerOrEventListenerObject;
        for (const [name, val] of ce) {
            state.canvas.removeEventListener(name, val as EL);
        }
        for (const [name, val] of de) {
            document.removeEventListener(name, val as EL);
        }
        for (const [name, val] of we) {
            window.removeEventListener(name, val as EL);
        }
        resizeObserver.disconnect();
    }

    function setFixedSpeed(speed: FixedSpeedOption) {
        const fps = fixedSpeeds[speed];
        if (!fps) throw new Error("Unknown fixed speed " + speed);
        state.fixedDt = 1 / fps;
    }

    function run(
        fixedUpdate: () => void,
        update: (processInput: () => void, resetInput: () => void) => void,
    ) {
        if (state.loopID !== null) {
            cancelAnimationFrame(state.loopID);
        }

        let fixedUpdateAccumulator = 0;
        let updateAccumulator = 0;

        const frame = (t: number) => {
            state.loopID = null;
            if (state.stopped) return;

            // TODO: allow background actions?
            if (document.visibilityState !== "visible") {
                state.loopID = requestAnimationFrame(frame);
                return;
            }

            const currentTime = t / 1000;
            const unclampedDt = currentTime - state.realTime;
            const observedDt = Math.min(unclampedDt, state.maxStep);

            state.rawFPSCounter.tick(unclampedDt);
            state.realTime = currentTime;

            if (state.skipTime) {
                state.skipTime = false;
            }
            else {
                updateAccumulator += observedDt;
                fixedUpdateAccumulator += observedDt;

                if (fixedUpdateAccumulator > state.fixedDt) {
                    state.dt = state.fixedDt;
                    state.restDt = 0;
                    while (fixedUpdateAccumulator > state.fixedDt) {
                        fixedUpdateAccumulator -= state.fixedDt;
                        if (fixedUpdateAccumulator < state.fixedDt) {
                            state.restDt = fixedUpdateAccumulator;
                        }
                        fixedUpdate();
                    }
                }
                const desiredDt = opt.maxFPS ? 1 / opt.maxFPS : 0;
                if (updateAccumulator > desiredDt) {
                    state.time += state.dt = desiredDt > 0
                        ? Math.max(desiredDt, observedDt)
                        : observedDt;
                    state.restDt = fixedUpdateAccumulator;
                    state.fpsCounter.tick(state.dt);
                    if (desiredDt > 0) {
                        updateAccumulator -= desiredDt;
                    }
                    else {
                        updateAccumulator = 0;
                    }
                    state.numFrames++;

                    update(processInput, resetInput);
                }
            }
            state.loopID = requestAnimationFrame(frame);
        };

        frame(0);
    }

    function isTouchscreen() {
        return ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
    }

    function mousePos(): Vec2 {
        return state.mousePos.clone();
    }

    function mouseDeltaPos(): Vec2 {
        return state.mouseDeltaPos.clone();
    }

    function isMousePressed(m: MouseButton = "left"): boolean {
        return state.mouseState.pressed.has(m);
    }

    function isMouseDown(m: MouseButton = "left"): boolean {
        return state.mouseState.down.has(m);
    }

    function isMouseReleased(m: MouseButton = "left"): boolean {
        return state.mouseState.released.has(m);
    }

    function isMouseMoved(): boolean {
        return state.isMouseMoved;
    }

    function isKeyPressed(k?: Key | Key[]): boolean {
        return k === undefined
            ? state.keyState.pressed.size > 0
            : setHasOrIncludes(state.keyState.pressed, k);
    }

    function isKeyPressedRepeat(k?: Key | Key[]): boolean {
        return k === undefined
            ? state.keyState.pressedRepeat.size > 0
            : setHasOrIncludes(state.keyState.pressedRepeat, k);
    }

    function isKeyDown(k?: Key | Key[]): boolean {
        return k === undefined
            ? state.keyState.down.size > 0
            : setHasOrIncludes(state.keyState.down, k);
    }

    function isKeyReleased(k?: Key | Key[]): boolean {
        return k === undefined
            ? state.keyState.released.size > 0
            : setHasOrIncludes(state.keyState.released, k);
    }

    function isGamepadButtonPressed(
        btn?: KGamepadButton | KGamepadButton[],
    ): boolean {
        return btn === undefined
            ? state.mergedGamepadState.buttonState.pressed.size > 0
            : setHasOrIncludes(
                state.mergedGamepadState.buttonState.pressed,
                btn,
            );
    }

    function isGamepadButtonDown(
        btn?: KGamepadButton | KGamepadButton[],
    ): boolean {
        return btn === undefined
            ? state.mergedGamepadState.buttonState.down.size > 0
            : setHasOrIncludes(state.mergedGamepadState.buttonState.down, btn);
    }

    function isGamepadButtonReleased(
        btn?: KGamepadButton | KGamepadButton[],
    ): boolean {
        return btn === undefined
            ? state.mergedGamepadState.buttonState.released.size > 0
            : setHasOrIncludes(
                state.mergedGamepadState.buttonState.released,
                btn,
            );
    }

    function getGamepadAnalogButton(
        btn: KGamepadButton,
    ): number {
        return state.mergedGamepadState.analogState.get(btn) ?? 0;
    }

    function isButtonPressed(btn?: string | string[]): boolean {
        return btn === undefined
            ? state.buttonHandler.state.pressed.size > 0
            : setHasOrIncludes(state.buttonHandler.state.pressed, btn);
    }

    function isButtonDown(btn?: string | string[]): boolean {
        return btn === undefined
            ? state.buttonHandler.state.down.size > 0
            : setHasOrIncludes(state.buttonHandler.state.down, btn);
    }

    function isButtonReleased(btn?: string | string[]): boolean {
        return btn === undefined
            ? state.buttonHandler.state.released.size > 0
            : setHasOrIncludes(state.buttonHandler.state.released, btn);
    }

    function onResize(action: () => void): KEventController {
        return state.events.on("resize", action);
    }

    // input callbacks
    const onKeyDown = overload2((action: (key: Key) => void) => {
        return state.events.on("keyDown", action);
    }, (key: Key | Key[], action: (key: Key) => void) => {
        return state.events.on(
            "keyDown",
            (k) => isEqOrIncludes(key, k) && action(k),
        );
    });

    // key pressed is equal to the key by the user
    const onKeyPress = overload2((action: (key: Key) => void) => {
        return state.events.on("keyPress", (k) => action(k));
    }, (key: Key | Key[], action: (key: Key) => void) => {
        return state.events.on(
            "keyPress",
            (k) => isEqOrIncludes(key, k) && action(k),
        );
    });

    const onKeyPressRepeat = overload2((action: (key: Key) => void) => {
        return state.events.on("keyPressRepeat", action);
    }, (key: Key | Key[], action: (key: Key) => void) => {
        return state.events.on(
            "keyPressRepeat",
            (k) => isEqOrIncludes(key, k) && action(k),
        );
    });

    const onKeyRelease = overload2((action: (key: Key) => void) => {
        return state.events.on("keyRelease", action);
    }, (key: Key | Key[], action: (key: Key) => void) => {
        return state.events.on(
            "keyRelease",
            (k) => isEqOrIncludes(key, k) && action(k),
        );
    });

    const onMouseDown = overload2((action: (m: MouseButton) => void) => {
        return state.events.on("mouseDown", (m) => action(m));
    }, (
        mouse: MouseButton | MouseButton[],
        action: (m: MouseButton) => void,
    ) => {
        return state.events.on(
            "mouseDown",
            (m) => isEqOrIncludes(mouse, m) && action(m),
        );
    });

    const onMousePress = overload2((action: (m: MouseButton) => void) => {
        return state.events.on("mousePress", (m) => action(m));
    }, (
        mouse: MouseButton | MouseButton[],
        action: (m: MouseButton) => void,
    ) => {
        return state.events.on(
            "mousePress",
            (m) => isEqOrIncludes(mouse, m) && action(m),
        );
    });

    const onMouseRelease = overload2((action: (m: MouseButton) => void) => {
        return state.events.on("mouseRelease", (m) => action(m));
    }, (
        mouse: MouseButton | MouseButton[],
        action: (m: MouseButton) => void,
    ) => {
        return state.events.on("mouseRelease", (m) => m === mouse && action(m));
    });

    function onMouseMove(f: (pos: Vec2, dpos: Vec2) => void): KEventController {
        return state.events.on(
            "mouseMove",
            () => f(mousePos(), mouseDeltaPos()),
        );
    }

    function onCharInput(action: (ch: string) => void): KEventController {
        return state.events.on("charInput", action);
    }

    function onTouchStart(f: (pos: Vec2, t: Touch) => void): KEventController {
        return state.events.on("touchStart", f);
    }

    function onTouchMove(f: (pos: Vec2, t: Touch) => void): KEventController {
        return state.events.on("touchMove", f);
    }

    function onTouchEnd(f: (pos: Vec2, t: Touch) => void): KEventController {
        return state.events.on("touchEnd", f);
    }

    function onScroll(action: (delta: Vec2) => void): KEventController {
        return state.events.on("scroll", action);
    }

    function onHide(action: () => void): KEventController {
        deprecateMsg("onHide", "onTabHide");
        return onTabHide(action);
    }

    function onShow(action: () => void): KEventController {
        deprecateMsg("onShow", "onTabShow");
        return onTabShow(action);
    }

    function onTabHide(action: () => void): KEventController {
        return state.events.on("show", action);
    }

    function onTabShow(action: () => void): KEventController {
        return state.events.on("show", action);
    }

    const onGamepadButtonPress = overload2(
        (action: (btn: KGamepadButton, gamepad: KGamepad) => void) => {
            return state.events.on(
                "gamepadButtonPress",
                (b, gp) => action(b, gp),
            );
        },
        (
            btn: KGamepadButton | KGamepadButton[],
            action: (btn: KGamepadButton, gamepad: KGamepad) => void,
        ) => {
            return state.events.on(
                "gamepadButtonPress",
                (b, gp) => isEqOrIncludes(btn, b) && action(b, gp),
            );
        },
    );

    const onGamepadButtonDown = overload2(
        (action: (btn: KGamepadButton, gamepad: KGamepad) => void) => {
            return state.events.on(
                "gamepadButtonDown",
                (b, gp) => action(b, gp),
            );
        },
        (
            btn: KGamepadButton,
            action: (btn: KGamepadButton, gamepad: KGamepad) => void,
        ) => {
            return state.events.on(
                "gamepadButtonDown",
                (b, gp) => isEqOrIncludes(btn, b) && action(b, gp),
            );
        },
    );

    const onGamepadButtonRelease = overload2(
        (action: (btn: KGamepadButton, gamepad: KGamepad) => void) => {
            return state.events.on(
                "gamepadButtonRelease",
                (b, gp) => action(b, gp),
            );
        },
        (
            btn: KGamepadButton | KGamepadButton[],
            action: (btn: KGamepadButton, gamepad: KGamepad) => void,
        ) => {
            return state.events.on(
                "gamepadButtonRelease",
                (b, gp) => isEqOrIncludes(btn, b) && action(b, gp),
            );
        },
    );

    function onGamepadStick(
        stick: KGamepadStick,
        action: (value: Vec2, gp: KGamepad) => void,
    ): KEventController {
        return state.events.on(
            "gamepadStick",
            (a, v, gp) => a === stick && action(v, gp),
        );
    }

    function onGamepadConnect(action: (gamepad: KGamepad) => void) {
        return state.events.on("gamepadConnect", action);
    }

    function onGamepadDisconnect(action: (gamepad: KGamepad) => void) {
        return state.events.on("gamepadDisconnect", action);
    }

    function getGamepadStick(stick: KGamepadStick): Vec2 {
        return state.mergedGamepadState.stickState.get(stick) || new Vec2(0);
    }

    function charInputted(): string[] {
        return [...state.charInputted];
    }

    function getGamepads(): KGamepad[] {
        return [...state.gamepads];
    }

    const onButtonPress = overload2((action: (btn: string) => void) => {
        return state.events.on("buttonPress", (b) => action(b));
    }, (btn: string | string, action: (btn: string) => void) => {
        return state.events.on(
            "buttonPress",
            (b) => isEqOrIncludes(btn, b) && action(b),
        );
    });

    const onButtonDown = overload2((action: (btn: string) => void) => {
        return state.events.on("buttonDown", (b) => action(b));
    }, (btn: string | string, action: (btn: string) => void) => {
        return state.events.on(
            "buttonDown",
            (b) => isEqOrIncludes(btn, b) && action(b),
        );
    });

    const onButtonRelease = overload2((action: (btn: string) => void) => {
        return state.events.on("buttonRelease", (b) => action(b));
    }, (btn: string | string, action: (btn: string) => void) => {
        return state.events.on(
            "buttonRelease",
            (b) => isEqOrIncludes(btn, b) && action(b),
        );
    });

    const getLastInputDeviceType = () => {
        return state.lastInputDevice;
    };

    function processInput() {
        state.events.trigger("input");
        processGamepad();
        state.keyState.process(state);
        state.mouseState.process(state);
        state.buttonHandler.process(state);
    }

    function resetInput() {
        state.keyState.update();
        state.mouseState.update();
        state.buttonHandler.update();

        state.mergedGamepadState.buttonState.update();
        state.mergedGamepadState.stickState.forEach((v, k) => {
            state.mergedGamepadState.stickState.set(k, new Vec2(0));
        });
        state.mergedGamepadState.analogState.forEach((v, k) => {
            state.mergedGamepadState.analogState.set(k, 0);
        });

        state.charInputted = [];
        state.isMouseMoved = false;
        state.mouseDeltaPos = new Vec2(0);

        state.gamepadStates.forEach((s) => {
            s.buttonState.update();
            s.stickState.forEach((v, k) => {
                s.stickState.set(k, new Vec2(0));
            });
            s.analogState.forEach((v, k) => {
                s.analogState.set(k, 0);
            });
        });
    }

    function registerGamepad(browserGamepad: Gamepad) {
        const gamepad: KGamepad = {
            index: browserGamepad.index,
            isPressed: (btn: KGamepadButton) => {
                return state.gamepadStates.get(browserGamepad.index)
                    ?.buttonState
                    .pressed.has(btn) || false;
            },
            isDown: (btn: KGamepadButton) => {
                return state.gamepadStates.get(browserGamepad.index)
                    ?.buttonState
                    .down.has(btn) || false;
            },
            isReleased: (btn: KGamepadButton) => {
                return state.gamepadStates.get(browserGamepad.index)
                    ?.buttonState
                    .released.has(btn) || false;
            },
            getStick: (stick: KGamepadStick) => {
                return state.gamepadStates.get(browserGamepad.index)?.stickState
                    .get(stick) || vec2();
            },
            getAnalog: (button: KGamepadButton) => {
                return state.gamepadStates.get(browserGamepad.index)
                    ?.analogState.get(button) ?? 0;
            },
        };

        state.gamepads.push(gamepad);

        state.gamepadStates.set(
            browserGamepad.index,
            new GamepadState(gamepad),
        );

        return gamepad;
    }

    function removeGamepad(gamepad: Gamepad) {
        state.gamepads = state.gamepads.filter((g) =>
            g.index !== gamepad.index
        );
        state.gamepadStates.delete(gamepad.index);
    }

    // TODO: Clean up this function
    function processGamepad() {
        for (const browserGamepad of navigator.getGamepads()) {
            if (
                browserGamepad && !state.gamepadStates.has(
                    browserGamepad.index,
                )
            ) {
                registerGamepad(browserGamepad);
            }
        }

        for (const gamepad of state.gamepads) {
            const browserGamepad = navigator.getGamepads()[gamepad.index];
            if (!browserGamepad) continue;

            const customMap = opt.gamepads ?? {};
            const map = customMap[browserGamepad.id]
                || GP_MAP[browserGamepad.id] || GP_MAP["default"];
            const gamepadState = state.gamepadStates.get(gamepad.index);
            if (!gamepadState) continue;

            for (let i = 0; i < browserGamepad.buttons.length; i++) {
                const gamepadBtn = map.buttons[i];
                const browserGamepadBtn = browserGamepad.buttons[i];

                gamepadState.analogState.set(
                    gamepadBtn,
                    browserGamepadBtn.value,
                );
                state.mergedGamepadState.analogState.set(
                    gamepadBtn,
                    browserGamepadBtn.value,
                );

                if (browserGamepadBtn.pressed) {
                    if (gamepadState.buttonState.down.has(gamepadBtn)) {
                        gamepadState.buttonState.process(state);
                        continue;
                    }

                    state.lastInputDevice = "gamepad";
                    state.buttonHandler.processGamepadButtonDown(
                        gamepadBtn,
                        state,
                    );

                    state.mergedGamepadState.buttonState.press(
                        gamepadBtn,
                        state,
                    );
                    gamepadState.buttonState.press(gamepadBtn, state);
                }
                else if (gamepadState.buttonState.down.has(gamepadBtn)) {
                    state.buttonHandler.processGamepadButtonUp(
                        gamepadBtn,
                        state,
                    );

                    state.mergedGamepadState.buttonState.release(
                        gamepadBtn,
                        state,
                    );
                    gamepadState.buttonState.release(gamepadBtn, state);
                }
            }

            for (const stickName in map.sticks) {
                const stick = map.sticks[stickName as KGamepadStick];
                if (!stick) continue;
                const value = new Vec2(
                    browserGamepad.axes[stick.x],
                    browserGamepad.axes[stick.y],
                );
                gamepadState.stickState.set(stickName as KGamepadStick, value);
                state.mergedGamepadState.stickState.set(
                    stickName as KGamepadStick,
                    value,
                );
                state.events.trigger("gamepadStick", stickName, value, gamepad);
            }
        }
    }

    type EventList<M> = {
        [event in keyof M]?: (event: M[event]) => void;
    };

    const canvasEvents: EventList<HTMLElementEventMap> = {};
    const docEvents: EventList<DocumentEventMap> = {};
    const winEvents: EventList<WindowEventMap> = {};

    const pd = opt.pixelDensity || 1;

    canvasEvents.mousemove = (e) => {
        // 🍝 Here we depend of GFX Context even if initGfx needs initApp for being used
        // Letterbox creates some black bars so we need to remove that for calculating
        // mouse position

        // Ironically, e.offsetX and e.offsetY are the mouse position. Is not
        // related to what we call the "offset" in this code
        const mousePos = canvasToViewport(new Vec2(e.offsetX, e.offsetY));
        const mouseDeltaPos = new Vec2(e.movementX, e.movementY);

        if (isFullscreen()) {
            const cw = state.canvas.width / pd;
            const ch = state.canvas.height / pd;
            const ww = window.innerWidth;
            const wh = window.innerHeight;
            const rw = ww / wh;
            const rc = cw / ch;
            if (rw > rc) {
                const ratio = wh / ch;
                const offset = (ww - (cw * ratio)) / 2;
                mousePos.x = map(e.offsetX - offset, 0, cw * ratio, 0, cw);
                mousePos.y = map(e.offsetY, 0, ch * ratio, 0, ch);
            }
            else {
                const ratio = ww / cw;
                const offset = (wh - (ch * ratio)) / 2;
                mousePos.x = map(e.offsetX, 0, cw * ratio, 0, cw);
                mousePos.y = map(e.offsetY - offset, 0, ch * ratio, 0, ch);
            }
        }

        state.lastInputDevice = "mouse";
        state.events.onOnce("input", () => {
            state.isMouseMoved = true;
            state.mousePos = mousePos;
            state.mouseDeltaPos = mouseDeltaPos;
            state.events.trigger("mouseMove");
        });
    };

    const MOUSE_BUTTONS: MouseButton[] = [
        "left",
        "middle",
        "right",
        "back",
        "forward",
    ];

    canvasEvents.mousedown = (e) => {
        state.events.onOnce("input", () => {
            const m = MOUSE_BUTTONS[e.button];
            if (!m) return;

            state.lastInputDevice = "mouse";
            state.buttonHandler.processMousedown(m, state);
            state.mouseState.press(m, state);
        });
    };

    canvasEvents.mouseup = (e) => {
        state.events.onOnce("input", () => {
            const m = MOUSE_BUTTONS[e.button];
            if (!m) return;

            state.buttonHandler.processMouseup(m, state);
            state.mouseState.release(m, state);
        });
    };

    const PREVENT_DEFAULT_KEYS = new Set([
        " ",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Tab",
    ]);

    // translate these key names to a simpler version
    const KEY_ALIAS = {
        "ArrowLeft": "left",
        "ArrowRight": "right",
        "ArrowUp": "up",
        "ArrowDown": "down",
        " ": "space",
    };

    canvasEvents.keydown = (e) => {
        state.capsOn = e.getModifierState("CapsLock");

        if (PREVENT_DEFAULT_KEYS.has(e.key)) {
            e.preventDefault();
        }
        state.events.onOnce("input", () => {
            const k: Key = KEY_ALIAS[e.key as keyof typeof KEY_ALIAS] as Key
                || e.key.toLowerCase();
            const code = e.code;

            if (k === undefined) throw new Error(`Unknown key: ${e.key}`);
            if (k.length === 1) {
                state.events.trigger("charInput", k);
                state.charInputted.push(k);
            }
            else if (k === "space") {
                state.events.trigger("charInput", " ");
                state.charInputted.push(" ");
            }
            if (e.repeat) {
                state.keyState.pressRepeat(k, state);
            }
            else {
                state.lastInputDevice = "keyboard";
                state.buttonHandler.processKeydown(k, code, state);
                state.keyState.press(k, state);
            }
        });
    };

    canvasEvents.keyup = (e) => {
        state.events.onOnce("input", () => {
            const k: Key = KEY_ALIAS[e.key as keyof typeof KEY_ALIAS] as Key
                || e.key.toLowerCase();
            const code = e.code;

            state.buttonHandler.processKeyup(k, code, state);
            state.keyState.release(k, state);
        });
    };

    // TODO: handle all touches at once instead of sequentially
    canvasEvents.touchstart = (e) => {
        // disable long tap context menu
        e.preventDefault();

        state.events.onOnce("input", () => {
            const touches = [...e.changedTouches];
            const box = state.canvas.getBoundingClientRect();

            if (opt.touchToMouse !== false) {
                state.mousePos = canvasToViewport(
                    new Vec2(
                        touches[0].clientX - box.x,
                        touches[0].clientY - box.y,
                    ),
                );
                state.lastInputDevice = "mouse";
                state.buttonHandler.processMousedown("left", state);
                state.mouseState.press("left", state);
            }

            touches.forEach((t) => {
                state.events.trigger(
                    "touchStart",
                    canvasToViewport(
                        new Vec2(
                            t.clientX - box.x,
                            t.clientY - box.y,
                        ),
                    ),
                    t,
                );
            });
        });
    };

    canvasEvents.touchmove = (e) => {
        // disable scrolling
        e.preventDefault();
        state.events.onOnce("input", () => {
            const touches = [...e.changedTouches];
            const box = state.canvas.getBoundingClientRect();

            if (opt.touchToMouse !== false) {
                const lastMousePos = state.mousePos;
                state.mousePos = canvasToViewport(
                    new Vec2(
                        touches[0].clientX - box.x,
                        touches[0].clientY - box.y,
                    ),
                );
                state.mouseDeltaPos = state.mousePos.sub(lastMousePos);
                state.events.trigger("mouseMove");
            }

            touches.forEach((t) => {
                state.events.trigger(
                    "touchMove",
                    canvasToViewport(
                        new Vec2(
                            t.clientX - box.x,
                            t.clientY - box.y,
                        ),
                    ),
                    t,
                );
            });
        });
    };

    canvasEvents.touchend = (e) => {
        state.events.onOnce("input", () => {
            const touches = [...e.changedTouches];
            const box = state.canvas.getBoundingClientRect();

            if (opt.touchToMouse != false) {
                state.mousePos = canvasToViewport(
                    new Vec2(
                        touches[0].clientX - box.x,
                        touches[0].clientY - box.y,
                    ),
                );
                state.mouseDeltaPos = new Vec2(0, 0);
                state.buttonHandler.processMouseup("left", state);
                state.mouseState.release("left", state);
            }

            touches.forEach((t) => {
                state.events.trigger(
                    "touchEnd",
                    canvasToViewport(
                        new Vec2(
                            t.clientX - box.x,
                            t.clientY - box.y,
                        ),
                    ),
                    t,
                );
            });
        });
    };

    canvasEvents.touchcancel = (e) => {
        state.events.onOnce("input", () => {
            const touches = [...e.changedTouches];
            const box = state.canvas.getBoundingClientRect();

            if (opt.touchToMouse !== false) {
                state.mousePos = canvasToViewport(
                    new Vec2(
                        touches[0].clientX - box.x,
                        touches[0].clientY - box.y,
                    ),
                );
                state.mouseState.release("left", state);
            }

            touches.forEach((t) => {
                state.events.trigger(
                    "touchEnd",
                    canvasToViewport(
                        new Vec2(
                            t.clientX - box.x,
                            t.clientY - box.y,
                        ),
                    ),
                    t,
                );
            });
        });
    };

    // TODO: option to not prevent default?
    canvasEvents.wheel = (e) => {
        e.preventDefault();
        state.events.onOnce("input", () => {
            state.events.trigger("scroll", new Vec2(e.deltaX, e.deltaY));
        });
    };

    canvasEvents.contextmenu = (e) => e.preventDefault();

    docEvents.visibilitychange = () => {
        if (document.visibilityState === "visible") {
            // prevent a surge of dt when switch back after the tab being hidden for a while
            state.skipTime = true;
            state.isHidden = false;
            state.events.trigger("show");
        }
        else {
            state.isHidden = true;
            state.events.trigger("hide");
        }
    };

    winEvents.gamepadconnected = (e) => {
        const kbGamepad = registerGamepad(e.gamepad);
        state.events.onOnce("input", () => {
            state.events.trigger("gamepadConnect", kbGamepad);
        });
    };

    winEvents.gamepaddisconnected = (e) => {
        const kbGamepad =
            getGamepads().filter((g) => g.index === e.gamepad.index)[0];
        removeGamepad(e.gamepad);
        state.events.onOnce("input", () => {
            state.events.trigger("gamepadDisconnect", kbGamepad);
        });
    };

    for (const [name, val] of Object.entries(canvasEvents)) {
        state.canvas.addEventListener(
            name,
            val as EventListenerOrEventListenerObject,
        );
    }

    for (const [name, val] of Object.entries(docEvents)) {
        document.addEventListener(
            name,
            val as EventListenerOrEventListenerObject,
        );
    }

    for (const [name, val] of Object.entries(winEvents)) {
        window.addEventListener(
            name,
            val as EventListenerOrEventListenerObject,
        );
    }

    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            if (entry.target !== state.canvas) continue;
            if (
                state.lastWidth === state.canvas.offsetWidth
                && state.lastHeight === state.canvas.offsetHeight
            ) return;
            state.lastWidth = state.canvas.offsetWidth;
            state.lastHeight = state.canvas.offsetHeight;
            state.events.onOnce("input", () => {
                state.events.trigger("resize");
            });
        }
    });

    resizeObserver.observe(state.canvas);

    return {
        state,
        dt,
        fixedDt,
        restDt,
        time,
        run,
        canvas: state.canvas,
        fps,
        rawFPS,
        setFixedSpeed,
        numFrames,
        quit,
        isHidden,
        setFullscreen,
        isFullscreen,
        setCursor,
        screenshot,
        screenshotToBlob,
        getGamepads,
        getCursor,
        setCursorLocked,
        isCursorLocked,
        isTouchscreen,
        mousePos,
        mouseDeltaPos,
        isKeyDown,
        isKeyPressed,
        isKeyPressedRepeat,
        isKeyReleased,
        isMouseDown,
        isMousePressed,
        isMouseReleased,
        isMouseMoved,
        isGamepadButtonPressed,
        isGamepadButtonDown,
        isGamepadButtonReleased,
        isFocused,
        getGamepadStick,
        getGamepadAnalogButton,
        isButtonPressed,
        isButtonDown,
        isButtonReleased,
        getButton,
        getButtons,
        setButton,
        pressButton,
        releaseButton,
        charInputted,
        onResize,
        onKeyDown,
        onKeyPress,
        onKeyPressRepeat,
        onKeyRelease,
        onMouseDown,
        onMousePress,
        onMouseRelease,
        onMouseMove,
        onCharInput,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        onScroll,
        onHide,
        onShow,
        onTabHide,
        onTabShow,
        onGamepadButtonDown,
        onGamepadButtonPress,
        onGamepadButtonRelease,
        onGamepadStick,
        onGamepadConnect,
        onGamepadDisconnect,
        onButtonPress,
        onButtonDown,
        onButtonRelease,
        getLastInputDeviceType,
        events: state.events,
    };
};

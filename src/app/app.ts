// everything related to canvas, game loop and input

import type {
    Cursor,
    GamepadDef,
    GamepadStick,
    Key,
    KGamePad,
    KGamepadButton,
    MouseButton,
} from "../types";

import { map, Vec2, vec2 } from "../math/math";

import {
    isEqOrIncludes,
    KEventController,
    KEventHandler,
    overload2,
    setHasOrIncludes,
} from "../utils";

import GAMEPAD_MAP from "../data/gamepad.json";
import {
    type ButtonBinding,
    type ButtonsDef,
    getLastInputDeviceType,
    parseButtonBindings,
} from "./inputBindings";

export class ButtonState<T = string> {
    pressed: Set<T> = new Set([]);
    pressedRepeat: Set<T> = new Set([]);
    released: Set<T> = new Set([]);
    down: Set<T> = new Set([]);
    update() {
        this.pressed.clear();
        this.released.clear();
        this.pressedRepeat.clear();
    }
    press(btn: T) {
        this.pressed.add(btn);
        this.pressedRepeat.add(btn);
        this.down.add(btn);
    }
    pressRepeat(btn: T) {
        this.pressedRepeat.add(btn);
    }
    release(btn: T) {
        this.down.delete(btn);
        this.pressed.delete(btn);
        this.released.add(btn);
    }
}

class GamepadState {
    buttonState: ButtonState<KGamepadButton> = new ButtonState();
    stickState: Map<GamepadStick, Vec2> = new Map();
}

class FPSCounter {
    private dts: number[] = [];
    private timer: number = 0;
    fps: number = 0;
    tick(dt: number) {
        this.dts.push(dt);
        this.timer += dt;
        if (this.timer >= 1) {
            this.timer = 0;
            this.fps = Math.round(
                1 / (this.dts.reduce((a, b) => a + b) / this.dts.length),
            );
            this.dts = [];
        }
    }
}

export type App = ReturnType<typeof initApp>;
export type AppState = ReturnType<typeof initAppState>;

export let appState: AppState;

export const initAppState = (opt: {
    canvas: HTMLCanvasElement;
    touchToMouse?: boolean;
    gamepads?: Record<string, GamepadDef>;
    pixelDensity?: number;
    maxFPS?: number;
    buttons?: ButtonsDef;
}) => {
    const buttons = opt.buttons ?? {};

    return {
        canvas: opt.canvas,
        buttons: buttons,
        buttonsByKey: new Map<Key, string[]>(),
        buttonsByMouse: new Map<MouseButton, string[]>(),
        buttonsByGamepad: new Map<KGamepadButton, string[]>(),
        loopID: null as null | number,
        stopped: false,
        dt: 0,
        fixedDt: 1 / 50,
        restDt: 0,
        time: 0,
        realTime: 0,
        fpsCounter: new FPSCounter(),
        timeScale: 1,
        skipTime: false,
        isHidden: false,
        numFrames: 0,
        mousePos: new Vec2(0),
        mouseDeltaPos: new Vec2(0),
        keyState: new ButtonState<Key>(),
        mouseState: new ButtonState<MouseButton>(),
        mergedGamepadState: new GamepadState(),
        gamepadStates: new Map<number, GamepadState>(),
        lastInputDevice: null as "mouse" | "keyboard" | "gamepad" | null,
        // unified input state
        buttonState: new ButtonState<string>(),
        gamepads: [] as KGamePad[],
        charInputted: [] as string[],
        isMouseMoved: false,
        lastWidth: opt.canvas.offsetWidth,
        lastHeight: opt.canvas.offsetHeight,
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
            gamepadButtonDown: [KGamepadButton];
            gamepadButtonPress: [KGamepadButton];
            gamepadButtonRelease: [KGamepadButton];
            gamepadStick: [string, Vec2];
            gamepadConnect: [KGamePad];
            gamepadDisconnect: [KGamePad];
            buttonDown: [string];
            buttonPress: [string];
            buttonRelease: [string];
            scroll: [Vec2];
            hide: [];
            show: [];
            resize: [];
            input: [];
        }>(),
    };
};

export const initApp = (opt: {
    canvas: HTMLCanvasElement;
    touchToMouse?: boolean;
    gamepads?: Record<string, GamepadDef>;
    pixelDensity?: number;
    maxFPS?: number;
    buttons?: ButtonsDef;
}) => {
    if (!opt.canvas) {
        throw new Error("Please provide a canvas");
    }

    const state = initAppState(opt);
    appState = state;
    parseButtonBindings();

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

    function numFrames() {
        return state.numFrames;
    }

    function screenshot(): string {
        return state.canvas.toDataURL();
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
                if (res.catch) {
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

    function run(fixedUpdate: () => void, update: () => void) {
        if (state.loopID !== null) {
            cancelAnimationFrame(state.loopID);
        }

        let fixedAccumulatedDt = 0;
        let accumulatedDt = 0;

        const frame = (t: number) => {
            if (state.stopped) return;

            // TODO: allow background actions?
            if (document.visibilityState !== "visible") {
                state.loopID = requestAnimationFrame(frame);
                return;
            }

            const loopTime = t / 1000;
            const realDt = Math.min(loopTime - state.realTime, 0.25);
            const desiredDt = opt.maxFPS ? 1 / opt.maxFPS : 0;

            state.realTime = loopTime;
            accumulatedDt += realDt;

            if (accumulatedDt > desiredDt) {
                if (!state.skipTime) {
                    fixedAccumulatedDt += accumulatedDt;
                    state.dt = state.fixedDt;
                    state.restDt = 0;
                    while (fixedAccumulatedDt > state.fixedDt) {
                        fixedAccumulatedDt -= state.fixedDt;
                        if (fixedAccumulatedDt < state.fixedDt) {
                            state.restDt = fixedAccumulatedDt;
                        }
                        fixedUpdate();
                    }
                    state.restDt = fixedAccumulatedDt;
                    state.dt = accumulatedDt;
                    state.time += dt();
                    state.fpsCounter.tick(state.dt);
                }
                accumulatedDt = 0;
                state.skipTime = false;
                state.numFrames++;
                processInput();
                update();
                resetInput();
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

    function isButtonPressed(btn?: string | string[]): boolean {
        return btn === undefined
            ? state.buttonState.pressed.size > 0
            : setHasOrIncludes(state.buttonState.pressed, btn);
    }

    function isButtonDown(btn?: string | string[]): boolean {
        return btn === undefined
            ? state.buttonState.down.size > 0
            : setHasOrIncludes(state.buttonState.down, btn);
    }

    function isButtonReleased(btn?: string | string[]): boolean {
        return btn === undefined
            ? state.buttonState.released.size > 0
            : setHasOrIncludes(state.buttonState.released, btn);
    }

    function getButton(btn: string): ButtonBinding {
        return state.buttons?.[btn];
    }

    function setButton(btn: string, binding: ButtonBinding) {
        state.buttons[btn] = {
            ...state.buttons[btn],
            ...binding,
        };
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
        return state.events.on("hide", action);
    }

    function onShow(action: () => void): KEventController {
        return state.events.on("show", action);
    }

    const onGamepadButtonPress = overload2(
        (action: (btn: KGamepadButton) => void) => {
            return state.events.on("gamepadButtonPress", (b) => action(b));
        },
        (
            btn: KGamepadButton | KGamepadButton[],
            action: (btn: KGamepadButton) => void,
        ) => {
            return state.events.on(
                "gamepadButtonPress",
                (b) => isEqOrIncludes(btn, b) && action(b),
            );
        },
    );

    const onGamepadButtonDown = overload2(
        (action: (btn: KGamepadButton) => void) => {
            return state.events.on("gamepadButtonDown", (b) => action(b));
        },
        (
            btn: KGamepadButton,
            action: (btn: KGamepadButton) => void,
        ) => {
            return state.events.on(
                "gamepadButtonDown",
                (b) => isEqOrIncludes(btn, b) && action(b),
            );
        },
    );

    const onGamepadButtonRelease = overload2(
        (action: (btn: KGamepadButton) => void) => {
            return state.events.on("gamepadButtonRelease", (b) => action(b));
        },
        (
            btn: KGamepadButton | KGamepadButton[],
            action: (btn: KGamepadButton) => void,
        ) => {
            return state.events.on(
                "gamepadButtonRelease",
                (b) => isEqOrIncludes(btn, b) && action(b),
            );
        },
    );

    function onGamepadStick(
        stick: GamepadStick,
        action: (value: Vec2) => void,
    ): KEventController {
        return state.events.on(
            "gamepadStick",
            (a: string, v: Vec2) => a === stick && action(v),
        );
    }

    function onGamepadConnect(action: (gamepad: KGamePad) => void) {
        state.events.on("gamepadConnect", action);
    }

    function onGamepadDisconnect(action: (gamepad: KGamePad) => void) {
        state.events.on("gamepadDisconnect", action);
    }

    function getGamepadStick(stick: GamepadStick): Vec2 {
        return state.mergedGamepadState.stickState.get(stick) || new Vec2(0);
    }

    function charInputted(): string[] {
        return [...state.charInputted];
    }

    function getGamepads(): KGamePad[] {
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

    function processInput() {
        state.events.trigger("input");
        state.keyState.down.forEach((k) => state.events.trigger("keyDown", k));
        state.mouseState.down.forEach((k) =>
            state.events.trigger("mouseDown", k)
        );
        state.buttonState.down.forEach((btn) =>
            state.events.trigger("buttonDown", btn)
        );
        processGamepad();
    }

    function resetInput() {
        state.keyState.update();
        state.mouseState.update();
        state.buttonState.update();

        state.mergedGamepadState.buttonState.update();
        state.mergedGamepadState.stickState.forEach((v, k) => {
            state.mergedGamepadState.stickState.set(k, new Vec2(0));
        });

        state.charInputted = [];
        state.isMouseMoved = false;

        state.gamepadStates.forEach((s) => {
            s.buttonState.update();
            s.stickState.forEach((v, k) => {
                s.stickState.set(k, new Vec2(0));
            });
        });
    }

    function registerGamepad(browserGamepad: Gamepad) {
        const gamepad: KGamePad = {
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
            getStick: (stick: GamepadStick) => {
                return state.gamepadStates.get(browserGamepad.index)?.stickState
                    .get(stick) || vec2();
            },
        };

        state.gamepads.push(gamepad);

        state.gamepadStates.set(browserGamepad.index, {
            buttonState: new ButtonState(),
            stickState: new Map([
                ["left", new Vec2(0)],
                ["right", new Vec2(0)],
            ]),
        });

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
                ?? (GAMEPAD_MAP as Record<any, GamepadDef>)[browserGamepad.id]
                ?? GAMEPAD_MAP["default"];
            const gamepadState = state.gamepadStates.get(gamepad.index);
            if (!gamepadState) continue;

            for (let i = 0; i < browserGamepad.buttons.length; i++) {
                const gamepadBtn = map.buttons[i];
                const browserGamepadBtn = browserGamepad.buttons[i];
                const isGamepadButtonBind = state.buttonsByGamepad.has(
                    gamepadBtn,
                );

                if (browserGamepadBtn.pressed) {
                    if (!gamepadState.buttonState.down.has(gamepadBtn)) {
                        state.lastInputDevice = "gamepad";

                        if (isGamepadButtonBind) {
                            // replicate input in merged state, defined button state and gamepad state
                            state.buttonsByGamepad.get(gamepadBtn)?.forEach(
                                (btn) => {
                                    state.buttonState.press(btn);
                                    state.events.trigger("buttonPress", btn);
                                },
                            );
                        }

                        state.mergedGamepadState.buttonState.press(gamepadBtn);
                        gamepadState.buttonState.press(gamepadBtn);
                        state.events.trigger("gamepadButtonPress", gamepadBtn);
                    }

                    if (isGamepadButtonBind) {
                        state.buttonsByGamepad.get(gamepadBtn)?.forEach(
                            (btn) => {
                                state.buttonState.press(btn);
                                state.events.trigger("buttonDown", btn);
                            },
                        );
                    }

                    state.events.trigger("gamepadButtonDown", gamepadBtn);
                }
                else if (gamepadState.buttonState.down.has(gamepadBtn)) {
                    if (isGamepadButtonBind) {
                        state.buttonsByGamepad.get(gamepadBtn)?.forEach(
                            (btn) => {
                                state.buttonState.release(btn);
                                state.events.trigger("buttonRelease", btn);
                            },
                        );
                    }

                    state.mergedGamepadState.buttonState.release(
                        gamepadBtn,
                    );
                    gamepadState.buttonState.release(gamepadBtn);

                    state.events.trigger(
                        "gamepadButtonRelease",
                        gamepadBtn,
                    );
                }
            }

            for (const stickName in map.sticks) {
                const stick = map.sticks[stickName as GamepadStick];
                if (!stick) continue;
                const value = new Vec2(
                    browserGamepad.axes[stick.x],
                    browserGamepad.axes[stick.y],
                );
                gamepadState.stickState.set(stickName as GamepadStick, value);
                state.mergedGamepadState.stickState.set(
                    stickName as GamepadStick,
                    value,
                );
                state.events.trigger("gamepadStick", stickName, value);
            }
        }
    }

    type EventList<M> = {
        [event in keyof M]?: (event: M[event]) => void;
    };

    const canvasEvents: EventList<HTMLElementEventMap> = {};
    const docEvents: EventList<DocumentEventMap> = {};
    const winEvents: EventList<WindowEventMap> = {};

    const pd = opt.pixelDensity || window.devicePixelRatio || 1;

    canvasEvents.mousemove = (e) => {
        let timer;
        const mousePos = new Vec2(e.offsetX, e.offsetY);
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

        state.events.onOnce("input", () => {
            state.isMouseMoved = true;
            state.mousePos = mousePos;
            state.mouseDeltaPos = mouseDeltaPos;
            state.events.trigger("mouseMove");
        });

        clearTimeout(timer);

        // reset mouse moved state after 100ms
        timer = setTimeout(() => {
            state.isMouseMoved = false;
            state.mouseDeltaPos = new Vec2(0);
        }, 100);
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

            if (state.buttonsByMouse.has(m)) {
                state.buttonsByMouse.get(m)?.forEach((btn) => {
                    state.buttonState.press(btn);
                    state.events.trigger("buttonPress", btn);
                });
            }

            state.mouseState.press(m);
            state.events.trigger("mousePress", m);
        });
    };

    canvasEvents.mouseup = (e) => {
        state.events.onOnce("input", () => {
            const m = MOUSE_BUTTONS[e.button];
            if (!m) return;

            if (state.buttonsByMouse.has(m)) {
                state.buttonsByMouse.get(m)?.forEach((btn) => {
                    state.buttonState.release(btn);
                    state.events.trigger("buttonRelease", btn);
                });
            }

            state.mouseState.release(m);
            state.events.trigger("mouseRelease", m);
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
        if (PREVENT_DEFAULT_KEYS.has(e.key)) {
            e.preventDefault();
        }
        state.events.onOnce("input", () => {
            const k: Key = KEY_ALIAS[e.key as keyof typeof KEY_ALIAS] as Key
                || e.key.toLowerCase();
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
                state.keyState.pressRepeat(k);
                state.events.trigger("keyPressRepeat", k);
            }
            else {
                state.lastInputDevice = "keyboard";

                if (state.buttonsByKey.has(k)) {
                    state.buttonsByKey.get(k)?.forEach((btn) => {
                        state.buttonState.press(btn);
                        state.events.trigger("buttonPress", btn);
                    });
                }

                state.keyState.press(k);
                state.events.trigger("keyPressRepeat", k);
                state.events.trigger("keyPress", k);
            }
        });
    };

    canvasEvents.keyup = (e) => {
        state.events.onOnce("input", () => {
            const k: Key = KEY_ALIAS[e.key as keyof typeof KEY_ALIAS] as Key
                || e.key.toLowerCase();

            if (state.buttonsByKey.has(k)) {
                state.buttonsByKey.get(k)?.forEach((btn) => {
                    state.buttonState.release(btn);
                    state.events.trigger("buttonRelease", btn);
                });
            }

            state.keyState.release(k);
            state.events.trigger("keyRelease", k);
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
                state.mousePos = new Vec2(
                    touches[0].clientX - box.x,
                    touches[0].clientY - box.y,
                );

                state.lastInputDevice = "mouse";

                if (state.buttonsByMouse.has("left")) {
                    state.buttonsByMouse.get("left")?.forEach((btn) => {
                        state.buttonState.press(btn);
                        state.events.trigger("buttonPress", btn);
                    });
                }

                state.mouseState.press("left");
                state.events.trigger("mousePress", "left");
            }
            touches.forEach((t) => {
                state.events.trigger(
                    "touchStart",
                    new Vec2(t.clientX - box.x, t.clientY - box.y),
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
                state.mousePos = new Vec2(
                    touches[0].clientX - box.x,
                    touches[0].clientY - box.y,
                );
                state.mouseDeltaPos = state.mousePos.sub(lastMousePos);
                state.events.trigger("mouseMove");
            }
            touches.forEach((t) => {
                state.events.trigger(
                    "touchMove",
                    new Vec2(t.clientX - box.x, t.clientY - box.y),
                    t,
                );
            });
        });
    };

    canvasEvents.touchend = (e) => {
        state.events.onOnce("input", () => {
            const touches = [...e.changedTouches];
            const box = state.canvas.getBoundingClientRect();
            if (opt.touchToMouse !== false) {
                state.mousePos = new Vec2(
                    touches[0].clientX - box.x,
                    touches[0].clientY - box.y,
                );
                state.mouseDeltaPos = new Vec2(0, 0);

                if (state.buttonsByMouse.has("left")) {
                    state.buttonsByMouse.get("left")?.forEach((btn) => {
                        state.buttonState.release(btn);
                        state.events.trigger("buttonRelease", btn);
                    });
                }

                state.mouseState.release("left");
                state.events.trigger("mouseRelease", "left");
            }
            touches.forEach((t) => {
                state.events.trigger(
                    "touchEnd",
                    new Vec2(t.clientX - box.x, t.clientY - box.y),
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
                state.mousePos = new Vec2(
                    touches[0].clientX - box.x,
                    touches[0].clientY - box.y,
                );
                state.mouseState.release("left");
                state.events.trigger("mouseRelease", "left");
            }
            touches.forEach((t) => {
                state.events.trigger(
                    "touchEnd",
                    new Vec2(t.clientX - box.x, t.clientY - box.y),
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
        dt,
        fixedDt,
        restDt,
        time,
        run,
        canvas: state.canvas,
        fps,
        numFrames,
        quit,
        isHidden,
        setFullscreen,
        isFullscreen,
        setCursor,
        screenshot,
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
        getGamepadStick,
        isButtonPressed,
        isButtonDown,
        isButtonReleased,
        setButton,
        getButton,
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

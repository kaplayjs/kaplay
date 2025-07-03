"use strict";
// App is everything related to canvas, game loop and input
var __assign = (this && this.__assign) || function() {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) {
                if (Object.prototype.hasOwnProperty.call(s, p)) {
                    t[p] = s[p];
                }
            }
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function(to, from, pack) {
    if (pack || arguments.length === 2) {
        for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) {
                    ar = Array.prototype.slice.call(from, 0, i);
                }
                ar[i] = from[i];
            }
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initApp = exports.initAppState = exports.ButtonState = void 0;
var general_1 = require("../constants/general");
var events_1 = require("../events/events");
var viewport_1 = require("../gfx/viewport");
var math_1 = require("../math/math");
var Vec2_1 = require("../math/Vec2");
var overload_1 = require("../utils/overload");
var sets_1 = require("../utils/sets");
var inputBindings_1 = require("./inputBindings");
var ButtonState = /** @class */ function() {
    function ButtonState() {
        this.pressed = new Set([]);
        this.pressedRepeat = new Set([]);
        this.released = new Set([]);
        this.down = new Set([]);
    }
    ButtonState.prototype.update = function() {
        this.pressed.clear();
        this.released.clear();
        this.pressedRepeat.clear();
    };
    ButtonState.prototype.press = function(btn) {
        this.pressed.add(btn);
        this.pressedRepeat.add(btn);
        this.down.add(btn);
    };
    ButtonState.prototype.pressRepeat = function(btn) {
        this.pressedRepeat.add(btn);
    };
    ButtonState.prototype.release = function(btn) {
        this.down.delete(btn);
        this.pressed.delete(btn);
        this.released.add(btn);
    };
    return ButtonState;
}();
exports.ButtonState = ButtonState;
var GamepadState = /** @class */ function() {
    function GamepadState() {
        this.buttonState = new ButtonState();
        this.stickState = new Map();
    }
    return GamepadState;
}();
var FPSCounter = /** @class */ function() {
    function FPSCounter() {
        this.dts = [];
        this.timer = 0;
        this.fps = 0;
    }
    FPSCounter.prototype.tick = function(dt) {
        this.dts.push(dt);
        this.timer += dt;
        if (this.timer >= 1) {
            this.timer = 0;
            this.fps = Math.round(
                1 / (this.dts.reduce(function(a, b) {
                    return a + b;
                }) / this.dts.length),
            );
            this.dts = [];
        }
    };
    return FPSCounter;
}();
var initAppState = function(opt) {
    var _a;
    var buttons = (_a = opt.buttons) !== null && _a !== void 0 ? _a : {};
    return {
        canvas: opt.canvas,
        buttons: buttons,
        buttonsByKey: new Map(),
        buttonsByMouse: new Map(),
        buttonsByGamepad: new Map(),
        buttonsByKeyCode: new Map(),
        loopID: null,
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
        capsOn: false,
        mousePos: new Vec2_1.Vec2(0),
        mouseDeltaPos: new Vec2_1.Vec2(0),
        keyState: new ButtonState(),
        mouseState: new ButtonState(),
        mergedGamepadState: new GamepadState(),
        gamepadStates: new Map(),
        lastInputDevice: null,
        // unified input state
        buttonState: new ButtonState(),
        gamepads: [],
        charInputted: [],
        isMouseMoved: false,
        lastWidth: opt.canvas.offsetWidth,
        lastHeight: opt.canvas.offsetHeight,
        events: new events_1.KEventHandler(),
    };
};
exports.initAppState = initAppState;
var initApp = function(opt) {
    if (!opt.canvas) {
        throw new Error("Please provide a canvas");
    }
    var state = (0, exports.initAppState)(opt);
    (0, inputBindings_1.parseButtonBindings)(state);
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
    function screenshot() {
        return state.canvas.toDataURL();
    }
    function setCursor(c) {
        state.canvas.style.cursor = c;
    }
    function getCursor() {
        return state.canvas.style.cursor;
    }
    function setCursorLocked(b) {
        if (b) {
            try {
                var res = state.canvas
                    .requestPointerLock();
                if (res === null || res === void 0 ? void 0 : res.catch) {
                    res.catch(function(e) {
                        return console.error(e);
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }
        else {
            document.exitPointerLock();
        }
    }
    function isCursorLocked() {
        return !!document.pointerLockElement;
    }
    // wrappers around full screen functions to work across browsers
    function enterFullscreen(el) {
        if (el.requestFullscreen) {
            el.requestFullscreen();
        }
        // @ts-ignore
        else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        }
    }
    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        // @ts-ignore
        else if (document.webkitExitFullScreen) {
            document.webkitExitFullScreen();
        }
    }
    function setFullscreen(f) {
        if (f === void 0) f = true;
        if (f) {
            enterFullscreen(state.canvas);
        }
        else {
            exitFullscreen();
        }
    }
    function isFullscreen() {
        return document.fullscreenElement === state.canvas
            // @ts-ignore
            || document.webkitFullscreenElement === state.canvas;
    }
    var isFocused = function() {
        return document.activeElement === state.canvas;
    };
    function quit() {
        state.stopped = true;
        var ce = Object.entries(canvasEvents);
        var de = Object.entries(docEvents);
        var we = Object.entries(winEvents);
        for (var _i = 0, ce_1 = ce; _i < ce_1.length; _i++) {
            var _a = ce_1[_i], name_1 = _a[0], val = _a[1];
            state.canvas.removeEventListener(name_1, val);
        }
        for (var _b = 0, de_1 = de; _b < de_1.length; _b++) {
            var _c = de_1[_b], name_2 = _c[0], val = _c[1];
            document.removeEventListener(name_2, val);
        }
        for (var _d = 0, we_1 = we; _d < we_1.length; _d++) {
            var _e = we_1[_d], name_3 = _e[0], val = _e[1];
            window.removeEventListener(name_3, val);
        }
        resizeObserver.disconnect();
    }
    function run(fixedUpdate, update) {
        if (state.loopID !== null) {
            cancelAnimationFrame(state.loopID);
        }
        var fixedAccumulatedDt = 0;
        var accumulatedDt = 0;
        var frame = function(t) {
            if (state.stopped) {
                return;
            }
            // TODO: allow background actions?
            if (document.visibilityState !== "visible") {
                state.loopID = requestAnimationFrame(frame);
                return;
            }
            var loopTime = t / 1000;
            var realDt = Math.min(loopTime - state.realTime, 0.25);
            var desiredDt = opt.maxFPS ? 1 / opt.maxFPS : 0;
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
                update(processInput, resetInput);
            }
            state.loopID = requestAnimationFrame(frame);
        };
        frame(0);
    }
    function isTouchscreen() {
        return ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
    }
    function mousePos() {
        return state.mousePos.clone();
    }
    function mouseDeltaPos() {
        return state.mouseDeltaPos.clone();
    }
    function isMousePressed(m) {
        if (m === void 0) m = "left";
        return state.mouseState.pressed.has(m);
    }
    function isMouseDown(m) {
        if (m === void 0) m = "left";
        return state.mouseState.down.has(m);
    }
    function isMouseReleased(m) {
        if (m === void 0) m = "left";
        return state.mouseState.released.has(m);
    }
    function isMouseMoved() {
        return state.isMouseMoved;
    }
    function isKeyPressed(k) {
        return k === undefined
            ? state.keyState.pressed.size > 0
            : (0, sets_1.setHasOrIncludes)(state.keyState.pressed, k);
    }
    function isKeyPressedRepeat(k) {
        return k === undefined
            ? state.keyState.pressedRepeat.size > 0
            : (0, sets_1.setHasOrIncludes)(state.keyState.pressedRepeat, k);
    }
    function isKeyDown(k) {
        return k === undefined
            ? state.keyState.down.size > 0
            : (0, sets_1.setHasOrIncludes)(state.keyState.down, k);
    }
    function isKeyReleased(k) {
        return k === undefined
            ? state.keyState.released.size > 0
            : (0, sets_1.setHasOrIncludes)(state.keyState.released, k);
    }
    function isGamepadButtonPressed(btn) {
        return btn === undefined
            ? state.mergedGamepadState.buttonState.pressed.size > 0
            : (0, sets_1.setHasOrIncludes)(
                state.mergedGamepadState.buttonState.pressed,
                btn,
            );
    }
    function isGamepadButtonDown(btn) {
        return btn === undefined
            ? state.mergedGamepadState.buttonState.down.size > 0
            : (0, sets_1.setHasOrIncludes)(
                state.mergedGamepadState.buttonState.down,
                btn,
            );
    }
    function isGamepadButtonReleased(btn) {
        return btn === undefined
            ? state.mergedGamepadState.buttonState.released.size > 0
            : (0, sets_1.setHasOrIncludes)(
                state.mergedGamepadState.buttonState.released,
                btn,
            );
    }
    function isButtonPressed(btn) {
        return btn === undefined
            ? state.buttonState.pressed.size > 0
            : (0, sets_1.setHasOrIncludes)(state.buttonState.pressed, btn);
    }
    function isButtonDown(btn) {
        return btn === undefined
            ? state.buttonState.down.size > 0
            : (0, sets_1.setHasOrIncludes)(state.buttonState.down, btn);
    }
    function isButtonReleased(btn) {
        return btn === undefined
            ? state.buttonState.released.size > 0
            : (0, sets_1.setHasOrIncludes)(state.buttonState.released, btn);
    }
    function getButton(btn) {
        var _a;
        return (_a = state.buttons) === null || _a === void 0
            ? void 0
            : _a[btn];
    }
    function setButton(btn, binding) {
        state.buttons[btn] = __assign(
            __assign({}, state.buttons[btn]),
            binding,
        );
    }
    function pressButton(btn) {
        state.buttonState.press(btn);
        state.events.trigger("buttonPress", btn);
    }
    function releaseButton(btn) {
        state.buttonState.release(btn);
        state.events.trigger("buttonRelease", btn);
    }
    function onResize(action) {
        return state.events.on("resize", action);
    }
    // input callbacks
    var onKeyDown = (0, overload_1.overload2)(function(action) {
        return state.events.on("keyDown", action);
    }, function(key, action) {
        return state.events.on("keyDown", function(k) {
            return (0, sets_1.isEqOrIncludes)(key, k) && action(k);
        });
    });
    // key pressed is equal to the key by the user
    var onKeyPress = (0, overload_1.overload2)(function(action) {
        return state.events.on("keyPress", function(k) {
            return action(k);
        });
    }, function(key, action) {
        return state.events.on("keyPress", function(k) {
            return (0, sets_1.isEqOrIncludes)(key, k) && action(k);
        });
    });
    var onKeyPressRepeat = (0, overload_1.overload2)(function(action) {
        return state.events.on("keyPressRepeat", action);
    }, function(key, action) {
        return state.events.on("keyPressRepeat", function(k) {
            return (0, sets_1.isEqOrIncludes)(key, k) && action(k);
        });
    });
    var onKeyRelease = (0, overload_1.overload2)(function(action) {
        return state.events.on("keyRelease", action);
    }, function(key, action) {
        return state.events.on("keyRelease", function(k) {
            return (0, sets_1.isEqOrIncludes)(key, k) && action(k);
        });
    });
    var onMouseDown = (0, overload_1.overload2)(function(action) {
        return state.events.on("mouseDown", function(m) {
            return action(m);
        });
    }, function(mouse, action) {
        return state.events.on("mouseDown", function(m) {
            return (0, sets_1.isEqOrIncludes)(mouse, m) && action(m);
        });
    });
    var onMousePress = (0, overload_1.overload2)(function(action) {
        return state.events.on("mousePress", function(m) {
            return action(m);
        });
    }, function(mouse, action) {
        return state.events.on("mousePress", function(m) {
            return (0, sets_1.isEqOrIncludes)(mouse, m) && action(m);
        });
    });
    var onMouseRelease = (0, overload_1.overload2)(function(action) {
        return state.events.on("mouseRelease", function(m) {
            return action(m);
        });
    }, function(mouse, action) {
        return state.events.on("mouseRelease", function(m) {
            return m === mouse && action(m);
        });
    });
    function onMouseMove(f) {
        return state.events.on("mouseMove", function() {
            return f(mousePos(), mouseDeltaPos());
        });
    }
    function onCharInput(action) {
        return state.events.on("charInput", action);
    }
    function onTouchStart(f) {
        return state.events.on("touchStart", f);
    }
    function onTouchMove(f) {
        return state.events.on("touchMove", f);
    }
    function onTouchEnd(f) {
        return state.events.on("touchEnd", f);
    }
    function onScroll(action) {
        return state.events.on("scroll", action);
    }
    function onHide(action) {
        return state.events.on("hide", action);
    }
    function onShow(action) {
        return state.events.on("show", action);
    }
    var onGamepadButtonPress = (0, overload_1.overload2)(function(action) {
        return state.events.on("gamepadButtonPress", function(b, gp) {
            return action(b, gp);
        });
    }, function(btn, action) {
        return state.events.on("gamepadButtonPress", function(b, gp) {
            return (0, sets_1.isEqOrIncludes)(btn, b) && action(b, gp);
        });
    });
    var onGamepadButtonDown = (0, overload_1.overload2)(function(action) {
        return state.events.on("gamepadButtonDown", function(b, gp) {
            return action(b, gp);
        });
    }, function(btn, action) {
        return state.events.on("gamepadButtonDown", function(b, gp) {
            return (0, sets_1.isEqOrIncludes)(btn, b) && action(b, gp);
        });
    });
    var onGamepadButtonRelease = (0, overload_1.overload2)(function(action) {
        return state.events.on("gamepadButtonRelease", function(b, gp) {
            return action(b, gp);
        });
    }, function(btn, action) {
        return state.events.on("gamepadButtonRelease", function(b, gp) {
            return (0, sets_1.isEqOrIncludes)(btn, b) && action(b, gp);
        });
    });
    function onGamepadStick(stick, action) {
        return state.events.on("gamepadStick", function(a, v, gp) {
            return a === stick && action(v, gp);
        });
    }
    function onGamepadConnect(action) {
        return state.events.on("gamepadConnect", action);
    }
    function onGamepadDisconnect(action) {
        return state.events.on("gamepadDisconnect", action);
    }
    function getGamepadStick(stick) {
        return state.mergedGamepadState.stickState.get(stick)
            || new Vec2_1.Vec2(0);
    }
    function charInputted() {
        return __spreadArray([], state.charInputted, true);
    }
    function getGamepads() {
        return __spreadArray([], state.gamepads, true);
    }
    var onButtonPress = (0, overload_1.overload2)(function(action) {
        return state.events.on("buttonPress", function(b) {
            return action(b);
        });
    }, function(btn, action) {
        return state.events.on("buttonPress", function(b) {
            return (0, sets_1.isEqOrIncludes)(btn, b) && action(b);
        });
    });
    var onButtonDown = (0, overload_1.overload2)(function(action) {
        return state.events.on("buttonDown", function(b) {
            return action(b);
        });
    }, function(btn, action) {
        return state.events.on("buttonDown", function(b) {
            return (0, sets_1.isEqOrIncludes)(btn, b) && action(b);
        });
    });
    var onButtonRelease = (0, overload_1.overload2)(function(action) {
        return state.events.on("buttonRelease", function(b) {
            return action(b);
        });
    }, function(btn, action) {
        return state.events.on("buttonRelease", function(b) {
            return (0, sets_1.isEqOrIncludes)(btn, b) && action(b);
        });
    });
    var getLastInputDeviceType = function() {
        return state.lastInputDevice;
    };
    function processInput() {
        state.events.trigger("input");
        state.keyState.down.forEach(function(k) {
            return state.events.trigger("keyDown", k);
        });
        state.mouseState.down.forEach(function(k) {
            return state.events.trigger("mouseDown", k);
        });
        state.buttonState.down.forEach(function(btn) {
            state.events.trigger("buttonDown", btn);
        });
        processGamepad();
    }
    function resetInput() {
        state.keyState.update();
        state.mouseState.update();
        state.buttonState.update();
        state.mergedGamepadState.buttonState.update();
        state.mergedGamepadState.stickState.forEach(function(v, k) {
            state.mergedGamepadState.stickState.set(k, new Vec2_1.Vec2(0));
        });
        state.charInputted = [];
        state.isMouseMoved = false;
        state.mouseDeltaPos = new Vec2_1.Vec2(0);
        state.gamepadStates.forEach(function(s) {
            s.buttonState.update();
            s.stickState.forEach(function(v, k) {
                s.stickState.set(k, new Vec2_1.Vec2(0));
            });
        });
    }
    function registerGamepad(browserGamepad) {
        var gamepad = {
            index: browserGamepad.index,
            isPressed: function(btn) {
                var _a;
                return ((_a = state.gamepadStates.get(browserGamepad.index))
                            === null || _a === void 0
                    ? void 0
                    : _a.buttonState.pressed.has(btn)) || false;
            },
            isDown: function(btn) {
                var _a;
                return ((_a = state.gamepadStates.get(browserGamepad.index))
                            === null || _a === void 0
                    ? void 0
                    : _a.buttonState.down.has(btn)) || false;
            },
            isReleased: function(btn) {
                var _a;
                return ((_a = state.gamepadStates.get(browserGamepad.index))
                            === null || _a === void 0
                    ? void 0
                    : _a.buttonState.released.has(btn)) || false;
            },
            getStick: function(stick) {
                var _a;
                return ((_a = state.gamepadStates.get(browserGamepad.index))
                            === null || _a === void 0
                    ? void 0
                    : _a.stickState.get(stick)) || (0, math_1.vec2)();
            },
        };
        state.gamepads.push(gamepad);
        state.gamepadStates.set(browserGamepad.index, {
            buttonState: new ButtonState(),
            stickState: new Map([
                ["left", new Vec2_1.Vec2(0)],
                ["right", new Vec2_1.Vec2(0)],
            ]),
        });
        return gamepad;
    }
    function removeGamepad(gamepad) {
        state.gamepads = state.gamepads.filter(function(g) {
            return g.index !== gamepad.index;
        });
        state.gamepadStates.delete(gamepad.index);
    }
    // TODO: Clean up this function
    function processGamepad() {
        var _a, _b, _c;
        for (var _i = 0, _d = navigator.getGamepads(); _i < _d.length; _i++) {
            var browserGamepad = _d[_i];
            if (
                browserGamepad && !state.gamepadStates.has(browserGamepad.index)
            ) {
                registerGamepad(browserGamepad);
            }
        }
        for (var _e = 0, _f = state.gamepads; _e < _f.length; _e++) {
            var gamepad = _f[_e];
            var browserGamepad = navigator.getGamepads()[gamepad.index];
            if (!browserGamepad) {
                continue;
            }
            var customMap = (_a = opt.gamepads) !== null && _a !== void 0
                ? _a
                : {};
            var map_1 = customMap[browserGamepad.id]
                || general_1.GP_MAP[browserGamepad.id]
                || general_1.GP_MAP["default"];
            var gamepadState = state.gamepadStates.get(gamepad.index);
            if (!gamepadState) {
                continue;
            }
            for (var i = 0; i < browserGamepad.buttons.length; i++) {
                var gamepadBtn = map_1.buttons[i];
                var browserGamepadBtn = browserGamepad.buttons[i];
                var isGamepadButtonBind = state.buttonsByGamepad.has(
                    gamepadBtn,
                );
                if (browserGamepadBtn.pressed) {
                    if (gamepadState.buttonState.down.has(gamepadBtn)) {
                        state.events.trigger(
                            "gamepadButtonDown",
                            gamepadBtn,
                            gamepad,
                        );
                        continue;
                    }
                    state.lastInputDevice = "gamepad";
                    if (isGamepadButtonBind) {
                        // replicate input in merged state, defined button state and gamepad state
                        (_b = state.buttonsByGamepad.get(gamepadBtn)) === null
                            || _b === void 0
                            ? void 0
                            : _b.forEach(function(btn) {
                                state.buttonState.press(btn);
                                state.events.trigger("buttonPress", btn);
                            });
                    }
                    state.mergedGamepadState.buttonState.press(gamepadBtn);
                    gamepadState.buttonState.press(gamepadBtn);
                    state.events.trigger(
                        "gamepadButtonPress",
                        gamepadBtn,
                        gamepad,
                    );
                }
                else if (gamepadState.buttonState.down.has(gamepadBtn)) {
                    if (isGamepadButtonBind) {
                        (_c = state.buttonsByGamepad.get(gamepadBtn)) === null
                            || _c === void 0
                            ? void 0
                            : _c.forEach(function(btn) {
                                state.buttonState.release(btn);
                                state.events.trigger("buttonRelease", btn);
                            });
                    }
                    state.mergedGamepadState.buttonState.release(gamepadBtn);
                    gamepadState.buttonState.release(gamepadBtn);
                    state.events.trigger(
                        "gamepadButtonRelease",
                        gamepadBtn,
                        gamepad,
                    );
                }
            }
            for (var stickName in map_1.sticks) {
                var stick = map_1.sticks[stickName];
                if (!stick) {
                    continue;
                }
                var value = new Vec2_1.Vec2(
                    browserGamepad.axes[stick.x],
                    browserGamepad.axes[stick.y],
                );
                gamepadState.stickState.set(stickName, value);
                state.mergedGamepadState.stickState.set(stickName, value);
                state.events.trigger("gamepadStick", stickName, value, gamepad);
            }
        }
    }
    var canvasEvents = {};
    var docEvents = {};
    var winEvents = {};
    var pd = opt.pixelDensity || 1;
    canvasEvents.mousemove = function(e) {
        // 🍝 Here we depend of GFX Context even if initGfx needs initApp for being used
        // Letterbox creates some black bars so we need to remove that for calculating
        // mouse position
        // Ironically, e.offsetX and e.offsetY are the mouse position. Is not
        // related to what we call the "offset" in this code
        var mousePos = (0, viewport_1.canvasToViewport)(
            new Vec2_1.Vec2(e.offsetX, e.offsetY),
        );
        var mouseDeltaPos = new Vec2_1.Vec2(e.movementX, e.movementY);
        if (isFullscreen()) {
            var cw = state.canvas.width / pd;
            var ch = state.canvas.height / pd;
            var ww = window.innerWidth;
            var wh = window.innerHeight;
            var rw = ww / wh;
            var rc = cw / ch;
            if (rw > rc) {
                var ratio = wh / ch;
                var offset = (ww - (cw * ratio)) / 2;
                mousePos.x = (0, math_1.map)(
                    e.offsetX - offset,
                    0,
                    cw * ratio,
                    0,
                    cw,
                );
                mousePos.y = (0, math_1.map)(e.offsetY, 0, ch * ratio, 0, ch);
            }
            else {
                var ratio = ww / cw;
                var offset = (wh - (ch * ratio)) / 2;
                mousePos.x = (0, math_1.map)(e.offsetX, 0, cw * ratio, 0, cw);
                mousePos.y = (0, math_1.map)(
                    e.offsetY - offset,
                    0,
                    ch * ratio,
                    0,
                    ch,
                );
            }
        }
        state.events.onOnce("input", function() {
            state.isMouseMoved = true;
            state.mousePos = mousePos;
            state.mouseDeltaPos = mouseDeltaPos;
            state.events.trigger("mouseMove");
        });
    };
    var MOUSE_BUTTONS = [
        "left",
        "middle",
        "right",
        "back",
        "forward",
    ];
    canvasEvents.mousedown = function(e) {
        state.events.onOnce("input", function() {
            var _a;
            var m = MOUSE_BUTTONS[e.button];
            if (!m) {
                return;
            }
            state.lastInputDevice = "mouse";
            if (state.buttonsByMouse.has(m)) {
                (_a = state.buttonsByMouse.get(m)) === null || _a === void 0
                    ? void 0
                    : _a.forEach(function(btn) {
                        state.buttonState.press(btn);
                        state.events.trigger("buttonPress", btn);
                    });
            }
            state.mouseState.press(m);
            state.events.trigger("mousePress", m);
        });
    };
    canvasEvents.mouseup = function(e) {
        state.events.onOnce("input", function() {
            var _a;
            var m = MOUSE_BUTTONS[e.button];
            if (!m) {
                return;
            }
            if (state.buttonsByMouse.has(m)) {
                (_a = state.buttonsByMouse.get(m)) === null || _a === void 0
                    ? void 0
                    : _a.forEach(function(btn) {
                        state.buttonState.release(btn);
                        state.events.trigger("buttonRelease", btn);
                    });
            }
            state.mouseState.release(m);
            state.events.trigger("mouseRelease", m);
        });
    };
    var PREVENT_DEFAULT_KEYS = new Set([
        " ",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Tab",
    ]);
    // translate these key names to a simpler version
    var KEY_ALIAS = {
        "ArrowLeft": "left",
        "ArrowRight": "right",
        "ArrowUp": "up",
        "ArrowDown": "down",
        " ": "space",
    };
    canvasEvents.keydown = function(e) {
        state.capsOn = e.getModifierState("CapsLock");
        if (PREVENT_DEFAULT_KEYS.has(e.key)) {
            e.preventDefault();
        }
        state.events.onOnce("input", function() {
            var _a, _b;
            var k = KEY_ALIAS[e.key]
                || e.key.toLowerCase();
            var code = e.code;
            if (k === undefined) {
                throw new Error("Unknown key: ".concat(e.key));
            }
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
                    (_a = state.buttonsByKey.get(k)) === null || _a === void 0
                        ? void 0
                        : _a.forEach(function(btn) {
                            state.buttonState.press(btn);
                            state.events.trigger("buttonPress", btn);
                        });
                }
                if (state.buttonsByKeyCode.has(code)) {
                    (_b = state.buttonsByKeyCode.get(code)) === null
                        || _b === void 0
                        ? void 0
                        : _b.forEach(function(btn) {
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
    canvasEvents.keyup = function(e) {
        state.events.onOnce("input", function() {
            var _a, _b;
            var k = KEY_ALIAS[e.key]
                || e.key.toLowerCase();
            var code = e.code;
            if (state.buttonsByKey.has(k)) {
                (_a = state.buttonsByKey.get(k)) === null || _a === void 0
                    ? void 0
                    : _a.forEach(function(btn) {
                        state.buttonState.release(btn);
                        state.events.trigger("buttonRelease", btn);
                    });
            }
            if (state.buttonsByKeyCode.has(code)) {
                (_b = state.buttonsByKeyCode.get(code)) === null
                    || _b === void 0
                    ? void 0
                    : _b.forEach(function(btn) {
                        state.buttonState.release(btn);
                        state.events.trigger("buttonRelease", btn);
                    });
            }
            state.keyState.release(k);
            state.events.trigger("keyRelease", k);
        });
    };
    // TODO: handle all touches at once instead of sequentially
    canvasEvents.touchstart = function(e) {
        // disable long tap context menu
        e.preventDefault();
        state.events.onOnce("input", function() {
            var _a;
            var touches = __spreadArray([], e.changedTouches, true);
            var box = state.canvas.getBoundingClientRect();
            if (opt.touchToMouse !== false) {
                state.mousePos = (0, viewport_1.canvasToViewport)(
                    new Vec2_1.Vec2(
                        touches[0].clientX - box.x,
                        touches[0].clientY - box.y,
                    ),
                );
                state.lastInputDevice = "mouse";
                if (state.buttonsByMouse.has("left")) {
                    (_a = state.buttonsByMouse.get("left")) === null
                        || _a === void 0
                        ? void 0
                        : _a.forEach(function(btn) {
                            state.buttonState.press(btn);
                            state.events.trigger("buttonPress", btn);
                        });
                }
                state.mouseState.press("left");
                state.events.trigger("mousePress", "left");
            }
            touches.forEach(function(t) {
                state.events.trigger(
                    "touchStart",
                    (0, viewport_1.canvasToViewport)(
                        new Vec2_1.Vec2(t.clientX - box.x, t.clientY - box.y),
                    ),
                    t,
                );
            });
        });
    };
    canvasEvents.touchmove = function(e) {
        // disable scrolling
        e.preventDefault();
        state.events.onOnce("input", function() {
            var touches = __spreadArray([], e.changedTouches, true);
            var box = state.canvas.getBoundingClientRect();
            if (opt.touchToMouse !== false) {
                var lastMousePos = state.mousePos;
                state.mousePos = (0, viewport_1.canvasToViewport)(
                    new Vec2_1.Vec2(
                        touches[0].clientX - box.x,
                        touches[0].clientY - box.y,
                    ),
                );
                state.mouseDeltaPos = state.mousePos.sub(lastMousePos);
                state.events.trigger("mouseMove");
            }
            touches.forEach(function(t) {
                state.events.trigger(
                    "touchMove",
                    (0, viewport_1.canvasToViewport)(
                        new Vec2_1.Vec2(t.clientX - box.x, t.clientY - box.y),
                    ),
                    t,
                );
            });
        });
    };
    canvasEvents.touchend = function(e) {
        state.events.onOnce("input", function() {
            var _a;
            var touches = __spreadArray([], e.changedTouches, true);
            var box = state.canvas.getBoundingClientRect();
            if (opt.touchToMouse != false) {
                state.mousePos = (0, viewport_1.canvasToViewport)(
                    new Vec2_1.Vec2(
                        touches[0].clientX - box.x,
                        touches[0].clientY - box.y,
                    ),
                );
                state.mouseDeltaPos = new Vec2_1.Vec2(0, 0);
                if (state.buttonsByMouse.has("left")) {
                    (_a = state.buttonsByMouse.get("left")) === null
                        || _a === void 0
                        ? void 0
                        : _a.forEach(function(btn) {
                            state.buttonState.release(btn);
                            state.events.trigger("buttonRelease", btn);
                        });
                }
                state.mouseState.release("left");
                state.events.trigger("mouseRelease", "left");
            }
            touches.forEach(function(t) {
                state.events.trigger(
                    "touchEnd",
                    (0, viewport_1.canvasToViewport)(
                        new Vec2_1.Vec2(t.clientX - box.x, t.clientY - box.y),
                    ),
                    t,
                );
            });
        });
    };
    canvasEvents.touchcancel = function(e) {
        state.events.onOnce("input", function() {
            var touches = __spreadArray([], e.changedTouches, true);
            var box = state.canvas.getBoundingClientRect();
            if (opt.touchToMouse !== false) {
                state.mousePos = (0, viewport_1.canvasToViewport)(
                    new Vec2_1.Vec2(
                        touches[0].clientX - box.x,
                        touches[0].clientY - box.y,
                    ),
                );
                state.mouseState.release("left");
                state.events.trigger("mouseRelease", "left");
            }
            touches.forEach(function(t) {
                state.events.trigger(
                    "touchEnd",
                    (0, viewport_1.canvasToViewport)(
                        new Vec2_1.Vec2(t.clientX - box.x, t.clientY - box.y),
                    ),
                    t,
                );
            });
        });
    };
    // TODO: option to not prevent default?
    canvasEvents.wheel = function(e) {
        e.preventDefault();
        state.events.onOnce("input", function() {
            state.events.trigger("scroll", new Vec2_1.Vec2(e.deltaX, e.deltaY));
        });
    };
    canvasEvents.contextmenu = function(e) {
        return e.preventDefault();
    };
    docEvents.visibilitychange = function() {
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
    winEvents.gamepadconnected = function(e) {
        var kbGamepad = registerGamepad(e.gamepad);
        state.events.onOnce("input", function() {
            state.events.trigger("gamepadConnect", kbGamepad);
        });
    };
    winEvents.gamepaddisconnected = function(e) {
        var kbGamepad = getGamepads().filter(function(g) {
            return g.index === e.gamepad.index;
        })[0];
        removeGamepad(e.gamepad);
        state.events.onOnce("input", function() {
            state.events.trigger("gamepadDisconnect", kbGamepad);
        });
    };
    for (var _i = 0, _a = Object.entries(canvasEvents); _i < _a.length; _i++) {
        var _b = _a[_i], name_4 = _b[0], val = _b[1];
        state.canvas.addEventListener(name_4, val);
    }
    for (var _c = 0, _d = Object.entries(docEvents); _c < _d.length; _c++) {
        var _e = _d[_c], name_5 = _e[0], val = _e[1];
        document.addEventListener(name_5, val);
    }
    for (var _f = 0, _g = Object.entries(winEvents); _f < _g.length; _f++) {
        var _h = _g[_f], name_6 = _h[0], val = _h[1];
        window.addEventListener(name_6, val);
    }
    var resizeObserver = new ResizeObserver(function(entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (entry.target !== state.canvas) {
                continue;
            }
            if (
                state.lastWidth === state.canvas.offsetWidth
                && state.lastHeight === state.canvas.offsetHeight
            ) {
                return;
            }
            state.lastWidth = state.canvas.offsetWidth;
            state.lastHeight = state.canvas.offsetHeight;
            state.events.onOnce("input", function() {
                state.events.trigger("resize");
            });
        }
    });
    resizeObserver.observe(state.canvas);
    return {
        state: state,
        dt: dt,
        fixedDt: fixedDt,
        restDt: restDt,
        time: time,
        run: run,
        canvas: state.canvas,
        fps: fps,
        numFrames: numFrames,
        quit: quit,
        isHidden: isHidden,
        setFullscreen: setFullscreen,
        isFullscreen: isFullscreen,
        setCursor: setCursor,
        screenshot: screenshot,
        getGamepads: getGamepads,
        getCursor: getCursor,
        setCursorLocked: setCursorLocked,
        isCursorLocked: isCursorLocked,
        isTouchscreen: isTouchscreen,
        mousePos: mousePos,
        mouseDeltaPos: mouseDeltaPos,
        isKeyDown: isKeyDown,
        isKeyPressed: isKeyPressed,
        isKeyPressedRepeat: isKeyPressedRepeat,
        isKeyReleased: isKeyReleased,
        isMouseDown: isMouseDown,
        isMousePressed: isMousePressed,
        isMouseReleased: isMouseReleased,
        isMouseMoved: isMouseMoved,
        isGamepadButtonPressed: isGamepadButtonPressed,
        isGamepadButtonDown: isGamepadButtonDown,
        isGamepadButtonReleased: isGamepadButtonReleased,
        isFocused: isFocused,
        getGamepadStick: getGamepadStick,
        isButtonPressed: isButtonPressed,
        isButtonDown: isButtonDown,
        isButtonReleased: isButtonReleased,
        setButton: setButton,
        getButton: getButton,
        pressButton: pressButton,
        releaseButton: releaseButton,
        charInputted: charInputted,
        onResize: onResize,
        onKeyDown: onKeyDown,
        onKeyPress: onKeyPress,
        onKeyPressRepeat: onKeyPressRepeat,
        onKeyRelease: onKeyRelease,
        onMouseDown: onMouseDown,
        onMousePress: onMousePress,
        onMouseRelease: onMouseRelease,
        onMouseMove: onMouseMove,
        onCharInput: onCharInput,
        onTouchStart: onTouchStart,
        onTouchMove: onTouchMove,
        onTouchEnd: onTouchEnd,
        onScroll: onScroll,
        onHide: onHide,
        onShow: onShow,
        onGamepadButtonDown: onGamepadButtonDown,
        onGamepadButtonPress: onGamepadButtonPress,
        onGamepadButtonRelease: onGamepadButtonRelease,
        onGamepadStick: onGamepadStick,
        onGamepadConnect: onGamepadConnect,
        onGamepadDisconnect: onGamepadDisconnect,
        onButtonPress: onButtonPress,
        onButtonDown: onButtonDown,
        onButtonRelease: onButtonRelease,
        getLastInputDeviceType: getLastInputDeviceType,
        events: state.events,
    };
};
exports.initApp = initApp;

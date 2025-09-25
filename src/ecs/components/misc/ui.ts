import type { KEventController } from "../../../events/events";
import { onAdd, onDestroy, onUnuse, onUse } from "../../../events/globalEvents";
import { onSceneLeave } from "../../../game/scenes";
import { _k } from "../../../shared";
import type { Comp, GameObj, Key, MouseButton } from "../../../types";
import { getTreeRoot } from "../../entity/utils";
import { system, SystemPhase } from "../../systems/systems";
import type { AreaComp } from "../physics/area";

interface UICompPrivate extends Comp {
    setHoverAndMouseState(
        isHovering: boolean,
        isPressed: boolean,
        isDown: boolean,
    ): void;
}

export interface UIComp extends UICompPrivate {
    /**
     * True if the object can receive the focus.
     */
    canFocus: boolean;
    /**
     * True if the object has been clicked.
     */
    isClicked(): boolean;
    /**
     * True if the object is being pressed.
     */
    isPressed: boolean;
    /**
     * Register an event runs when clicked.
     *
     * @since v2000.1
     */
    onClick(f: () => void, btn?: MouseButton): KEventController;

    /**
     * True if the object is being hovered over.
     */
    isHovering(): boolean;
    /**
     * Register an event which is triggered when the object is going from a non-hovered to a hovered state.
     *
     * @since v3000.0
     */
    onHover(action: () => void): KEventController;
    /**
     * Register an event which is triggered when the object is being hovered over.
     *
     * @since v3000.0
     */
    onHoverUpdate(action: () => void): KEventController;
    /**
     * Register an event which is triggered when the object is going from a hovered to a non-hovered state.
     *
     * @since v3000.0
     */
    onHoverEnd(action: () => void): KEventController;

    /**
     * Register an event which is triggered when the object is invoked, aka both mouse down and up inside the area.
     *
     * @since v4000.0
     */
    onInvoke(action: () => void): KEventController;

    /**
     * Returns true if the object has the focus.
     *
     * @since v4000.0
     */
    isFocus: boolean;
    /**
     * Returns the object which has the focus.
     *
     * @since v4000.0
     */
    currentFocus: GameObj | null;
    /**
     * Makes this object the focus.
     *
     * @since v4000.0
     */
    makeFocus(): void;
    /**
     * Register an event which is triggered when the object receives the focus.
     *
     * @since v4000.0
     */
    onFocus(action: () => void): KEventController;
    /**
     * Register an event which is triggered when the object loses the focus.
     *
     * @since v4000.0
     */
    onBlur(action: () => void): KEventController;

    serialize(): any;
}

export type UICompOpt = {
    canFocus?: boolean;
};

let systemInstalled = false;
// TODO: use a live query for this, once it can use a Set
const hovers: Set<GameObj<UIComp | AreaComp>> = new Set();

function installSystem() {
    if (systemInstalled) return;
    systemInstalled = true;

    onAdd(obj => {
        if (obj.has("ui")) {
            hovers.add(obj as GameObj<UIComp | AreaComp>);
        }
    });
    onDestroy(obj => {
        hovers.delete(obj as GameObj<UIComp | AreaComp>);
    });
    onUse((obj, id) => {
        if ("ui" === id) {
            hovers.add(obj as GameObj<UIComp | AreaComp>);
        }
    });
    onUnuse((obj, id) => {
        if ("ui" === id) {
            hovers.delete(obj as GameObj<UIComp | AreaComp>);
        }
    });

    system<UIComp | AreaComp>(
        "hover",
        (hovers) => {
            const m = _k.game.fakeMouse
                ? _k.game.fakeMouse.pos
                : _k.app.mousePos();
            const isPressed = _k.game.fakeMouse
                ? _k.game.fakeMouse.isPressed
                : _k.app.isMousePressed();
            const isDown = _k.game.fakeMouse
                ? _k.game.fakeMouse.isPressed
                : _k.app.isMouseDown();
            for (const hover of hovers) {
                const isHovering = hover.hasScreenPoint(m);
                hover.setHoverAndMouseState(isHovering, isPressed, isDown);
            }
        },
        [SystemPhase.BeforeUpdate], // Because we use these states in update
        hovers,
    );

    installMouseHandlers();
    installKeyboardHandlers();
}

function installMouseHandlers() {
    if (_k.game.fakeMouse) {
        _k.game.fakeMouse.onPress(() => {
            const p = _k.game.fakeMouse
                ? _k.game.fakeMouse.pos
                : _k.app.mousePos();
            hovers.forEach(hover => {
                if (hover.hasScreenPoint(p)) {
                    hover.trigger("click");
                }
            });
        });
    }

    _k.app.onMousePress((m: MouseButton) => {
        const p = _k.game.fakeMouse ? _k.game.fakeMouse.pos : _k.app.mousePos();
        hovers.forEach(hover => {
            if (hover.hasScreenPoint(p)) {
                hover.trigger("click");
            }
        });
    });
}

function installKeyboardHandlers() {
    _k.app.onButtonPress((button: string) => {
        switch (button) {
            case "enter":
                _focus?.trigger("invoke");
                break;
            case "focus-next": // tab
                if (_focus) {
                    const children = _focus.parent!.children;
                    const index = children.indexOf(_focus);
                    const nextIndex = (index + 1) % children.length;
                    for (
                        let i = nextIndex;
                        i != index;
                        i = (i + 1) % children.length
                    ) {
                        const child = children[i];
                        if (child.canFocus) {
                            child.makeFocus();
                            return;
                        }
                    }
                }
                break;
            case "focus-prev": // shift-tab
                if (_focus) {
                    const children = _focus.parent!.children;
                    const index = children.indexOf(_focus);
                    const prevIndex = (index - 1) % children.length;
                    for (
                        let i = prevIndex;
                        i != index;
                        i = (i - 1) % children.length
                    ) {
                        const child = children[i];
                        if (child.canFocus) {
                            child.makeFocus();
                            return;
                        }
                    }
                }
                break;
            case "tab-next": // ctrl-tab
            case "tab-prev": // shift-ctrl-tab
        }
    });
}

let _focus: GameObj | null = null;

export function ui(opt: UICompOpt = {}): UIComp {
    let _isHovering: boolean = false; // True if currently hovering
    let _wasPressed: boolean = false; // True if hovering when the mouse went down
    let _isDown: boolean = false;

    installSystem();

    return {
        id: "ui",
        require: ["area"],
        canFocus: opt.canFocus ?? false,

        destroy(this: GameObj) {
            if (this === _focus) {
                _focus = null;
            }
        },

        isClicked(): boolean {
            return _isDown && _isHovering;
        },

        get isPressed(): boolean {
            return _wasPressed && _isHovering;
        },

        isHovering(this: GameObj<AreaComp>) {
            return _isHovering;
        },

        onClick(
            this: GameObj<UIComp | AreaComp>,
            action: () => void,
            btn: MouseButton = "left",
        ): KEventController {
            return this.on("click", action);
        },

        onHover(this: GameObj, action: () => void): KEventController {
            return this.on("hoverBegin", action);
        },

        onHoverUpdate(this: GameObj, action: () => void): KEventController {
            return this.on("hoverUpdate", action);
        },

        onHoverEnd(this: GameObj, action: () => void): KEventController {
            return this.on("hoverEnd", action);
        },

        setHoverAndMouseState(
            this: GameObj<UIComp>,
            isHovering: boolean,
            isPressed: boolean,
            isDown: boolean,
        ) {
            if (_isHovering != isHovering) {
                _isHovering = isHovering;
                if (isHovering) {
                    this.trigger("hoverBegin");
                }
                else {
                    this.trigger("hoverEnd");
                }
            }
            else {
                this.trigger("hoverUpdate");
            }

            // TODO: We should actually do this with the top most hovered object only
            // If the mouse just went down, and we were inside the area, we go into the pressed state
            if (isPressed && isHovering) {
                _wasPressed = true;
                if (this.canFocus) {
                    this.makeFocus();
                }
            }
            // If the mouse was released, we leave the pressed state
            else if (_wasPressed && !(isPressed || isDown)) {
                _wasPressed = false;
                // If we were hovering, we were invoked
                if (isHovering) {
                    this.trigger("invoke");
                }
            }

            _isDown = isDown;
        },

        onInvoke(this: GameObj, action: () => void) {
            return this.on("invoke", action);
        },

        get isFocus() {
            return (this as unknown as GameObj) === _focus;
        },

        get currentFocus() {
            return _focus;
        },

        makeFocus(this: GameObj) {
            if (this === _focus) {
                return;
            }
            if (_focus) {
                _focus.trigger("blur");
            }
            _focus = this;
            this.trigger("focus");
        },

        onFocus(this: GameObj, action: () => void): KEventController {
            return this.on("focus", action);
        },

        onBlur(this: GameObj, action: () => void): KEventController {
            return this.on("blur", action);
        },

        serialize() {
            const data: any = {};
            return data;
        },
    };
}

export function hoverFactory(data: any) {
    const opt: any = {};
    return ui(opt);
}

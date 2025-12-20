import type { KEventController } from "../../../events/events";
import { _k } from "../../../shared";
import type { Comp, GameObj } from "../../../types";
import { area } from "../physics/area";

export interface UIComp extends Comp {
    /**
     * True if the object can receive the focus.
     *
     * @since v4000.0
     */
    canFocus: boolean;

    /**
     * True if the object is being pressed.
     *
     * @since v4000.0
     */
    isPressed: boolean;

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

// let systemInstalled = false;
// TODO: use a live query for this, once it can use a Set
// const hovers: Set<GameObj<UIComp | AreaComp>> = new Set();

// TODO: replace this by the real broadphase filter
/*function retrieve(rect: Rect, cb: (obj: GameObj<any>) => void) {
    hovers.forEach(obj => cb(obj));
}*/

function installSystem() {
    /*
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

    for (const obj of _k.game.root.get("*", { recursive: true })) {
        if (obj.has("ui")) {
            hovers.add(obj as GameObj<UIComp | AreaComp>);
        }
    }

    system<UIComp | AreaComp>(
        "hover",
        (hovers) => {
            let p = _k.game.fakeMouse
                ? _k.game.fakeMouse.pos
                : _k.app.mousePos();
            const isPressed = _k.game.fakeMouse
                ? _k.game.fakeMouse.isPressed
                : _k.app.isMousePressed();
            const isDown = _k.game.fakeMouse
                ? _k.game.fakeMouse.isPressed
                : _k.app.isMouseDown();
            const hovering = new Set();
            p = toWorld(p);
            retrieve(new Rect(vec2(p.x - 1, p.y - 1), 3, 3), obj => {
                if (obj.hasWorldPoint(p)) {
                    hovering.add(obj);
                }
            });
            for (const hover of hovers) {
                if (!hover.exists()) { continue; } // Why do we get dead objects here?
                const isHovering = hovering.has(hover);
                hover.setHoverAndMouseState(isHovering, isPressed, isDown);
            }
        },
        [SystemPhase.BeforeUpdate], // Because we use these states in update
        hovers,
    );*/
    installKeyboardHandlers();
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

        add(this: GameObj) {
            if (!this.has("area")) {
                this.use(area());
            }
        },

        destroy(this: GameObj) {
            if (this === _focus) {
                _focus = null;
            }
        },

        get isPressed(): boolean {
            return _wasPressed && _isHovering;
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

export function uiFactory(data: any) {
    const opt: any = {};
    return ui(opt);
}

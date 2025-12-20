import type { KEventController } from "../../../events/events";
import { onClick } from "../../../events/globalEvents";
import { _k } from "../../../shared";
import type { Comp, GameObj } from "../../../types";
import { area, type AreaComp } from "../physics/area";

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
    installKeyboardHandlers();
    let _isPressed: boolean = false;

    return {
        id: "ui",
        require: ["area"],
        canFocus: opt.canFocus ?? false,

        add(this: GameObj<AreaComp>) {
            if (!this.has("area")) {
                this.use(area());
            }
            onClick(() => { _isPressed = true; });
            this.onMouseRelease(() => {
                if (_isPressed) {
                    if (this.isHovering()) {
                        this.trigger("invoke");
                    }
                    _isPressed = false;
                }
            });
        },

        destroy(this: GameObj) {
            if (this === _focus) {
                _focus = null;
            }
        },

        get isPressed(): boolean {
            return _isPressed;
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

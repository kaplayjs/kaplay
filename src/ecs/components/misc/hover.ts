import type { KEventController } from "../../../events/events";
import { onAdd, onDestroy, onUnuse, onUse } from "../../../events/globalEvents";
import { _k } from "../../../shared";
import type { Comp, GameObj, MouseButton } from "../../../types";
import { system, SystemPhase } from "../../systems/systems";
import type { AreaComp } from "../physics/area";

interface HoverCompPrivate extends Comp {
    setHoverAndClickState(isHovering: boolean, isClicked: boolean): void;
}

export interface HoverComp extends HoverCompPrivate {
    /**
     * True if the object has been clicked.
     */
    isClicked(): boolean;
    /**
     * True if the object is being hovered over.
     */
    isHovering(): boolean;
    /**
     * Register an event runs when clicked.
     *
     * @since v2000.1
     */
    onClick(f: () => void, btn?: MouseButton): KEventController;
    /**
     * Register an event runs once when hovered.
     *
     * @since v3000.0
     */
    onHover(action: () => void): KEventController;
    /**
     * Register an event runs every frame when hovered.
     *
     * @since v3000.0
     */
    onHoverUpdate(action: () => void): KEventController;
    /**
     * Register an event runs once when unhovered.
     *
     * @since v3000.0
     */
    onHoverEnd(action: () => void): KEventController;

    serialize(): any;
}

export type HoverCompOpt = {};

let systemInstalled = false;

function installSystem() {
    if (systemInstalled) return;
    systemInstalled = true;
    // TODO: use a live query for this
    const hovers: Set<GameObj<HoverComp | AreaComp>> = new Set();
    onAdd(obj => {
        if (obj.has("hover")) {
            hovers.add(obj as GameObj<HoverComp | AreaComp>);
        }
    });
    onDestroy(obj => {
        hovers.delete(obj as GameObj<HoverComp | AreaComp>);
    });
    onUse((obj, id) => {
        if ("hover" === id) {
            hovers.add(obj as GameObj<HoverComp | AreaComp>);
        }
    });
    onUnuse((obj, id) => {
        if ("hover" === id) {
            hovers.delete(obj as GameObj<HoverComp | AreaComp>);
        }
    });
    system("hover", () => {
        const m = _k.game.fakeMouse ? _k.game.fakeMouse.pos : _k.app.mousePos();
        const isClicked = _k.game.fakeMouse
            ? _k.game.fakeMouse.isPressed
            : _k.app.isMousePressed();
        hovers.forEach(hover => {
            const isHovering = hover.hasScreenPoint(m);
            hover.setHoverAndClickState(isHovering, isClicked && isHovering);
        });
    }, [
        SystemPhase.BeforeUpdate, // Because we use these states in update
    ]);
}

export function hover(opt: HoverCompOpt = {}): HoverComp {
    const _events: KEventController[] = [];
    let _isHovering: boolean = false;
    let _isClicked: boolean = false;

    installSystem();

    return {
        id: "hover",
        require: ["area"],

        destroy() {
            for (const event of _events) {
                event.cancel();
            }
        },

        isClicked(): boolean {
            return _isClicked;
        },

        isHovering(this: GameObj<AreaComp>) {
            return _isHovering;
        },

        // TODO: use just one onPress to check all hovers in one go
        onClick(
            this: GameObj<HoverComp | AreaComp>,
            action: () => void,
            btn: MouseButton = "left",
        ): KEventController {
            if (_k.game.fakeMouse) {
                // TODO: What about this one? It can't be cancelled
                _k.game.fakeMouse.onPress(() => {
                    const isHovering = this.hasScreenPoint(
                        _k.game.fakeMouse
                            ? _k.game.fakeMouse.pos
                            : _k.app.mousePos(),
                    );
                    if (isHovering) {
                        action();
                    }
                });
            }

            const e = this.onMousePress(btn, () => {
                const isHovering = this.hasScreenPoint(
                    _k.game.fakeMouse
                        ? _k.game.fakeMouse.pos
                        : _k.app.mousePos(),
                );
                if (isHovering) {
                    action();
                }
            });

            return e;
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

        setHoverAndClickState(
            this: GameObj<HoverComp>,
            isHovering: boolean,
            isClicked: boolean,
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

            _isClicked = isClicked;
        },

        serialize() {
            const data: any = {};
            return data;
        },
    };
}

export function hoverFactory(data: any) {
    const opt: any = {};
    return hover(opt);
}

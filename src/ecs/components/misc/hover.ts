import { DEF_ANCHOR } from "../../../constants/general";
import type { KEventController } from "../../../events/events";
import { toWorld } from "../../../game/camera";
import { anchorPt } from "../../../gfx/anchor";
import { Rect } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp, GameObj, MouseButton } from "../../../types";
import { isFixed } from "../../entity/utils";
import type { AreaComp } from "../physics/area";
import type { AnchorComp } from "../transform/anchor";

export interface HoverComp extends Comp {
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

export function hover(opt: HoverCompOpt = {}): HoverComp {
    const _events: KEventController[] = [];

    return {
        id: "hover",
        require: ["area"],

        add(this: GameObj<AreaComp | HoverComp>) {
            if (this.area.cursor) {
                _events.push(
                    // Should this go into a cursor comp?
                    this.onHover(() => _k.app.setCursor(this.area.cursor!)),
                );
            }
        },

        destroy() {
            for (const event of _events) {
                event.cancel();
            }
        },

        isClicked(): boolean {
            if (_k.game.fakeMouse) {
                return _k.game.fakeMouse.isPressed && this.isHovering();
            }

            return _k.app.isMousePressed() && this.isHovering();
        },

        isHovering(this: GameObj<AreaComp>) {
            if (_k.game.fakeMouse) {
                return this.hasScreenPoint(_k.game.fakeMouse.pos);
            }

            return this.hasScreenPoint(_k.app.mousePos());
        },

        onClick(
            this: GameObj<HoverComp>,
            action: () => void,
            btn: MouseButton = "left",
        ): KEventController {
            if (_k.game.fakeMouse) {
                _k.game.fakeMouse.onPress(() => {
                    if (this.isHovering()) {
                        action();
                    }
                });
            }

            const e = this.onMousePress(btn, () => {
                if (this.isHovering()) {
                    action();
                }
            });

            _events.push(e);

            return e;
        },

        onHover(this: GameObj, action: () => void): KEventController {
            let hovering = false;
            return this.onUpdate(() => {
                if (!hovering) {
                    if (this.isHovering()) {
                        hovering = true;
                        action();
                    }
                }
                else {
                    hovering = this.isHovering();
                }
            });
        },

        onHoverUpdate(this: GameObj, onHover: () => void): KEventController {
            return this.onUpdate(() => {
                if (this.isHovering()) {
                    onHover();
                }
            });
        },

        onHoverEnd(this: GameObj, action: () => void): KEventController {
            let hovering = false;
            return this.onUpdate(() => {
                if (hovering) {
                    if (!this.isHovering()) {
                        hovering = false;
                        action();
                    }
                }
                else {
                    hovering = this.isHovering();
                }
            });
        },

        serialize() {
            const data: any = {};
            return data;
        },
    };
}

export function areaFactory(data: any) {
    const opt: any = {};
    return hover(opt);
}

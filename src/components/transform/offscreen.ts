import { DEF_OFFSCREEN_DIS } from "../../constants";
import { k } from "../../kaplay";
import { Rect, vec2 } from "../../math/math";
import type { Comp, GameObj } from "../../types";
import type { KEventController } from "../../utils/";
import type { PosComp } from "./pos";

/**
 * The {@link offscreen `offscreen()`} component.
 *
 * @group Component Types
 */
export interface OffScreenComp extends Comp {
    /**
     * If object is currently out of view.
     */
    isOffScreen(): boolean;
    /**
     * Register an event that runs when object goes out of view.
     */
    onExitScreen(action: () => void): KEventController;
    /**
     * Register an event that runs when object enters view.
     */
    onEnterScreen(action: () => void): KEventController;
}

/**
 * Options for {@link offscreen `offscreen()`} component.
 *
 * @group Component Types
 */
export interface OffScreenCompOpt {
    /**
     * If hide object when out of view.
     */
    hide?: boolean;
    /**
     * If pause object when out of view.
     */
    pause?: boolean;
    /**
     * If destroy object when out of view.
     */
    destroy?: boolean;
    /**
     * The distance when out of view is triggered (default 200).
     *
     * @since v3000.0
     */
    distance?: number;
}

export function offscreen(opt: OffScreenCompOpt = {}): OffScreenComp {
    const distance = opt.distance ?? DEF_OFFSCREEN_DIS;
    let isOut = false;

    return {
        id: "offscreen",
        require: ["pos"],
        isOffScreen(this: GameObj<PosComp>): boolean {
            const pos = this.screenPos();

            // This is not possible, screenPos() without arguments returns the pos
            if (!pos) return false;

            const screenRect = new Rect(vec2(0), k.width(), k.height());
            return !k.testRectPoint(screenRect, pos)
                && screenRect.sdistToPoint(pos) > distance * distance;
        },
        onExitScreen(this: GameObj, action: () => void): KEventController {
            return this.on("exitView", action);
        },
        onEnterScreen(this: GameObj, action: () => void): KEventController {
            return this.on("enterView", action);
        },
        update(this: GameObj) {
            if (this.isOffScreen()) {
                if (!isOut) {
                    this.trigger("exitView");
                    isOut = true;
                }
                if (opt.hide) this.hidden = true;
                if (opt.pause) this.paused = true;
                if (opt.destroy) this.destroy();
            }
            else {
                if (isOut) {
                    this.trigger("enterView");
                    isOut = false;
                }
                if (opt.hide) this.hidden = false;
                if (opt.pause) this.paused = false;
            }
        },
    };
}

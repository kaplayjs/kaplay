import { DEF_OFFSCREEN_DIS } from "../../constants";
import { onUpdate } from "../../game";
import { height, width } from "../../gfx";
import { Rect, testRectPoint, vec2 } from "../../math/math";
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
     * If unpause object when back in view.
     */
    unpause?: boolean;
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

    const check = (self: GameObj<OffScreenComp>) => {
        if (self.isOffScreen()) {
            if (!isOut) {
                self.trigger("exitView");
                isOut = true;
            }
            if (opt.hide) self.hidden = true;
            if (opt.pause) self.paused = true;
            if (opt.destroy) self.destroy();
        }
        else {
            if (isOut) {
                self.trigger("enterView");
                isOut = false;
            }
            if (opt.hide) self.hidden = false;
            if (opt.pause) self.paused = false;
        }
    }

    return {
        id: "offscreen",
        require: ["pos"],
        isOffScreen(this: GameObj<PosComp>): boolean {
            const pos = this.screenPos();

            // This is not possible, screenPos() without arguments returns the pos
            if (!pos) return false;

            const screenRect = new Rect(vec2(0), width(), height());
            return !testRectPoint(screenRect, pos)
                && screenRect.sdistToPoint(pos) > distance * distance;
        },
        onExitScreen(this: GameObj, action: () => void): KEventController {
            return this.on("exitView", action);
        },
        onEnterScreen(this: GameObj, action: () => void): KEventController {
            return this.on("enterView", action);
        },
        add(this: GameObj<OffScreenComp>) {
            if (opt.pause && opt.unpause) onUpdate(() => check(this));
            else this.onUpdate(() => check(this));
        }
    };
}

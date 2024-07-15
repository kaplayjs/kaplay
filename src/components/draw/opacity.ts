import { game, k } from "../../kaplay";
import type { Comp, EaseFunc, TweenController } from "../../types";
import { toFixed } from "../../utils";

/**
 * The {@link opacity `opacity()`} component.
 *
 * @group Component Types
 */
export interface OpacityComp extends Comp {
    /** Opacity of the current object. */
    opacity: number;
    /** Fade in at the start. */
    fadeIn(time?: number, easeFunc?: EaseFunc): TweenController;
    /** Fade out at the start. */
    fadeOut(time?: number, easeFunc?: EaseFunc): TweenController;
}

export function opacity(a: number): OpacityComp {
    return {
        id: "opacity",
        opacity: a ?? 1,
        fadeIn(time = 1, easeFunc = k.easings.linear): TweenController {
            return game.root.tween(
                0,
                this.opacity,
                time,
                (a) => this.opacity = a,
                easeFunc,
            );
        },
        fadeOut(time = 1, easeFunc = k.easings.linear): TweenController {
            return game.root.tween(
                this.opacity,
                0,
                time,
                (a) => this.opacity = a,
                easeFunc,
            );
        },
        inspect() {
            return `opacity: ${toFixed(this.opacity, 1)}`;
        },
    };
}

import { getKaboomContext } from "../../kaboom";
import type { Comp, EaseFunc, TweenController } from "../../types";

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
    const k = getKaboomContext(this);
    const { toFixed } = k._k;

    return {
        id: "opacity",
        opacity: a ?? 1,
        inspect() {
            return `${toFixed(this.opacity, 1)}`;
        },
        fadeIn(time = 1, easeFunc = k.easings.linear): TweenController {
            return k.tween(
                0,
                this.opacity,
                time,
                (a) => this.opacity = a,
                easeFunc,
            );
        },
        fadeOut(time = 1, easeFunc = k.easings.linear): TweenController {
            return k.tween(
                this.opacity,
                0,
                time,
                (a) => this.opacity = a,
                easeFunc,
            );
        },
    };
}

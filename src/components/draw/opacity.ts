import { getInternalContext, getKaboomContext } from "@/kaboom";
import type { OpacityComp, TweenController } from "@/types";

export function opacity(a: number): OpacityComp {
    const k = getKaboomContext(this);
    const internal = getInternalContext(k);

    return {
        id: "opacity",
        opacity: a ?? 1,
        inspect() {
            return `${internal.toFixed(this.opacity, 1)}`;
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

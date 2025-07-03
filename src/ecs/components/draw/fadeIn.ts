import { map } from "../../../math/math.js";
import { _k } from "../../../shared.js";
import type { Comp, GameObj } from "../../../types.js";
import type { OpacityComp } from "./opacity.js";

export function fadeIn(time: number = 1): Comp {
    let finalOpacity: number;
    let t = 0;
    let done = false;

    return {
        require: ["opacity"],
        add(this: GameObj<OpacityComp>) {
            finalOpacity = this.opacity;
            this.opacity = 0;
        },
        update(this: GameObj<OpacityComp>) {
            if (done) return;
            t += _k.app.dt();
            this.opacity = map(t, 0, time, 0, finalOpacity);

            if (t >= time) {
                this.opacity = finalOpacity;
                done = true;
            }
        },
    };
}

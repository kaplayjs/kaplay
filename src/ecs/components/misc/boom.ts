import { vec2 } from "../../../math/math.js";
import { _k } from "../../../shared.js";
import type { Comp, GameObj } from "../../../types.js";
import type { ScaleComp } from "../transform/scale.js";

export function boom(speed: number = 2, size: number = 1): Comp {
    let time = 0;
    return {
        require: ["scale"],
        update(this: GameObj<ScaleComp>) {
            const s = Math.sin(time * speed) * size;
            if (s < 0) {
                this.destroy();
            }
            this.scale = vec2(s);
            time += _k.app.dt();
        },
    };
}

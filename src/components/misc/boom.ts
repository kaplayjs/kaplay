import { dt } from "../../app";
import { vec2 } from "../../math";
import type { Comp, GameObj } from "../../types";
import type { ScaleComp } from "../transform/scale";

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
            time += dt();
        },
    };
}

import { Vec2 } from "../../math/math";
import type { EmptyComp, GameObj } from "../../types";
import type { PosComp } from "./pos";

export function move(dir: number | Vec2, speed: number): EmptyComp {
    const d = typeof dir === "number" ? Vec2.fromAngle(dir) : dir.unit();
    return {
        id: "move",
        require: ["pos"],
        update(this: GameObj<PosComp>) {
            this.move(d.scale(speed));
        },
    };
}

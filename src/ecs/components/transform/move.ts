import { Vec2 } from "../../../math/Vec2";
import type { EmptyComp, GameObj } from "../../../types";
import type { PosComp } from "./pos";

export function move(
    dir: number | Vec2,
    speed: number,
): EmptyComp & { serialize: () => any } {
    const d = typeof dir === "number" ? Vec2.fromAngle(dir) : dir.unit();
    return {
        id: "move",
        require: ["pos"],
        update(this: GameObj<PosComp>) {
            this.move(d.scale(speed));
        },
        serialize() {
            return {
                dir: dir instanceof Vec2 ? { x: dir.x, y: dir.y } : dir,
                speed: speed,
            };
        },
    };
}

export function moveFactory(data: any) {
    return move(data.dir, data.speed);
}

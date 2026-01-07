import { Vec2, type Vec2Like } from "../../../math/Vec2";
import type { Comp, GameObj } from "../../../types";
import type { PosComp } from "./pos";

/**
 * The serialized {@link move `move()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
interface SerializedMoveComp {
    dir: Vec2Like | number;
    speed: number;
}

/**
 * The {@link move `move()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface MoveComp extends Comp {
    serialize: () => SerializedMoveComp;
}

export function move(
    dir: number | Vec2,
    speed: number,
): MoveComp {
    const d = typeof dir === "number" ? Vec2.fromAngle(dir) : dir.unit();
    return {
        id: "move",
        require: ["pos"],
        update(this: GameObj<PosComp>) {
            this.move(d.scale(speed));
        },
        serialize() {
            return {
                dir: dir instanceof Vec2 ? dir.serialize() : dir,
                speed: speed,
            };
        },
    };
}

export function moveFactory(data: SerializedMoveComp) {
    if (typeof data.dir == "object") {
        return move(new Vec2(data.dir.x, data.dir.y), data.speed);
    }
    else {
        return move(data.dir, data.speed);
    }
}

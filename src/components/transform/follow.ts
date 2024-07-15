import { Vec2, vec2 } from "../../math/math";
import type { Comp, GameObj } from "../../types";
import type { PosComp } from "./pos";

/**
 * The {@link follow `follow()`} component.
 *
 * @group Component Types
 */
export interface FollowComp extends Comp {
    follow: {
        obj: GameObj;
        offset: Vec2;
    };
}

export function follow(obj: GameObj, offset?: Vec2): FollowComp {
    return {
        id: "follow",
        require: ["pos"],
        follow: {
            obj: obj,
            offset: offset ?? vec2(0),
        },
        add(this: GameObj<FollowComp | PosComp>) {
            if (obj.exists()) {
                this.pos = this.follow.obj.pos.add(this.follow.offset);
            }
        },
        update(this: GameObj<FollowComp | PosComp>) {
            if (obj.exists()) {
                this.pos = this.follow.obj.pos.add(this.follow.offset);
            }
        },
    };
}

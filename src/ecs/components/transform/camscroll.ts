import { getCamPos } from "../../../game/camera";
import { vec2, type Vec2Args } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import type { Comp, GameObj } from "../../../types";
import type { PosComp } from "./pos";

/**
 * The {@link parallax `parallax()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface ParallaxComp extends Comp {
    /**
     * The current factor for object scroll
     *
     * @returns The current factor of the object as a {@link Vec2 `Vec2`}
     */
    factor: Vec2;

    basePos?: Vec2;
}

export function parallax(...args: Vec2Args): ParallaxComp {
    return {
        id: "scroll",
        require: ["pos"],
        factor: vec2(...args),
        basePos: vec2(),

        update(this: GameObj<PosComp | ParallaxComp>) {
            const cam = getCamPos();

            if (!this.basePos) {
                this.basePos = this.pos.clone();
            }

            this.pos.x = this.basePos.x - cam.x * this.factor.x;
            this.pos.y = this.basePos.y - cam.y * this.factor.y;
        },

        inspect() {
            return `scrollFactor: vec2(${this.factor.x}, ${this.factor.x})`;
        },
    };
}

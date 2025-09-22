import { getCamPos } from "../../../game/camera";
import { vec2, type Vec2Args } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import type { Comp, GameObj } from "../../../types";
import type { PosComp } from "./pos";

/**
 * The {@link camscroll `camscroll()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface CamScrollComp extends Comp {
    /**
     * The current factor for object scroll
     *
     * @returns The current factor of the object as a {@link Vec2 `Vec2`}
     */
    factor: Vec2;

    basePos: Vec2;
}

export function scrollcam(...args: Vec2Args): CamScrollComp {
    return {
        id: "scroll",
        require: ["pos"],
        factor: vec2(...args),
        basePos: vec2(),

        update() {
            const obj = this as unknown as GameObj<PosComp> & {
                basePos: Vec2 | null;
            };
            const cam = getCamPos();

            if (!obj.basePos) {
                obj.basePos = obj.pos.clone();
            }

            obj.pos.x = obj.basePos.x - cam.x * this.factor.x;
            obj.pos.y = obj.basePos.y - cam.y * this.factor.y;
        },

        inspect() {
            return `scrollFactor: vec2(${this.factor.x}, ${this.factor.x})`;
        },
    };
}

import { getCamPos } from "../../../game/camera";
import { vec2, type Vec2Args } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
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

    lastCam?: Vec2 | null;
}

export function parallax(...args: Vec2Args): ParallaxComp {
    return {
        id: "parallax",
        require: ["pos"],
        factor: vec2(...args),
        lastCam: null as Vec2 | null,

        update(this: GameObj<PosComp | ParallaxComp>) {
            const cam: Vec2 = getCamPos();

            if (!this.lastCam) {
                this.lastCam = cam.clone();
                return;
            }

            const delta: Vec2 = cam.sub(this.lastCam);
            this.pos = this.pos.add(
                delta.x * (1 - this.factor.x),
                delta.y * (1 - this.factor.y),
            );

            this.lastCam = cam.clone();
        },

        inspect() {
            return `scrollFactor: vec2(${this.factor.x}, ${this.factor.x})`;
        },
    };
}

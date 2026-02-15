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

    follow?: Vec2 | null;
}

export function parallax(...args: Vec2Args): ParallaxComp {
    return {
        id: "parallax",
        require: ["pos"],
        factor: vec2(...args),
        lastCam: null as Vec2 | null,
        follow: null as Vec2 | null,

        update(this: GameObj<PosComp | ParallaxComp>) {
            const cam: Vec2 = getCamPos();

            if (!this.lastCam) {
                // kinda strange ngl idk why this works but works.. //
                this.lastCam = this.follow?.serialize() === undefined
                    ? cam?.clone()
                    : this.follow?.clone();
                // console.log(typeof(this.follow)?.serialize());
                return;
            }

            const delta: Vec2 = cam.sub(this.lastCam);
            // console.log(delta.serialize())

            this.moveBy(
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

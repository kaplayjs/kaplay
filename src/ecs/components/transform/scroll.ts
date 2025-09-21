import { getCamPos } from "../../../game/camera";
import { vec2, type Vec2Args } from "../../../math/math";
import type { Vec2 } from "../../../math/Vec2";
import type { Comp, GameObj } from "../../../types";

export interface ScrollFactorComp extends Comp {
    pos: Vec2;
    factor: Vec2;

    set(x: number, y: number): void;
}

export function scroll(...args: Vec2Args) {
    return {
        id: "scroll",
        require: ["pos"],
        factor: vec2(...args),

        update(this: GameObj) {
            let cameraPos: Vec2 = getCamPos();
            let objPos: Vec2 = this.worldPos();

            this.pos.x = objPos.x - cameraPos.x * this.factor.x;
            this.pos.y = objPos.y - cameraPos.y * this.factor.y;
        },

        set(x: number, y: number) {
        },

        inspect() {
            return `scrollFactor: vec2(${this.factor.x}, ${this.factor.x})`;
        },
    };
}

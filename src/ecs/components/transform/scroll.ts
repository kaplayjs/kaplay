import { getCamPos } from "../../../game/camera";
import { vec2 } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import type { Comp, GameObj } from "../../../types";
import type { PosComp } from "./pos";

export interface CamScrollComp extends Comp {
    factor: Vec2;

    setScrollFactor(x: number, y: number): void;
    getScrollFactor(): Vec2;
}

export function camscroll(x: number = 0, y: number = 1): CamScrollComp {
    return {
        id: "scroll",
        require: ["pos"],
        factor: vec2(x, y),

        update() {
            //let cameraPos: Vec2 = getCamPos();
            //let objPos: any = this.worldPos();

            //this.pos.x = objPos.x - cameraPos.x * this.factor.x;
            //this.pos.y = objPos.y - cameraPos.y * this.factor.y;

            const self = this as unknown as GameObj<PosComp>;
            const cam = getCamPos();

            const objPos = self.worldPos();
            if (objPos)
            {
                self.pos.x = objPos.x - cam.x * this.factor.x;
                self.pos.y = objPos.y - cam.y * this.factor.y;
            }
        },

        setScrollFactor(x: number, y: number) {
            this.factor.x, this.factor.y = x, y;
        },

        getScrollFactor(){
            return this.factor.clone();
        },

        inspect() {
            return `scrollFactor: vec2(${this.factor.x}, ${this.factor.x})`;
        }
    };
}
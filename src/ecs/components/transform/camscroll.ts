import { getCamPos } from "../../../game/camera";
import { vec2 } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import type { Comp, GameObj } from "../../../types";
import type { PosComp } from "./pos";


/**
 * The {@link camscroll `camscroll()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface CamScrollComp extends Comp 
{
    /**
     * The current factor for object scroll
     * 
     * @returns The current factor of the object as a {@link Vec2 `Vec2`}
     */
    factor: Vec2;

    /**
     * Set the object scroll factor
     * @param x number
     * @param y number
     */
    setScrollFactor(x: number, y: number): void;

    /**
     * Get the current object scroll factor
     * @returns The current factor of the object as a {@link Vec2 `Vec2`}
     */
    getScrollFactor(): Vec2;
}


export function scrollcam(x: number = 1, y: number = 1): CamScrollComp 
{
    let baseObjPos: Vec2;
    
    return {
        id: "scroll",
        require: ["pos"],
        factor: new Vec2(x, y),
        //@ts-ignore
        basePos: null as Vec2 | null,

        add()
        {
            let self = this as unknown as GameObj<PosComp>;
            console.log(x, y);
        },

        update() 
        {
            const obj = this as unknown as GameObj<PosComp> & { basePos: Vec2 | null };
            const cam = getCamPos();


            if (!obj.basePos) {
                obj.basePos = obj.pos.clone();
            }

            obj.pos.x = obj.basePos.x - cam.x * this.factor.x;
            obj.pos.y = obj.basePos.y - cam.y * this.factor.y;
        },

        setScrollFactor(x: number, y: number) { 
            this.factor.x = x;
            this.factor.y =  y; 
        },

        getScrollFactor() { return this.factor.clone() },

        inspect() { return `scrollFactor: vec2(${this.factor.x}, ${this.factor.x})`; }
    };
}
import { getInternalContext, getKaboomContext } from "../../kaboom";
import { Rect, vec2 } from "../../math";
import type { GameObj, UVQuadComp } from "../../types";

export function uvquad(w: number, h: number): UVQuadComp {
    const k = getKaboomContext(this);
    const internal = getInternalContext(k);

    return {
        id: "rect",
        width: w,
        height: h,
        draw(this: GameObj<UVQuadComp>) {
            k.drawUVQuad(Object.assign(internal.getRenderProps(this), {
                width: this.width,
                height: this.height,
            }));
        },
        renderArea() {
            return new Rect(vec2(0), this.width, this.height);
        },
        inspect() {
            return `${Math.ceil(this.width)}, ${Math.ceil(this.height)}`;
        },
    };
}

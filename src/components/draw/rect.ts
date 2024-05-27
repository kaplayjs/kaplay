import { getInternalContext, getKaboomContext } from "@/kaboom";
import { Rect, vec2 } from "@/math";
import type { GameObj, RectComp, RectCompOpt } from "@/types";

export function rect(w: number, h: number, opt: RectCompOpt = {}): RectComp {
    const k = getKaboomContext(this);
    const internal = getInternalContext(k);

    return {
        id: "rect",
        width: w,
        height: h,
        radius: opt.radius || 0,
        draw(this: GameObj<RectComp>) {
            k.drawRect(Object.assign(internal.getRenderProps(this), {
                width: this.width,
                height: this.height,
                radius: this.radius,
                fill: opt.fill,
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

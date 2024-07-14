import { getRenderProps } from "../../game/utils";
import { drawUVQuad } from "../../gfx";
import { Rect, vec2 } from "../../math";
import type { Comp, GameObj, KaboomCtx } from "../../types";

/**
 * The {@link uvquad `uvquad()`} component.
 *
 * @group Component Types
 */
export interface UVQuadComp extends Comp {
    draw: Comp["draw"];
    /**
     * Width of rect.
     */
    width: number;
    /**
     * Height of height.
     */
    height: number;
    /**
     * @since v3000.0
     */
    renderArea(): Rect;
}
export function uvquad(
    this: KaboomCtx,
    w: number,
    h: number,
): UVQuadComp {
    return {
        id: "rect",
        width: w,
        height: h,
        draw(this: GameObj<UVQuadComp>) {
            drawUVQuad(Object.assign(getRenderProps(this), {
                width: this.width,
                height: this.height,
            }));
        },
        renderArea() {
            return new Rect(vec2(0), this.width, this.height);
        },
        inspect() {
            return `uvquad: (${Math.ceil(this.width)}w, ${
                Math.ceil(this.height)
            })h`;
        },
    };
}

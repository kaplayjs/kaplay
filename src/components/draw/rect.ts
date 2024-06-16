import { getKaboomContext } from "../../kaboom";
import { Rect, vec2 } from "../../math";
import type { Comp, GameObj } from "../../types";

/**
 * The {@link rect `rect()`} component.
 *
 * @group Component Types
 */
export interface RectComp extends Comp {
    draw: Comp["draw"];
    /**
     * Width of rectangle.
     */
    width: number;
    /**
     * Height of rectangle.
     */
    height: number;
    /**
     * The radius of each corner.
     */
    radius?: number;
    /**
     * @since v3000.0
     */
    renderArea(): Rect;
}

/**
 * Options for the {@link rect `rect()`} component.
 *
 * @group Component Types
 */
export interface RectCompOpt {
    /**
     * Radius of the rectangle corners.
     */
    radius?: number;
    /**
     * If fill the rectangle (useful if you only want to render outline with outline() component).
     */
    fill?: boolean;
}

export function rect(w: number, h: number, opt: RectCompOpt = {}): RectComp {
    const k = getKaboomContext(this);
    const { getRenderProps } = k._k;

    return {
        id: "rect",
        width: w,
        height: h,
        radius: opt.radius || 0,
        draw(this: GameObj<RectComp>) {
            k.drawRect(Object.assign(getRenderProps(this), {
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

import type { LineCap, LineJoin } from "../../../gfx/draw/drawLine";
import { Color, rgb } from "../../../math/color";
import type { Comp, Outline } from "../../../types";

/**
 * The {@link outline `outline()`} component.
 *
 * @group Component Types
 */
export interface OutlineComp extends Comp {
    outline: Outline;
    serialize() : { 
        width?: number, 
        color?: { r: number, g: number, b: number },
        opacity?: number,
        join?: LineJoin,
        miterLimit?: number
        cap?: LineCap,
    },
}

export function outline(
    width: number = 1,
    color: Color = rgb(0, 0, 0),
    opacity: number = 1,
    join: LineJoin = "miter",
    miterLimit: number = 10,
    cap: LineCap = "butt",
): OutlineComp {
    return {
        id: "outline",
        outline: {
            width,
            color,
            opacity,
            join,
            miterLimit,
            cap,
        },
        inspect() {
            return `outline: ${this.outline.width}px, ${this.outline.color}`;
        },
        serialize(): ReturnType<OutlineComp["serialize"]> {
          return {
            cap: this.outline.cap,
            color: this.outline.color,
            join: this.outline.join,
            miterLimit: this.outline.miterLimit,
            opacity: this.outline.opacity,
            width: this.outline.width
          }  
        },
    };
}

export function outlineFactory(data: ReturnType<OutlineComp["serialize"]>) {
    return outline(data.width, rgb(data.color?.r ?? 255, data.color?.g ?? 255, data.color?.b ?? 255), data.opacity, data.join, data.miterLimit, data.cap)
}

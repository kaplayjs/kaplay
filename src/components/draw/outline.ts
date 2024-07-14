import type { LineCap, LineJoin } from "../../gfx";
import { Color, rgb } from "../../math/color";
import type { Comp, Outline } from "../../types";

/**
 * The {@link outline `outline()`} component.
 *
 * @group Component Types
 */
export interface OutlineComp extends Comp {
    outline: Outline;
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
    };
}

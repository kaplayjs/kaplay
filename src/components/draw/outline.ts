import { Color, rgb } from "@/math";
import type { LineCap, LineJoin, OutlineComp } from "@/types";

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
            return `${this.outline.width}, ${this.outline.color}`;
        }
    };
}

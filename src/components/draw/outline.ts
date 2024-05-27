import { Color, rgb } from "@/math";
import type { OutlineComp } from "@/types";

export function outline(
    width: number = 1,
    color: Color = rgb(0, 0, 0),
): OutlineComp {
    return {
        id: "outline",
        outline: {
            width,
            color,
        },
    };
}

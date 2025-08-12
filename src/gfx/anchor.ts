import {
    BOTTOM,
    BOTTOM_LEFT,
    BOTTOM_RIGHT,
    CENTER,
    LEFT,
    RIGHT,
    TOP,
    TOP_LEFT,
    TOP_RIGHT,
} from "../constants/math";
import { Vec2 } from "../math/Vec2";
import { type Anchor } from "../types";
import type { TextAlign } from "./draw/drawText";

// convert anchor string to a vec2 offset
export function anchorPt(orig: Anchor | Vec2): Vec2 {
    switch (orig) {
        case "topleft":
            return TOP_LEFT;
        case "top":
            return TOP;
        case "topright":
            return TOP_RIGHT;
        case "left":
            return LEFT;
        case "center":
            return CENTER;
        case "right":
            return RIGHT;
        case "botleft":
            return BOTTOM_LEFT;
        case "bot":
            return BOTTOM;
        case "botright":
            return BOTTOM_RIGHT;
        default:
            return orig;
    }
}

export function alignPt(align: TextAlign): number {
    switch (align) {
        case "left":
            return 0;
        case "center":
            return 0.5;
        case "right":
            return 1;
        default:
            return 0;
    }
}

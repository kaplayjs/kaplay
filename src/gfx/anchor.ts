import { Vec2 } from "../math/math";
import { type Anchor } from "../types";
import type { TextAlign } from "./draw";

const TOP_LEFT = new Vec2(-1, -1);
const TOP = new Vec2(0, -1);
const TOP_RIGHT = new Vec2(1, -1);
const LEFT = new Vec2(-1, 0);
const CENTER = new Vec2(0, 0);
const RIGHT = new Vec2(1, 0);
const BOTTOM_LEFT = new Vec2(-1, 1);
const BOTTOM = new Vec2(0, 1);
const BOTTOM_RIGHT = new Vec2(1, 1);

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

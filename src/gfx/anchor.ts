import { Vec2 } from "../math/math";
import { type Anchor } from "../types";
import type { TextAlign } from "./draw";

// convert anchor string to a vec2 offset
export function anchorPt(orig: Anchor | Vec2): Vec2 {
    switch (orig) {
        case "topleft":
            return new Vec2(-1, -1);
        case "top":
            return new Vec2(0, -1);
        case "topright":
            return new Vec2(1, -1);
        case "left":
            return new Vec2(-1, 0);
        case "center":
            return new Vec2(0, 0);
        case "right":
            return new Vec2(1, 0);
        case "botleft":
            return new Vec2(-1, 1);
        case "bot":
            return new Vec2(0, 1);
        case "botright":
            return new Vec2(1, 1);
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

export function createEmptyAudioBuffer(ctx: AudioContext) {
    return ctx.createBuffer(1, 1, 44100);
}

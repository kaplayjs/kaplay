import type { FrameBuffer } from "../../gfx";
import type { GameObj } from "../../types";

export function drawon(c: FrameBuffer) {
    return {
        add(this: GameObj) {
            this.canvas = c;
        },
    };
}

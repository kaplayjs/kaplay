import { FrameBuffer, GameObj } from "@/types";

export function drawon(c: FrameBuffer) {
    return {
        add(this: GameObj) {
            this.canvas = c;
        },
    };
}

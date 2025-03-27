import { Picture, FrameBuffer } from "../../gfx";
import type { Comp, GameObj } from "../../types";

export type DrawonOpt = {
    childrenOnly?: boolean;
    refreshOnly?: boolean;
}

export interface DrawonComp extends Comp {
    refresh(): void
}

export function drawon(c: FrameBuffer | Picture, opt?: DrawonOpt) {
    return {
        add(this: GameObj) {
            this.target = {
                destination: c,
                childrenOnly: opt?.childrenOnly,
                refreshOnly: opt?.refreshOnly
            };
        },
        refresh(this: GameObj<DrawonComp>) {
            this.target.isFresh = false;
        }
    };
}

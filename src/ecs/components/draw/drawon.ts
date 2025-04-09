import type { FrameBuffer } from "../../../gfx/classes/FrameBuffer";
import type { Picture } from "../../../gfx/draw/drawPicture";
import type { Comp, GameObj } from "../../../types";

export type DrawonOpt = {
    childrenOnly?: boolean;
    refreshOnly?: boolean;
};

export interface DrawonComp extends Comp {
    refresh(): void;
}

export function drawon(c: FrameBuffer | Picture, opt?: DrawonOpt) {
    return {
        add(this: GameObj) {
            this.target = {
                destination: c,
                childrenOnly: opt?.childrenOnly,
                refreshOnly: opt?.refreshOnly,
            };
        },
        refresh(this: GameObj<DrawonComp>) {
            if (this.target) {
                this.target.isFresh = false;
            }
        },
    };
}

import type { Picture } from "../../../gfx/draw/drawPicture";
import type { FrameBuffer } from "../../../gfx/FrameBuffer";
import type { Comp, GameObj } from "../../../types";

/**
 * Options for the {@link drawon `drawon()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export type DrawonCompOpt = {
    childrenOnly?: boolean;
    refreshOnly?: boolean;
};

/**
 * The {@link drawon `drawon()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface DrawonComp extends Comp {
    refresh(): void;
}

export function drawon(c: FrameBuffer | Picture, opt?: DrawonCompOpt) {
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

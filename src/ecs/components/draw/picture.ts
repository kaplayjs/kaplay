import { getRenderProps } from "../../../game/utils";
import { drawPicture, type Picture } from "../../../gfx/draw/drawPicture";
import type { Comp, GameObj } from "../../../types";

/**
 * The {@link picture `picture()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface PictureComp extends Comp {
    picture: Picture;
}

/**
 * Options for the {@link picture `picture()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export type PictureCompOpt = {
    picture: Picture;
};

export function picture(picture: Picture): PictureComp {
    return {
        id: "picture",
        picture: picture,
        draw(this: GameObj<PictureComp>) {
            drawPicture(this.picture, getRenderProps(this));
        },
    };
}

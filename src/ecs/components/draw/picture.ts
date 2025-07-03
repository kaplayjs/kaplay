import { getRenderProps } from "../../../game/utils.js";
import { drawPicture, type Picture } from "../../../gfx/draw/drawPicture.js";
import type { Comp, GameObj } from "../../../types.js";

export interface PictureComp extends Comp {
    picture: Picture;
}

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

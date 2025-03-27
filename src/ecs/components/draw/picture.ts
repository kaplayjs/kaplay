import { getRenderProps } from "../../../game";
import { drawPicture, type Picture } from "../../../gfx";
import type { Comp, GameObj } from "../../../types";

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

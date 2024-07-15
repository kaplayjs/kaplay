import { SPRITE_ATLAS_HEIGHT, SPRITE_ATLAS_WIDTH } from "../constants";
import { assets } from "../kaplay";
import { Quad } from "../math";
import { type Asset, fetchJSON, load } from "./asset";
import {
    type LoadSpriteOpt,
    type LoadSpriteSrc,
    slice,
    SpriteData,
} from "./sprite";
import { fixURL } from "./utils";

export type SpriteAtlasData = Record<string, SpriteAtlasEntry>;

/**
 * A sprite in a sprite atlas.
 */
export type SpriteAtlasEntry = LoadSpriteOpt & {
    /**
     * X position of the top left corner.
     */
    x: number;
    /**
     * Y position of the top left corner.
     */
    y: number;
    /**
     * Sprite area width.
     */
    width: number;
    /**
     * Sprite area height.
     */
    height: number;
};

export function loadSpriteAtlas(
    src: LoadSpriteSrc,
    data: SpriteAtlasData | string,
): Asset<Record<string, SpriteData>> {
    src = fixURL(src);
    if (typeof data === "string") {
        return load(
            new Promise((res, rej) => {
                fetchJSON(data).then((json) => {
                    loadSpriteAtlas(src, json).then(res).catch(rej);
                });
            }),
        );
    }
    return load(
        SpriteData.from(src).then((atlas) => {
            const map: Record<string, SpriteData> = {};

            for (const name in data) {
                const info = data[name];
                const quad = atlas.frames[0];
                const w = SPRITE_ATLAS_WIDTH * quad.w;
                const h = SPRITE_ATLAS_HEIGHT * quad.h;
                const frames = info.frames
                    ? info.frames.map((f) =>
                        new Quad(
                            quad.x + (info.x + f.x) / w * quad.w,
                            quad.y + (info.y + f.y) / h * quad.h,
                            f.w / w * quad.w,
                            f.h / h * quad.h,
                        )
                    )
                    : slice(
                        info.sliceX || 1,
                        info.sliceY || 1,
                        quad.x + info.x / w * quad.w,
                        quad.y + info.y / h * quad.h,
                        info.width / w * quad.w,
                        info.height / h * quad.h,
                    );
                const spr = new SpriteData(atlas.tex, frames, info.anims);
                assets.sprites.addLoaded(name, spr);
                map[name] = spr;
            }
            return map;
        }),
    );
}

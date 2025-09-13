import { SPRITE_ATLAS_HEIGHT, SPRITE_ATLAS_WIDTH } from "../constants/general";
import { Quad } from "../math/math";
import { _k } from "../shared";
import { type Asset, fetchJSON } from "./asset";
import { loadAsset } from "./buckets";
import {
    type LoadSpriteOpt,
    type LoadSpriteSrc,
    slice,
    SpriteData,
} from "./sprite";
import { fixURL } from "./utils";

/**
 * @group Assets
 * @subgroup Data
 */
export type SpriteAtlasData = Record<string, SpriteAtlasEntry>;

/**
 * A sprite in a sprite atlas.
 *
 * @group Assets
 * @subgroup Types
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
        return loadAsset(
            new Promise((res, rej) => {
                fetchJSON(data).then((json) => {
                    loadSpriteAtlas(src, json).then(res).catch(rej);
                });
            }),
        );
    }
    return loadAsset(
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
                _k.assets.buckets.sprites.addLoaded(name, spr);
                map[name] = spr;
            }
            return map;
        }),
    );
}

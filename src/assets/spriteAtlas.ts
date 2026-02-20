import { Quad } from "../math/math";
import { _k } from "../shared";
import {
    type Asset,
    fetchJSON,
    load,
    loadImg,
    spriteSrcToImage,
} from "./asset";
import { type LoadSpriteOpt, type LoadSpriteSrc, SpriteData } from "./sprite";
import { slice } from "./utils";
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
        return load(
            new Promise((res, rej) => {
                fetchJSON(data).then((json) => {
                    loadSpriteAtlas(src, json).then(res).catch(rej);
                });
            }),
        );
    }
    return load(
        spriteSrcToImage(src).then(img => {
            const map: Record<string, SpriteData> = {};

            for (const name in data) {
                let {
                    x,
                    y,
                    width,
                    height,
                    frames,
                    sliceX,
                    sliceY,
                    anims,
                    slice9,
                } = data[name];
                const w = img.width, h = img.height;
                const mainQuad = new Quad(
                    x / w,
                    y / h,
                    width / w,
                    height / h,
                );
                frames ??= slice(sliceX || 1, sliceY || 1);
                const spr = new SpriteData(
                    frames.map(q =>
                        _k.assets.packer.add(img, mainQuad.scale(q))
                    ),
                    anims,
                    slice9,
                );
                _k.assets.sprites.addLoaded(name, spr);
                map[name] = spr;
            }
            _k.assets.packer.refreshIfPending();
            return map;
        }),
    );
}

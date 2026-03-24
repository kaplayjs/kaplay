import { Quad } from "../math/math";
import { _k } from "../shared";
import { type Asset, fetchJSON, load, spriteSrcToImage } from "./asset";
import {
    fixFramesPixelsToFractionOfImage,
    type LoadSpriteOpt,
    type LoadSpriteSrc,
    SpriteData,
} from "./sprite";
import { fixURL, slice } from "./utils";

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
            const wholeImageWidth = img.width, wholeImageHeight = img.height;

            for (const name in data) {
                let {
                    x: spriteSectionX,
                    y: spriteSectionY,
                    width: spriteSectionWidth,
                    height: spriteSectionHeight,
                    frames,
                    sliceX,
                    sliceY,
                    anims,
                    slice9,
                    filter,
                } = data[name];
                filter ??= _k.globalOpt.texFilter ?? "nearest";
                const mainQuad = new Quad(
                    spriteSectionX / wholeImageWidth,
                    spriteSectionY / wholeImageHeight,
                    spriteSectionWidth / wholeImageWidth,
                    spriteSectionHeight / wholeImageHeight,
                );
                if (frames) {
                    frames = fixFramesPixelsToFractionOfImage(
                        frames,
                        spriteSectionWidth,
                        spriteSectionHeight,
                    );
                }
                else {
                    frames = slice(sliceX || 1, sliceY || 1);
                }
                const spr = new SpriteData(
                    frames.map(q =>
                        _k.assets.packer.add(img, filter, mainQuad.scale(q))
                    ),
                    anims,
                    slice9,
                );
                _k.assets.sprites.addLoaded(name, spr);
                map[name] = spr;
            }
            return map;
        }),
    );
}

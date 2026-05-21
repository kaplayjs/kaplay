import type { Frame } from "../gfx/TexPacker";
import { Quad } from "../math/math";
import { _k } from "../shared";
import type { TexFilter } from "../types";
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
export type SpriteAtlasEntry = Omit<LoadSpriteOpt, "repack"> & {
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
    repack = true,
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
            const packer = _k.assets.packer;
            const map: Record<string, SpriteData> = {};
            const wholeImageWidth = img.width, wholeImageHeight = img.height;

            const mainFramesByFilter: Partial<Record<TexFilter, Frame>> = {};

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

                let spr: SpriteData;

                if (repack) {
                    spr = new SpriteData(
                        frames.map(q =>
                            packer.add(img, filter, mainQuad.scale(q))
                        ),
                        anims,
                        slice9,
                    );
                }
                else {
                    const ourFrame = (mainFramesByFilter[filter] ??= packer.add(
                        img,
                        filter,
                    ));
                    spr = new SpriteData(
                        frames.map(q =>
                            packer._saveFrame(
                                packer._getPacker(filter),
                                ourFrame.tex,
                                ourFrame.q.scale(mainQuad).scale(q),
                            )
                        ),
                        anims,
                        slice9,
                    );
                }
                _k.assets.sprites.addLoaded(name, spr);
                map[name] = spr;
            }
            return map;
        }),
    );
}

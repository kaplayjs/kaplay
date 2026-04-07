import type { DrawSpriteOpt } from "../gfx/draw/drawSprite";
import type { Frame } from "../gfx/TexPacker";
import { Quad, quad } from "../math/math";
import { _k } from "../shared";
import { type ImageSource, type TexFilter } from "../types";
import { Asset, loadImg, loadProgress, spriteSrcToImage } from "./asset";
import { fixURL, slice } from "./utils";

/**
 * Frame-based animation configuration.
 *
 * @group Assets
 * @subgroup Types
 */
export type SpriteAnim = number | {
    /**
     * The starting frame.
     */
    from?: number;
    /**
     * The end frame.
     */
    to?: number;
    /**
     * If this anim should be played in loop.
     */
    loop?: boolean;
    /**
     * When looping should it move back instead of go to start frame again.
     */
    pingpong?: boolean;
    /**
     * This anim's speed in frames per second.
     */
    speed?: number;
    /**
     * List of frames for the animation.
     *
     * If this property exists, **from, to, and pingpong will be ignored**.
     */
    frames?: number[];
};

/**
 * A dict of name <-> animation.
 *
 * @group Assets
 * @subgroup Types
 */
export type SpriteAnims = Record<string, SpriteAnim>;

// TODO: support frameWidth and frameHeight as alternative to slice
/**
 * Sprite loading options.
 *
 * @group Assets
 * @subgroup Types
 */
export interface LoadSpriteOpt {
    /**
     * If the single image area contains multiple sprites in a grid, how many frames are in the area horizontally.
     */
    sliceX?: number;
    /**
     * If the single image area contains multiple sprites arranged in a grid, how many frames are in the area vertically.
     */
    sliceY?: number;
    /**
     * 9 slice sprite for proportional scaling.
     *
     * @since v3000.0
     */
    slice9?: NineSlice;
    /**
     * Individual frames' bounding boxes, if the frames are not in a grid and so sliceX/sliceY won't do.
     * If present, overrides sliceX and sliceY. If the given sprite source is a list of images, each image is
     * its own frame, and this is not used.
     *
     * Format: x, y, w, and h are in **pixels**
     *
     * @since v3000.0
     */
    frames?: Quad[];
    /**
     * Animation configuration.
     */
    anims?: SpriteAnims;
    /**
     * If the sprite is a single image.
     */
    singular?: boolean;
    /**
     * The tex filter to use, if different than the global sprite filter
     */
    filter?: TexFilter;
    /**
     * If you've already packed your spritesheet, you can set this to false to tell KAPLAY not to repack it
     * when loading it into the main texture. However, this may negatively impact rendering performance if
     * it causes future sprites to not fit and be moved to a different GPU texture.
     *
     * This doesn't apply if you use singular: true, because the entire image will be its own texture then.
     *
     * @default true
     */
    repack?: boolean;
}

/**
 * @group Assets
 * @subgroup Types
 */
export type NineSlice = {
    /**
     * The width of the 9-slice's left column.
     */
    left: number;
    /**
     * The width of the 9-slice's right column.
     */
    right: number;
    /**
     * The height of the 9-slice's top row.
     */
    top: number;
    /**
     * The height of the 9-slice's bottom row.
     */
    bottom: number;
    /**
     * How regions should tile when the sprite is scaled.
     * - `"none"`: All regions stretch (default)
     * - `"edges"`: Edge regions (top, bottom, left, right) tile, center stretches
     * - `"center"`: Center region tiles, edges stretch
     * - `"all"`: Both edges and center tile
     *
     * Corners never tile.
     */
    tileMode?: "none" | "edges" | "center" | "all";
};

/**
 * Possible values for loading an sprite using {@link loadSprite `loadSprite`}.
 *
 * @group Assets
 * @subgroup Types
 */
export type LoadSpriteSrc = string | ImageSource;

export class SpriteData {
    constructor(
        public frames: Frame[],
        public anims: SpriteAnims = {},
        public slice9: NineSlice | null = null,
    ) {}

    /**
     * @since v3001.0
     */
    get width() {
        return this.frames[0].tex.width * this.frames[0].q.w;
    }

    get height() {
        return this.frames[0].tex.height * this.frames[0].q.h;
    }

    static fromSpriteSrc(
        src: LoadSpriteSrc,
        opt: LoadSpriteOpt = {},
    ): Promise<SpriteData> {
        return spriteSrcToImage(src).then(img =>
            SpriteData.fromSingle(img, opt)
        );
    }

    static fromMultiple(
        data: ImageSource[],
        opt: LoadSpriteOpt = {},
    ): SpriteData {
        const filter = opt.filter ?? _k.globalOpt.texFilter ?? "nearest";
        const frames = data.map(
            opt.singular
                ? (src => _k.assets.packer.addSingle(src, filter))
                : (src => _k.assets.packer.add(src, filter)),
        );
        return new SpriteData(frames, opt.anims, opt.slice9);
    }

    static fromSingle(data: ImageSource, opt: LoadSpriteOpt = {}): SpriteData {
        const frames: Quad[] = opt.frames
            ? fixFramesPixelsToFractionOfImage(
                opt.frames,
                data.width,
                data.height,
            )
            : slice(opt.sliceX || 1, opt.sliceY || 1);
        const filter = opt.filter ?? _k.globalOpt.texFilter ?? "nearest";
        if (opt.singular) {
            const { tex, q: quad, id } = _k.assets.packer.addSingle(
                data,
                filter,
            );
            return new SpriteData(
                frames.map(f => ({
                    tex,
                    q: quad.scale(f),
                    id,
                })),
                opt.anims,
                opt.slice9,
            );
        }
        const sd = new SpriteData(
            (opt.repack ?? true)
                ? frames.map(frame => _k.assets.packer.add(data, filter, frame))
                : _k.assets.packer.addPrepacked(data, filter, frames),
            opt.anims,
            opt.slice9,
        );
        return sd;
    }
}

export function resolveSprite(
    src: DrawSpriteOpt["sprite"],
): Asset<SpriteData> | null {
    if (typeof src === "string") {
        const spr = getSprite(src);
        if (spr) {
            // if it's already loaded or being loading, return it
            return spr;
        }
        else if (loadProgress() < 1) {
            // if there's any other ongoing loading task we return empty and don't error yet
            return null;
        }
        else {
            // if all other assets are loaded and we still haven't found this sprite, throw
            throw new Error(`Sprite not found: ${src}`);
        }
    }
    // else if (src instanceof SpriteData) {
    //     return Asset.loaded(src);
    // }
    else if (src instanceof Asset) {
        return src;
    }
    else {
        throw new Error(`Invalid sprite: ${src}`);
    }
}

export function getSprite(name: string): Asset<SpriteData> | null {
    return _k.assets.sprites.get(name) ?? null;
}

// load a sprite to asset manager
export function loadSprite(
    name: string | null,
    src: LoadSpriteSrc | LoadSpriteSrc[],
    opt: LoadSpriteOpt = {
        sliceX: 1,
        sliceY: 1,
        anims: {},
    },
): Asset<SpriteData> {
    src = fixURL(src);

    if (Array.isArray(src)) {
        if (src.some((s) => typeof s === "string")) {
            return _k.assets.sprites.add(
                name,
                Promise.all(
                    src.map((s) => {
                        return typeof s === "string"
                            ? loadImg(s)
                            : Promise.resolve(s);
                    }),
                ).then(images => SpriteData.fromMultiple(images, opt)),
            );
        }
        else {
            return _k.assets.sprites.addLoaded(
                name,
                SpriteData.fromMultiple(src as ImageSource[], opt),
            );
        }
    }
    else {
        if (typeof src === "string") {
            return _k.assets.sprites.add(
                name,
                SpriteData.fromSpriteSrc(src, opt),
            );
        }
        else {
            return _k.assets.sprites.addLoaded(
                name,
                SpriteData.fromSingle(src, opt),
            );
        }
    }
}

export function loadBean(name: string = "bean"): Asset<SpriteData> {
    if (!_k.game.defaultAssets.bean) {
        throw new Error("You can't use bean in kaplay/mini");
    }

    return loadSprite(name, _k.game.defaultAssets.bean);
}

export function fixFramesPixelsToFractionOfImage(
    frames: Quad[],
    width: number,
    height: number,
): Quad[] {
    // Given frames are dx, dy, width, and height in pixels, but internal
    // format is fraction of image size, so convert it
    return frames.map(q =>
        quad(
            q.x / width,
            q.y / height,
            q.w / width,
            q.h / height,
        )
    );
}

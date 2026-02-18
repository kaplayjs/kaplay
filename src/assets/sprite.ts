import type { DrawSpriteOpt } from "../gfx/draw/drawSprite";
import type { Frame } from "../gfx/TexPacker";
import { Quad } from "../math/math";
import { _k } from "../shared";
import { type ImageSource } from "../types";
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
     * If the defined area contains multiple sprites, how many frames are in the area horizontally.
     */
    sliceX?: number;
    /**
     * If the defined area contains multiple sprites, how many frames are in the area vertically.
     */
    sliceY?: number;
    /**
     * 9 slice sprite for proportional scaling.
     *
     * @since v3000.0
     */
    slice9?: NineSlice;
    /**
     * Individual frames.
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
        const frames = data.map(
            opt.singular
                ? (src => _k.assets.packer.addSingle(src))
                : (src => _k.assets.packer.add(src)),
        );
        return new SpriteData(frames, opt.anims, opt.slice9);
    }

    static fromSingle(data: ImageSource, opt: LoadSpriteOpt = {}): SpriteData {
        const frames: Quad[] = opt.frames
            ? opt.frames
            : slice(opt.sliceX || 1, opt.sliceY || 1);
        if (opt.singular) {
            const { tex, q: quad, id } = _k.assets.packer.addSingle(data);
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
        return new SpriteData(
            frames.map(frame => _k.assets.packer.add(data, frame)),
            opt.anims,
            opt.slice9,
        );
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

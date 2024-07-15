import { Asset, loadImg, loadProgress } from "../assets";
import type { DrawSpriteOpt } from "../gfx";
import type { Texture } from "../gfx/gfx";
import { assets } from "../kaplay";
import beanSpriteSrc from "../kassets/bean.png";
import { Quad } from "../math/math";
import { type ImageSource } from "../types";
import { fixURL } from "./utils";

/**
 * Frame-based animation configuration.
 */
export type SpriteAnim = number | {
    /**
     * The starting frame.
     */
    from: number;
    /**
     * The end frame.
     */
    to: number;
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
};

/**
 * A dict of name <-> animation.
 */
export type SpriteAnims = Record<string, SpriteAnim>;

// TODO: support frameWidth and frameHeight as alternative to slice
/**
 * Sprite loading configuration.
 */
export interface LoadSpriteOpt {
    /**
     * If the defined area contains multiple sprites, how many frames are in the area hozizontally.
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
}

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
};

export type LoadSpriteSrc = string | ImageSource;

export class SpriteData {
    tex: Texture;
    frames: Quad[] = [new Quad(0, 0, 1, 1)];
    anims: SpriteAnims = {};
    slice9: NineSlice | null = null;

    constructor(
        tex: Texture,
        frames?: Quad[],
        anims: SpriteAnims = {},
        slice9: NineSlice | null = null,
    ) {
        this.tex = tex;
        if (frames) this.frames = frames;
        this.anims = anims;
        this.slice9 = slice9;
    }

    /**
     * @since v3001.0
     */
    get width() {
        return this.tex.width * this.frames[0].w;
    }

    get height() {
        return this.tex.height * this.frames[0].h;
    }

    static from(
        src: LoadSpriteSrc,
        opt: LoadSpriteOpt = {},
    ): Promise<SpriteData> {
        return typeof src === "string"
            ? SpriteData.fromURL(src, opt)
            : Promise.resolve(SpriteData.fromImage(src, opt));
    }

    static fromImage(
        data: ImageSource,
        opt: LoadSpriteOpt = {},
    ): SpriteData {
        const [tex, quad] = assets.packer.add(data);
        const frames = opt.frames
            ? opt.frames.map((f) =>
                new Quad(
                    quad.x + f.x * quad.w,
                    quad.y + f.y * quad.h,
                    f.w * quad.w,
                    f.h * quad.h,
                )
            )
            : slice(
                opt.sliceX || 1,
                opt.sliceY || 1,
                quad.x,
                quad.y,
                quad.w,
                quad.h,
            );
        return new SpriteData(tex, frames, opt.anims, opt.slice9);
    }

    static fromURL(
        url: string,
        opt: LoadSpriteOpt = {},
    ): Promise<SpriteData> {
        return loadImg(url).then((img) => SpriteData.fromImage(img, opt));
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
        } else if (loadProgress() < 1) {
            // if there's any other ongoing loading task we return empty and don't error yet
            return null;
        } else {
            // if all other assets are loaded and we still haven't found this sprite, throw
            throw new Error(`Sprite not found: ${src}`);
        }
    } else if (src instanceof SpriteData) {
        return Asset.loaded(src);
    } else if (src instanceof Asset) {
        return src;
    } else {
        throw new Error(`Invalid sprite: ${src}`);
    }
}

export function getSprite(name: string): Asset<SpriteData> | null {
    return assets.sprites.get(name) ?? null;
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
            return assets.sprites.add(
                name,
                Promise.all(src.map((s) => {
                    return typeof s === "string"
                        ? loadImg(s)
                        : Promise.resolve(s);
                })).then((images) => createSpriteSheet(images, opt)),
            );
        } else {
            return assets.sprites.addLoaded(
                name,
                createSpriteSheet(src as ImageSource[], opt),
            );
        }
    } else {
        if (typeof src === "string") {
            return assets.sprites.add(name, SpriteData.from(src, opt));
        } else {
            return assets.sprites.addLoaded(
                name,
                SpriteData.fromImage(src, opt),
            );
        }
    }
}

export function slice(x = 1, y = 1, dx = 0, dy = 0, w = 1, h = 1): Quad[] {
    const frames: Quad[] = [];
    const qw = w / x;
    const qh = h / y;
    for (let j = 0; j < y; j++) {
        for (let i = 0; i < x; i++) {
            frames.push(
                new Quad(
                    dx + i * qw,
                    dy + j * qh,
                    qw,
                    qh,
                ),
            );
        }
    }
    return frames;
}

// TODO: load synchronously if passed ImageSource

export function createSpriteSheet(
    images: ImageSource[],
    opt: LoadSpriteOpt = {},
): SpriteData {
    const canvas = document.createElement("canvas");
    const width = images[0].width;
    const height = images[0].height;
    canvas.width = width * images.length;
    canvas.height = height;
    const c2d = canvas.getContext("2d");
    if (!c2d) throw new Error("Failed to create canvas context");
    images.forEach((img, i) => {
        if (img instanceof ImageData) {
            c2d.putImageData(img, i * width, 0);
        } else {
            c2d.drawImage(img, i * width, 0);
        }
    });
    const merged = c2d.getImageData(0, 0, images.length * width, height);
    return SpriteData.fromImage(merged, {
        ...opt,
        sliceX: images.length,
        sliceY: 1,
    });
}

export function loadBean(name: string = "bean"): Asset<SpriteData> {
    return loadSprite(name, beanSpriteSrc);
}

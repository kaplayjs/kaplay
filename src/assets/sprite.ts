import { Asset, loadImg, loadProgress } from "../assets";
import type { Texture } from "../gfx/gfx";
import { assets } from "../kaboom";
import { Quad } from "../math/math";
import {
    type DrawSpriteOpt,
    type ImageSource,
    type LoadSpriteOpt,
    type LoadSpriteSrc,
    type NineSlice,
    type SpriteAnims,
} from "../types";

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

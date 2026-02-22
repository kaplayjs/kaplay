import { SPRITE_ATLAS_HEIGHT, SPRITE_ATLAS_WIDTH } from "../constants/general";
import type { SerializedGameObj } from "../ecs/entity/prefab";
import { KEvent, KEventHandler } from "../events/events";
import type { GfxCtx } from "../gfx/gfx";
import type { AppGfxCtx } from "../gfx/gfxApp";
import { TexPacker } from "../gfx/TexPacker";
import { _k } from "../shared";
import type { ImageSource, MustKAPLAYOpt } from "../types";
import type { BitmapFontData } from "./bitmapFont";
import type { FontData } from "./font";
import type { ShaderData } from "./shader";
import type { SoundData } from "./sound";
import type { LoadSpriteSrc, SpriteData } from "./sprite";
import { fixURL } from "./utils";

/**
 * An asset is a resource that is loaded asynchronously.
 *
 * It can be a sprite, a sound, a font, a shader, etc.
 */
export class Asset<D> {
    loaded: boolean = false;
    data: D | null = null;
    error: Error | null = null;
    private onLoadEvents: KEvent<[D]> = new KEvent();
    private onErrorEvents: KEvent<[Error]> = new KEvent();
    private onFinishEvents: KEvent<[]> = new KEvent();

    constructor(loader: Promise<D>) {
        loader.then((data) => {
            this.loaded = true;
            this.data = data;
            this.onLoadEvents.trigger(data);
        }).catch((err) => {
            this.error = err;

            if (this.onErrorEvents.numListeners() > 0) {
                this.onErrorEvents.trigger(err);
            }
            else {
                throw err;
            }
        }).finally(() => {
            this.onFinishEvents.trigger();
            this.loaded = true;
        });
    }
    static loaded<D>(data: D): Asset<D> {
        const asset = new Asset(Promise.resolve(data)) as Asset<D>;
        asset.data = data;
        asset.loaded = true;
        return asset;
    }
    onLoad(action: (data: D) => void) {
        if (this.loaded && this.data) {
            action(this.data);
        }
        else {
            this.onLoadEvents.add(action);
        }
        return this;
    }
    onError(action: (err: Error) => void) {
        if (this.loaded && this.error) {
            action(this.error);
        }
        else {
            this.onErrorEvents.add(action);
        }
        return this;
    }
    onFinish(action: () => void) {
        if (this.loaded) {
            action();
        }
        else {
            this.onFinishEvents.add(action);
        }
        return this;
    }
    then(action: (data: D) => void): Asset<D> {
        return this.onLoad(action);
    }
    catch(action: (err: Error) => void): Asset<D> {
        return this.onError(action);
    }
    finally(action: () => void): Asset<D> {
        return this.onFinish(action);
    }
}

/**
 * @group Assets
 * @subgroup Types
 */
export class AssetBucket<D> {
    assets: Map<string, Asset<D>> = new Map();
    waiters: KEventHandler<any> = new KEventHandler();
    errorWaiters: KEventHandler<any> = new KEventHandler();
    lastUID: number = 0;

    add(name: string | null, loader: Promise<D>): Asset<D> {
        // if user don't provide a name we use a generated one
        const id = name ?? (this.lastUID++ + "");
        const asset = new Asset(loader);
        this.assets.set(id, asset);
        asset.onLoad(d => {
            this.waiters.trigger(id, d);
        });
        asset.onError(d => {
            this.errorWaiters.trigger(id, d);
        });

        return asset;
    }
    addLoaded(name: string | null, data: D): Asset<D> {
        const id = name ?? (this.lastUID++ + "");
        const asset = Asset.loaded(data);
        this.assets.set(id, asset);
        this.waiters.trigger(id, data);
        this.errorWaiters.remove(id);

        return asset;
    }
    // if not found return undefined
    get(handle: string): Asset<D> | undefined {
        return this.assets.get(handle);
    }
    progress(): number {
        if (this.assets.size === 0) {
            return 1;
        }
        let loaded = 0;

        this.assets.forEach((asset) => {
            if (asset.loaded) {
                loaded++;
            }
        });

        return loaded / this.assets.size;
    }

    getFailedAssets(): [string, Asset<D>][] {
        return Array.from(this.assets.keys()).filter(a =>
            this.assets.get(a)!.error !== null
        ).map(a => [a, this.assets.get(a)!]);
    }

    waitFor(name: string, timeout: number): PromiseLike<D> {
        const asset = this.get(name);
        if (asset) {
            if (asset.loaded) return Promise.resolve(asset.data!);
            else {
                return Promise.race([
                    new Promise<D>((res, rej) => {
                        asset.onLoad(res);
                        asset.onError(rej);
                    }),
                    new Promise<never>((_, rej) =>
                        setTimeout(
                            () => rej("timed out waiting for asset " + name),
                            timeout,
                        )
                    ),
                ]);
            }
        }
        const x = Promise.withResolvers<D>();
        this.waiters.onOnce(name, x.resolve);
        this.errorWaiters.onOnce(name, x.reject);
        setTimeout(
            () => x.reject("timed out waiting for asset " + name),
            timeout,
        );
        return x.promise;
    }
}

export function fetchURL(url: string) {
    return fetch(url).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch "${url}"`);
        return res;
    });
}

export function fetchJSON(path: string) {
    return fetchURL(path).then((res) => res.json());
}

export function fetchText(path: string) {
    return fetchURL(path).then((res) => res.text());
}

export function fetchArrayBuffer(path: string) {
    return fetchURL(path).then((res) => res.arrayBuffer());
}

// global load path prefix
export function loadRoot(path?: string): string {
    if (path !== undefined) {
        _k.assets.urlPrefix = path;
    }
    return _k.assets.urlPrefix;
}

export function loadJSON(name: string, url: string) {
    return _k.assets.custom.add(name, fetchJSON(fixURL(url)));
}

// wrapper around image loader to get a Promise
export function loadImg(src: string): Promise<HTMLImageElement> {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    return new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () =>
            reject(new Error(`Failed to load image from "${src}"`));
    });
}

export function spriteSrcToImage(src: LoadSpriteSrc): Promise<ImageSource> {
    return typeof src === "string" ? loadImg(src) : Promise.resolve(src);
}

export function loadProgress(): number {
    const buckets = [
        _k.assets.sprites,
        _k.assets.sounds,
        _k.assets.shaders,
        _k.assets.fonts,
        _k.assets.bitmapFonts,
        _k.assets.custom,
    ];
    return buckets.reduce((n, bucket) => n + bucket.progress(), 0)
        / buckets.length;
}

export function getFailedAssets(): [string, Asset<any>][] {
    const buckets = [
        _k.assets.sprites,
        _k.assets.sounds,
        _k.assets.shaders,
        _k.assets.fonts,
        _k.assets.bitmapFonts,
        _k.assets.custom,
    ];
    return buckets.reduce(
        (fails, bucket) => fails.concat(bucket.getFailedAssets()),
        [] as [string, Asset<any>][],
    );
}
export function getAsset(name: string): Asset<any> | null {
    return _k.assets.custom.get(name) ?? null;
}

// wrap individual loaders with global loader counter, for stuff like progress bar
export function load<T>(prom: Promise<T>): Asset<T> {
    return _k.assets.custom.add(null, prom);
}

// create assets
/** @ignore */
export type InternalAssetsCtx = ReturnType<typeof initAssets>;

/** @ignore */
export const initAssets = (
    ggl: GfxCtx,
    opt: MustKAPLAYOpt,
    appGfx: AppGfxCtx,
) => {
    const assets = {
        urlPrefix: "",
        // asset holders
        sprites: new AssetBucket<SpriteData>(),
        fonts: new AssetBucket<FontData>(),
        bitmapFonts: new AssetBucket<BitmapFontData>(),
        sounds: new AssetBucket<SoundData>(),
        shaders: new AssetBucket<ShaderData>(),
        custom: new AssetBucket<any>(),
        prefabAssets: new AssetBucket<SerializedGameObj>(),
        music: {} as Record<string, string>,
        packer: new TexPacker(
            ggl,
            SPRITE_ATLAS_WIDTH,
            SPRITE_ATLAS_HEIGHT,
            opt.spriteAtlasPadding,
        ),
        // if we finished initially loading all assets
        loaded: false,
    };

    // Set up the white pixel to start everything
    appGfx.whitePixel = assets.packer._createWhitePixel();

    return assets;
};

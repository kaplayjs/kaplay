// Code related to assets buckets management

import { throwError } from "../core/errors";
import { _k } from "../shared";
import { type Asset, AssetBucket } from "./asset";

export const getAssetBucket = (bucket: string) => {
    return _k.assets.buckets[bucket];
};

export const addAssetBucket = <T>(name: string): AssetBucket<T> => {
    const bucket = new AssetBucket<T>();
    _k.assets.buckets[name] = bucket;

    return bucket;
};

// Get / Set assets

export function getAsset(
    name: string,
    bucket: string = "custom",
): Asset<any> | null {
    return _k.assets.buckets[bucket].get(name) ?? null;
}

export function loadAsset<T>(
    name: string | null = null,
    bucket: string | Promise<T> = "custom",
    loader?: Promise<T>,
): Asset<T> {
    if (loader) {
        if (typeof bucket != "string") {
            throw throwError(
                "In loadAsset(name, bucket, loader), bucket must be type string.",
            );
        }

        return _k.assets.buckets[bucket].add(name, loader);
    }

    return _k.assets.buckets["custom"].add(name, bucket as Promise<T>);
}

export function load<T>(
    loader: Promise<T>,
): Asset<T> {
    return _k.assets.buckets["custom"].add(null, loader);
}

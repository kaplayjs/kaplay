import { assets, audio } from "../kaplay";
import { dataURLToArrayBuffer, isDataURL } from "../utils";
import { Asset, fetchArrayBuffer, loadProgress } from "./asset";
import { fixURL } from "./utils";

export class SoundData {
    buf: AudioBuffer;

    constructor(buf: AudioBuffer) {
        this.buf = buf;
    }

    static fromArrayBuffer(buf: ArrayBuffer): Promise<SoundData> {
        return new Promise((resolve, reject) =>
            audio.ctx.decodeAudioData(buf, resolve, reject)
        ).then((buf) => new SoundData(buf as AudioBuffer));
    }

    static fromURL(url: string): Promise<SoundData> {
        if (isDataURL(url)) {
            return SoundData.fromArrayBuffer(dataURLToArrayBuffer(url));
        }
        else {
            return fetchArrayBuffer(url).then((buf) =>
                SoundData.fromArrayBuffer(buf)
            );
        }
    }
}

export function resolveSound(
    src: string | SoundData | Asset<SoundData>,
): Asset<SoundData> | null {
    if (typeof src === "string") {
        const snd = getSound(src);
        if (snd) {
            return snd;
        }
        else if (loadProgress() < 1) {
            return null;
        }
        else {
            throw new Error(`Sound not found: ${src}`);
        }
    }
    else if (src instanceof SoundData) {
        return Asset.loaded(src);
    }
    else if (src instanceof Asset) {
        return src;
    }
    else {
        throw new Error(`Invalid sound: ${src}`);
    }
}

export function getSound(name: string): Asset<SoundData> | null {
    return assets.sounds.get(name) ?? null;
}

// load a sound to asset manager
export function loadSound(
    name: string | null,
    src: string | ArrayBuffer,
): Asset<SoundData> {
    src = fixURL(src);
    return assets.sounds.add(
        name,
        typeof src === "string"
            ? SoundData.fromURL(src)
            : SoundData.fromArrayBuffer(src),
    );
}

export function loadMusic(
    name: string | null,
    url: string,
) {
    const musicUrl = fixURL(url);
    const a = new Audio(musicUrl);
    a.preload = "auto";

    return assets.music[name as keyof typeof assets.music] = musicUrl;
}

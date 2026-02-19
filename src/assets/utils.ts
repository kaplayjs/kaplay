import { Quad } from "../math/math";
import { _k } from "../shared";
import type { ImageSource } from "../types";
import { isDataURL } from "../utils/dataURL";

export function fixURL<D>(url: D): D {
    if (typeof url == "string" && window.kaplayjs_assetsAliases[url]) {
        url = (window.kaplayjs_assetsAliases[url] as unknown) as D;
    }

    if (typeof url !== "string" || isDataURL(url)) return url;
    return _k.assets.urlPrefix + url as D;
}

export function drawImageSourceAt(
    c2d: CanvasRenderingContext2D,
    src: ImageSource,
    atX: number,
    atY: number,
    cutX: number,
    cutY: number,
    cutWidth: number,
    cutHeight: number,
) {
    if (src instanceof ImageData) {
        c2d.putImageData(src, atX, atY, cutX, cutY, cutWidth, cutHeight);
    }
    else {
        c2d.drawImage(
            src,
            cutX,
            cutY,
            cutWidth,
            cutHeight,
            atX,
            atY,
            cutWidth,
            cutHeight,
        );
    }
}

export function slice(x = 1, y = 1, dx = 0, dy = 0, w = 1, h = 1): Quad[] {
    const frames: Quad[] = [];
    const qw = w / x;
    const qh = h / y;
    for (let j = 0; j < y; j++) {
        for (let i = 0; i < x; i++) {
            frames.push(new Quad(dx + i * qw, dy + j * qh, qw, qh));
        }
    }
    return frames;
}

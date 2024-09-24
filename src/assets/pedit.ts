import { assets } from "../kaplay";
import { type Asset, fetchJSON, loadImage } from "./asset";
import { loadSprite, type SpriteAnims, type SpriteData } from "./sprite";
import { fixURL } from "./utils";

export interface PeditFile {
    width: number;
    height: number;
    frames: string[];
    anims: SpriteAnims;
}

export function loadPedit(
    name: string | null,
    src: string | PeditFile,
): Asset<SpriteData> {
    src = fixURL(src);

    return assets.sprites.add(
        name,
        new Promise(async (resolve) => {
            const data = typeof src === "string"
                ? await fetchJSON(src)
                : src;
            const images = await Promise.all(data.frames.map(loadImage));
            const canvas = document.createElement("canvas");
            canvas.width = data.width;
            canvas.height = data.height * data.frames.length;

            const c2d = canvas.getContext("2d");
            if (!c2d) throw new Error("Failed to create canvas context");

            images.forEach((img: HTMLImageElement, i) => {
                c2d.drawImage(img, 0, i * data.height);
            });

            const spr = await loadSprite(null, canvas, {
                sliceY: data.frames.length,
                anims: data.anims,
            });

            resolve(spr);
        }),
    );
}

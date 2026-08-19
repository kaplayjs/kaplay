import { Quad } from "../math/math";
import { _k } from "../shared";
import { getFileName } from "../utils/dataURL";
import { type Asset, fetchJSON } from "./asset";
import { type LoadSpriteSrc, type SpriteAnim, SpriteData } from "./sprite";
import { fixURL } from "./utils";

/**
 * @group Assets
 * @subgroup Data
 */
export type AsepriteData = {
    frames: Array<{
        frame: {
            x: number;
            y: number;
            w: number;
            h: number;
        };
    }>;
    meta: {
        frameTags: Array<{
            name: string;
            from: number;
            to: number;
            direction: "forward" | "reverse" | "pingpong";
        }>;
    };
};

export function loadAseprite(
    name: string | null,
    imgSrc: LoadSpriteSrc,
    jsonSrc: string | AsepriteData,
): Asset<SpriteData> {
    imgSrc = fixURL(imgSrc);
    jsonSrc = fixURL(jsonSrc);

    if (typeof imgSrc === "string" && !jsonSrc) {
        jsonSrc = getFileName(imgSrc) + ".json";
    }

    const resolveJSON = typeof jsonSrc === "string"
        ? fetchJSON(jsonSrc)
        : Promise.resolve(jsonSrc);

    return _k.assets.sprites.add(
        name,
        resolveJSON.then(({ meta: { frameTags }, frames }: AsepriteData) => {
            const anims: Record<string, SpriteAnim> = {};

            for (const { name, from, to, direction } of frameTags) {
                if (from === to) {
                    anims[name] = from;
                }
                else {
                    anims[name] = {
                        from,
                        to,
                        speed: 10,
                        loop: true,
                        pingpong: direction === "pingpong",
                    };
                }
            }
            return SpriteData.fromSpriteSrc(imgSrc, {
                frames: frames.map(({ frame: { x, y, w, h } }) =>
                    new Quad(x, y, w, h)
                ),
                anims: anims,
                repack: false,
            });
        }),
    );
}

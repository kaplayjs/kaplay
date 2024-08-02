import { assets } from "../kaplay";
import { Quad } from "../math";
import { getFileName } from "../utils";
import { type Asset, fetchJSON } from "./asset";
import { type LoadSpriteSrc, type SpriteAnim, SpriteData } from "./sprite";
import { fixURL } from "./utils";

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
        size: { w: number; h: number };
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

    return assets.sprites.add(
        name,
        resolveJSON.then((data: AsepriteData) => {
            const size = data.meta.size;
            const frames = data.frames.map((f: any) => {
                return new Quad(
                    f.frame.x / size.w,
                    f.frame.y / size.h,
                    f.frame.w / size.w,
                    f.frame.h / size.h,
                );
            });
            const anims: Record<string, number | SpriteAnim> = {};

            for (const anim of data.meta.frameTags) {
                if (anim.from === anim.to) {
                    anims[anim.name] = anim.from;
                }
                else {
                    anims[anim.name] = {
                        from: anim.from,
                        to: anim.to,
                        speed: 10,
                        loop: true,
                        pingpong: anim.direction === "pingpong",
                    };
                }
            }
            return SpriteData.from(imgSrc, {
                frames: frames,
                anims: anims,
            });
        }),
    );
}

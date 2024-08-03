import { Texture } from "../gfx/gfx";
import { assets, gfx } from "../kaplay";
import type { Asset } from "./asset";

export type LoadVideoOpt = {
    loop?: boolean;
    muted?: boolean;
}

export class VideoData {
    videoElement: HTMLVideoElement;
    tex: Texture;

    constructor(videoElement: HTMLVideoElement) {
        this.videoElement = videoElement;
        this.tex = Texture.fromImage(
            gfx.ggl, videoElement,
            { filter: "linear", wrap: "clampToEdge" },
        );
    }

    static from(
        src: string,
        opt: LoadVideoOpt = {}
    ): Promise<VideoData> {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");

            let playing = false;
            let timeupdate = false;

            video.playsInline = true;
            video.muted = opt.muted || true;
            video.loop = opt.loop || true;

            video.addEventListener(
                "playing",
                () => {
                    playing = true;
                    checkReady();
                },
                true,
            );

            video.addEventListener(
                "timeupdate",
                () => {
                    timeupdate = true;
                    checkReady();
                },
                true,
            );

            video.src = src;
            video.play();

            function checkReady() {
                if (playing && timeupdate) {
                    resolve(new VideoData(video));
                }
            }
        });
    }
}

function loadVideo(name: string, src: string, opt: LoadVideoOpt): Asset<VideoData> {
    return assets.videos.add(name, VideoData.from(src, opt));
}
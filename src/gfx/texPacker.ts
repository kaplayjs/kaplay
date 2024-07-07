import type { ImageSource } from "../types";

import { type GfxCtx, Texture } from "../gfx";

import { Quad, Vec2 } from "../math";

export default class TexPacker {
    private textures: Texture[] = [];
    private bigTextures: Texture[] = [];
    private canvas: HTMLCanvasElement;
    private c2d: CanvasRenderingContext2D;
    private x: number = 0;
    private y: number = 0;
    private curHeight: number = 0;
    private gfx: GfxCtx;
    constructor(gfx: GfxCtx, w: number, h: number) {
        this.gfx = gfx;
        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;
        this.textures = [Texture.fromImage(gfx, this.canvas)];
        this.bigTextures = [];
        
        this.c2d = this.canvas.getContext("2d");
        if (!this.c2d) throw new Error("Failed to get 2d context");
    }
    add(img: ImageSource): [Texture, Quad] {
        if (img.width > this.canvas.width || img.height > this.canvas.height) {
            const tex = Texture.fromImage(this.gfx, img);
            this.bigTextures.push(tex);
            return [tex, new Quad(0, 0, 1, 1)];
        }
        // next row
        if (this.x + img.width > this.canvas.width) {
            this.x = 0;
            this.y += this.curHeight;
            this.curHeight = 0;
        }
        // next texture
        if (this.y + img.height > this.canvas.height) {
            this.c2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.textures.push(Texture.fromImage(this.gfx, this.canvas));
            this.x = 0;
            this.y = 0;
            this.curHeight = 0;
        }
        const curTex = this.textures[this.textures.length - 1];
        const pos = new Vec2(this.x, this.y);
        this.x += img.width;
        if (img.height > this.curHeight) {
            this.curHeight = img.height;
        }
        if (img instanceof ImageData) {
            this.c2d.putImageData(img, pos.x, pos.y);
        } else {
            this.c2d.drawImage(img, pos.x, pos.y);
        }
        curTex.update(this.canvas);
        return [
            curTex,
            new Quad(
                pos.x / this.canvas.width,
                pos.y / this.canvas.height,
                img.width / this.canvas.width,
                img.height / this.canvas.height,
            ),
        ];
    }
    free() {
        for (const tex of this.textures) {
            tex.free();
        }
        for (const tex of this.bigTextures) {
            tex.free();
        }
    }
}

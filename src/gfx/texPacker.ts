import { type GfxCtx, Texture } from "../gfx";
import { Quad, Vec2 } from "../math/math";
import type { ImageSource } from "../types";

export class TexPacker {
    private lastTextureId: number = 0;
    private textures: Texture[] = [];
    private bigTextures: Texture[] = [];
    private texturesPosition: Map<number, {
        position: Vec2;
        size: Vec2;
        texture: Texture;
    }> = new Map();
    private canvas: HTMLCanvasElement;
    private c2d: CanvasRenderingContext2D;
    private x: number = 0;
    private y: number = 0;
    private curHeight: number = 0;
    private gfx: GfxCtx;
    private padding: number;

    constructor(gfx: GfxCtx, w: number, h: number, padding: number) {
        this.gfx = gfx;
        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;
        this.textures = [Texture.fromImage(gfx, this.canvas)];
        this.bigTextures = [];
        this.padding = padding;

        const context2D = this.canvas.getContext("2d");
        if (!context2D) throw new Error("Failed to get 2d context");

        this.c2d = context2D;
    }

    // create a image with a single texture
    addSingle(img: ImageSource): [Texture, Quad, number] {
        const tex = Texture.fromImage(this.gfx, img);
        this.bigTextures.push(tex);
        return [tex, new Quad(0, 0, 1, 1), 0];
    }

    add(img: ImageSource): [Texture, Quad, number] {
        const paddedWidth = img.width + this.padding * 2;
        const paddedHeight = img.height + this.padding * 2;

        if (
            paddedWidth > this.canvas.width || paddedHeight > this.canvas.height
        ) {
            return this.addSingle(img);
        }

        // next row
        if (this.x + paddedWidth > this.canvas.width) {
            this.x = 0;
            this.y += this.curHeight;
            this.curHeight = 0;
        }

        // next texture
        if (this.y + paddedHeight > this.canvas.height) {
            this.c2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.textures.push(Texture.fromImage(this.gfx, this.canvas));
            this.x = 0;
            this.y = 0;
            this.curHeight = 0;
        }

        const curTex = this.textures[this.textures.length - 1];
        const pos = new Vec2(this.x + this.padding, this.y + this.padding);

        this.x += paddedWidth;

        if (paddedHeight > this.curHeight) {
            this.curHeight = paddedHeight;
        }

        if (img instanceof ImageData) {
            this.c2d.putImageData(img, pos.x, pos.y);
        }
        else {
            this.c2d.drawImage(img, pos.x, pos.y);
        }

        curTex.update(this.canvas);

        this.texturesPosition.set(this.lastTextureId, {
            position: pos,
            size: new Vec2(img.width, img.height),
            texture: curTex,
        });

        this.lastTextureId++;

        return [
            curTex,
            new Quad(
                pos.x / this.canvas.width,
                pos.y / this.canvas.height,
                img.width / this.canvas.width,
                img.height / this.canvas.height,
            ),
            this.lastTextureId - 1,
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

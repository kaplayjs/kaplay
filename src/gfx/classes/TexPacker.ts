import { Quad, Vec2 } from "../../math/math";
import type { ImageSource } from "../../types";
import { type GfxCtx, Texture } from "..";

export default class TexPacker {
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

    constructor(gfx: GfxCtx, w: number, h: number) {
        this.gfx = gfx;
        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;
        this.textures = [Texture.fromImage(gfx, this.canvas)];
        this.bigTextures = [];

        const context2D = this.canvas.getContext("2d");
        if (!context2D) throw new Error("Failed to get 2d context");

        this.c2d = context2D;
    }

    add(img: ImageSource): [Texture, Quad, number] {
        if (img.width > this.canvas.width || img.height > this.canvas.height) {
            const tex = Texture.fromImage(this.gfx, img);
            this.bigTextures.push(tex);
            return [tex, new Quad(0, 0, 1, 1), 0];
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
        const differenceWidth = this.canvas.width - this.x;
        const differenceHeight = this.canvas.height - this.y;

        this.x += img.width;

        if (img.height > this.curHeight) {
            this.curHeight = img.height;
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
    remove(packerId: number) {
        const tex = this.texturesPosition.get(packerId);

        if (!tex) {
            throw new Error("Texture with packer id not found");
        }

        this.c2d.clearRect(
            tex.position.x,
            tex.position.y,
            tex.size.x,
            tex.size.y,
        );

        tex.texture.update(this.canvas);
        this.texturesPosition.delete(packerId);
        this.x -= tex.size.x;
    }
}

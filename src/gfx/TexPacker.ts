import { Quad } from "../math/math";
import { Vec2 } from "../math/Vec2";
import type { ImageSource } from "../types";
import { type GfxCtx, Texture } from "./gfx";

/**
 * TexPacker packs all assets in a texture atlas.
 */
export class TexPacker {
    private lastTextureId: number = 0;
    private textures: Texture[] = [];
    private bigTextures: Texture[] = [];
    private canvas: HTMLCanvasElement;
    private c2d: CanvasRenderingContext2D;
    private gfx: GfxCtx;
    private padding: number;
    private roots: AtlasNode[] = [];

    constructor(gfx: GfxCtx, w: number, h: number, padding: number) {
        this.gfx = gfx;
        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;
        this.textures = [Texture.fromImage(gfx, this.canvas)];
        this.bigTextures = [];
        this.roots.push(new AtlasNode(0, 0, w, h));
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

        let node: AtlasNode | null = null;
        let rootIndex = 0;

        for (; rootIndex < this.roots.length; rootIndex++) {
            node = this.roots[rootIndex].find(paddedWidth, paddedHeight);
            if (node) break;
        }

        if (!node) {
            this.c2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.textures.push(Texture.fromImage(this.gfx, this.canvas));
            this.roots.push(
                new AtlasNode(0, 0, this.canvas.width, this.canvas.height),
            );
            node = this.roots[this.roots.length - 1].find(
                paddedWidth,
                paddedHeight,
            );
            rootIndex = this.roots.length - 1;
            if (!node) throw new Error("Image too large even after new root");
        }

        node.split(paddedWidth, paddedHeight);

        const pos = new Vec2(node.x + this.padding, node.y + this.padding);
        const curTex = this.textures[rootIndex];

        if (img instanceof ImageData) {
            this.c2d.putImageData(img, pos.x, pos.y);
        }
        else {
            this.c2d.drawImage(img, pos.x, pos.y);
        }

        curTex.update(this.canvas);

        node.id = this.lastTextureId;
        node.image = img;
        node.texture = curTex;

        return [
            curTex,
            new Quad(
                pos.x / this.canvas.width,
                pos.y / this.canvas.height,
                img.width / this.canvas.width,
                img.height / this.canvas.height,
            ),
            this.lastTextureId++,
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

    findNodeById(id: number, node = this.roots[0]): AtlasNode | null {
        if (!node) return null;
        if (node.used && node.id === id) return node;
        return this.findNodeById(id, node.right)
            ?? this.findNodeById(id, node.down);
    }

    remove(packerId: number) {
        // const tex = this.texturesPosition.get(packerId);

        // if (!tex) {
        //     throw new Error("Texture with packer id not found");
        // }

        // this.c2d.clearRect(
        //     tex.position.x,
        //     tex.position.y,
        //     tex.size.x,
        //     tex.size.y,
        // );

        // tex.texture.update(this.canvas);
        // this.texturesPosition.delete(packerId);
    }
}

/**
 * A node inside the atlas tree.
 */
class AtlasNode {
    x: number;
    y: number;
    w: number;
    h: number;
    used = false;
    down?: AtlasNode;
    right?: AtlasNode;

    // For allocated textures:
    id?: number;
    image?: ImageSource;
    texture?: Texture;

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    free() {
        this.used = false;
        this.id = undefined;
        this.image = undefined;
        this.texture = undefined;
    }

    find(w: number, h: number): AtlasNode | null {
        if (this.used) {
            return this.right?.find(w, h) || this.down?.find(w, h) || null;
        }
        else if (w <= this.w && h <= this.h) {
            return this;
        }
        else {
            return null;
        }
    }

    split(w: number, h: number) {
        this.used = true;
        this.down = new AtlasNode(this.x, this.y + h, this.w, this.h - h);
        this.right = new AtlasNode(this.x + w, this.y, this.w - w, h);
    }
}

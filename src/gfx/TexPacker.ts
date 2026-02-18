import { Quad, Rect } from "../math/math";
import { Vec2 } from "../math/Vec2";
import type { ImageSource } from "../types";
import { type GfxCtx, Texture } from "./gfx";

export class TexPacker {
    private _last: number = 0;
    private _textures: Texture[] = [];
    private _big: Texture[] = [];
    private _used: Map<number, {
        rect: Rect;
        tex: Texture;
    }> = new Map();
    private _el: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;

    constructor(
        private _gfx: GfxCtx,
        w: number,
        h: number,
        private _pad: number,
    ) {
        this._el = document.createElement("canvas");
        this._el.width = w;
        this._el.height = h;
        this._textures = [Texture.fromImage(_gfx, this._el)];
        this._big = [];

        const context2D = this._el.getContext("2d");
        if (!context2D) throw new Error("Failed to get 2d context");

        this._ctx = context2D;
    }

    // create a image with a single texture
    addSingle(img: ImageSource): [Texture, Quad, number] {
        const tex = Texture.fromImage(this._gfx, img);
        this._big.push(tex);
        return [tex, new Quad(0, 0, 1, 1), 0];
    }

    add(img: ImageSource): [Texture, Quad, number] {
        const pad = this._pad * 2;
        const paddedWidth = img.width + pad;
        const paddedHeight = img.height + pad;
        const maxX = this._el.width, maxY = this._el.height;
        const rectToAdd = new Rect(new Vec2(), paddedWidth, paddedHeight);
        const p = rectToAdd.pos;

        if (paddedWidth > maxX || paddedHeight > maxY) {
            // No chance of ever fitting.
            return this.addSingle(img);
        }
        let curTex = this._textures.at(-1)!;

        // find position
        let x = 0, y = 0, found = false;
        const doesitfit = () => {
            // goes offscreen?
            if (x + paddedWidth > maxX || y + paddedHeight > maxY) return false;
            // try it
            p.x = x;
            p.y = y;
            for (var [_, { rect, tex }] of this._used) {
                if (curTex !== tex) continue;
                if (rect.collides(rectToAdd)) return false;
            }
            return found = true;
        };

        // initial check for (0, 0)
        if (!doesitfit()) {
            for (
                var [_, { rect: { pos, width, height }, tex }] of this._used
            ) {
                if (curTex !== tex) continue;
                // try to the right
                x = pos.x + width;
                y = pos.y;
                if (doesitfit()) break;
                // try below
                x = pos.x;
                y = pos.y + height;
                if (doesitfit()) break;
            }
        }

        // no room --> go to next texture and put at (0, 0)
        if (!found) {
            this._ctx.clearRect(
                x =
                    y =
                    p.x =
                    p.y =
                        0,
                0,
                maxX,
                maxY,
            );
            this._textures.push(
                curTex = Texture.fromImage(this._gfx, this._el),
            );
        }

        if (img instanceof ImageData) this._ctx.putImageData(img, x, y);
        else this._ctx.drawImage(img, x, y);

        curTex.update(this._el);

        this._used.set(this._last, {
            rect: rectToAdd,
            tex: curTex,
        });

        return [
            curTex,
            new Quad(x / maxX, y / maxY, img.width / maxX, img.height / maxY),
            this._last++,
        ];
    }
    free() {
        this._textures.forEach(tex => tex.free());
        this._big.forEach(tex => tex.free());
    }
    remove(packerId: number) {
        const tex = this._used.get(packerId);

        if (!tex) {
            throw new Error("Texture with packer id not found");
        }

        const { pos: { x, y }, width, height } = tex.rect;
        this._ctx.clearRect(x, y, width, height);

        tex.tex.update(this._el);
        this._used.delete(packerId);
    }
}

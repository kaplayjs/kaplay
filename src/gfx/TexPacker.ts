import { drawImageSourceAt } from "../assets/utils";
import { Quad, Rect } from "../math/math";
import { Vec2 } from "../math/Vec2";
import type { ImageSource } from "../types";
import { type GfxCtx, Texture } from "./gfx";

export type Frame = { tex: Texture; q: Quad; id: number };

enum UsedCorner {
    TOPRIGHT = 1,
    BOTTOMLEFT = 2,
}

export class TexPacker {
    private _last: number = 0;
    private _textures: Texture[];
    private _big: Frame[] = [];
    private _used: Map<number, {
        rect: Rect;
        tex: Texture;
        used: number;
    }> = new Map();
    private _el: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _curTex: Texture;

    constructor(
        private _gfx: GfxCtx,
        w: number,
        h: number,
        private _pad: number,
    ) {
        this._el = document.createElement("canvas");
        this._el.width = w;
        this._el.height = h;
        this._textures = [this._curTex = Texture.fromImage(_gfx, this._el)];

        const context2D = this._el.getContext("2d");
        if (!context2D) throw new Error("Failed to get 2d context");

        this._ctx = context2D;
    }

    // create a image with a single texture
    addSingle(img: ImageSource): Frame {
        const f = {
            tex: Texture.fromImage(this._gfx, img),
            q: new Quad(0, 0, 1, 1),
            id: this._last++,
        };
        this._big.push(f);
        return f;
    }

    /**
     * create the default 1x1 white pixel used for primitives at uv = (1, 1).
     *
     * must be called prior to initializing anything else, as it doesn't check for
     * collisions with anything!
     */
    _createWhitePixel(): Frame {
        const whitePixel = new ImageData(
            new Uint8ClampedArray([255, 255, 255, 255]),
            1,
            1,
        );
        const { width, height } = this._el;
        drawImageSourceAt(
            this._ctx,
            whitePixel,
            width - 1,
            height - 1,
            0,
            0,
            1,
            1,
        );
        this._curTex.update(this._el);
        this._used.set(-1, {
            rect: new Rect(new Vec2(width - 1, height - 1), 1, 1),
            tex: this._curTex,
            used: 0,
        });
        return {
            tex: this._curTex,
            q: new Quad(
                (width - 1) / width,
                (height - 1) / height,
                1 / width,
                1 / height,
            ),
            id: -1,
        };
    }

    add(img: ImageSource, chopQuad?: Quad): Frame {
        const imgWidth = img.width * (chopQuad?.w ?? 1);
        const imgHeight = img.height * (chopQuad?.h ?? 1);
        const chopX = img.width * (chopQuad?.x ?? 0);
        const chopY = img.height * (chopQuad?.y ?? 0);
        const pad = this._pad * 2;
        const paddedWidth = imgWidth + pad;
        const paddedHeight = imgHeight + pad;
        const maxX = this._el.width, maxY = this._el.height;
        const rectToAdd = new Rect(new Vec2(), paddedWidth, paddedHeight);
        const p = rectToAdd.pos;

        if (paddedWidth > maxX || paddedHeight > maxY) {
            // No chance of ever fitting.
            return this.addSingle(img);
        }
        let curTex = this._curTex;

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
            for (let [_, entry] of this._used) {
                const { tex, rect: { pos, width, height }, used } = entry;
                if (curTex !== tex) continue;
                // try to the right
                if ((used & UsedCorner.TOPRIGHT) === 0) {
                    x = pos.x + width;
                    y = pos.y;
                    if (doesitfit()) {
                        entry.used |= UsedCorner.TOPRIGHT;
                        break;
                    }
                }
                if ((used & UsedCorner.BOTTOMLEFT) === 0) {
                    // try below
                    x = pos.x;
                    y = pos.y + height;
                    if (doesitfit()) {
                        entry.used |= UsedCorner.BOTTOMLEFT;
                        break;
                    }
                }
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
                curTex = this._curTex = Texture.fromImage(this._gfx, this._el),
            );
        }

        drawImageSourceAt(
            this._ctx,
            img,
            x,
            y,
            chopX,
            chopY,
            imgWidth,
            imgHeight,
        );

        curTex.update(this._el);

        this._used.set(this._last, {
            rect: rectToAdd,
            tex: curTex,
            used: 0,
        });

        return {
            tex: curTex,
            q: new Quad(x / maxX, y / maxY, imgWidth / maxX, imgHeight / maxY),
            id: this._last++,
        };
    }
    free() {
        this._textures.forEach(tex => tex.free());
        this._big.forEach(f => f.tex.free());
        this._used.clear();
        this._big = [];
    }
    remove(packerId: number) {
        const tex = this._used.get(packerId);

        if (!tex) {
            const big = this._big.findIndex(f => f.id === packerId);
            if (big < 0) {
                throw new Error("Texture with packer id not found");
            }
            this._big.splice(big, 1)[0]!.tex.free();
            return;
        }
        if (tex.tex !== this._curTex) {
            throw new Error("Cannot remove from inactive texture");
        }
        const { pos: { x, y }, width, height } = tex.rect;
        this._ctx.clearRect(x, y, width, height);

        tex.tex.update(this._el);
        this._used.delete(packerId);
    }
}

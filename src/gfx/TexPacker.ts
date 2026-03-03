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

interface TexMap {
    tex: Texture;
    el: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
}

export class TexPacker {
    private _last: number = 0;
    private _textures: Texture[] = [];
    private _big: Frame[] = [];
    private _used: Map<number, {
        rect: Rect;
        tex: Texture;
        used: number;
    }> = new Map();
    private _curMap: TexMap = null as any;
    private _texToEntry: Map<Texture, TexMap> = new Map();

    constructor(
        private _gfx: GfxCtx,
        private _w: number,
        private _h: number,
        private _pad: number,
    ) {
        this._newTexture();
    }

    private _hasPendingRefresh = false;
    private _newTexture(): TexMap {
        this.refreshIfPending();
        const el = document.createElement("canvas");
        el.width = this._w;
        el.height = this._h;
        const tex = Texture.fromImage(this._gfx, el);
        this._textures.push(tex);

        const ctx = el.getContext("2d");
        if (!ctx) throw new Error("Failed to get 2d context");

        this._texToEntry.set(tex, this._curMap = { tex, el, ctx });
        return this._curMap;
    }
    refreshIfPending() {
        if (this._hasPendingRefresh) {
            this._curMap.tex.update(this._curMap.el);
            this._hasPendingRefresh = false;
        }
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
        const { el, ctx, tex } = this._curMap;
        const whitePixel = new ImageData(
            new Uint8ClampedArray([255, 255, 255, 255]),
            1,
            1,
        );
        const { width, height } = el;
        drawImageSourceAt(
            ctx,
            whitePixel,
            width - 1,
            height - 1,
            0,
            0,
            1,
            1,
        );
        tex.update(el);
        this._used.set(-1, {
            rect: new Rect(new Vec2(width - 1, height - 1), 1, 1),
            tex: tex,
            used: 0,
        });
        return {
            tex,
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
        let { el: curEl, ctx: curCtx, tex: curTex } = this._curMap;

        const maxX = curEl.width, maxY = curEl.height;
        const rectToAdd = new Rect(new Vec2(), paddedWidth, paddedHeight);
        const p = rectToAdd.pos;

        if (paddedWidth > maxX || paddedHeight > maxY) {
            // No chance of ever fitting.
            return this.addSingle(img);
        }

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
            x =
                y =
                p.x =
                p.y =
                    0;
            ({ tex: curTex, ctx: curCtx, el: curEl } = this._newTexture());
        }

        drawImageSourceAt(
            curCtx,
            img,
            x,
            y,
            chopX,
            chopY,
            imgWidth,
            imgHeight,
        );

        this._hasPendingRefresh = true;

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
        const entry = this._used.get(packerId);

        if (!entry) {
            const big = this._big.findIndex(f => f.id === packerId);
            if (big < 0) {
                throw new Error("Texture with packer id not found");
            }
            this._big.splice(big, 1)[0]!.tex.free();
            return;
        }
        const { rect: { pos: { x, y }, width, height }, tex } = entry;
        const { ctx, el } = this._texToEntry.get(tex)!;
        ctx.clearRect(x, y, width, height);

        tex.update(el);
        this._used.delete(packerId);
    }
}

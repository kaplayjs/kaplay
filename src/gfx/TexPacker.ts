import { drawImageSourceAt } from "../assets/utils";
import { Quad, Rect } from "../math/math";
import { Vec2 } from "../math/Vec2";
import type { ImageSource, TexFilter } from "../types";
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

class FilterTexPacker {
    _textures: Texture[] = [];
    _big: Frame[] = [];
    _used: Map<number, {
        rect: Rect;
        tex: Texture;
        used: number;
    }> = new Map();
    _curMap: TexMap = null as any;
    _tex2Map: Map<Texture, TexMap> = new Map();

    constructor(
        private _p: TexPacker,
        private _f: TexFilter,
        private _gfx: GfxCtx,
        private _w: number,
        private _h: number,
        private _pad: number,
    ) {
        this._newTexture();
    }

    private _hasPendingRefresh = false;
    private _newTexture(): TexMap {
        this._sync();
        const el = document.createElement("canvas");
        el.width = this._w;
        el.height = this._h;
        const tex = Texture.fromImage(this._gfx, el, { filter: this._f });
        this._textures.push(tex);

        const ctx = el.getContext("2d");
        if (!ctx) throw new Error("Failed to get 2d context");

        this._tex2Map.set(tex, this._curMap = { tex, el, ctx });
        return this._curMap;
    }
    _sync() {
        if (this._hasPendingRefresh) {
            this._curMap.tex.update(this._curMap.el);
            this._hasPendingRefresh = false;
        }
    }

    _single(img: ImageSource): Frame {
        const f = this._p._saveFrame(
            this,
            Texture.fromImage(this._gfx, img),
            new Quad(0, 0, 1, 1),
        );
        this._big.push(f);
        return f;
    }

    _add(img: ImageSource, chopQuad: Quad | undefined): Frame {
        const imgWidth = img.width * (chopQuad?.w ?? 1);
        const imgHeight = img.height * (chopQuad?.h ?? 1);
        const chopX = img.width * (chopQuad?.x ?? 0);
        const chopY = img.height * (chopQuad?.y ?? 0);
        const pad = this._pad;
        const pad2 = pad * 2;
        const paddedWidth = imgWidth + pad2;
        const paddedHeight = imgHeight + pad2;
        let { el: curEl, ctx: curCtx, tex: curTex } = this._curMap;

        const maxX = curEl.width, maxY = curEl.height;
        const rectToAdd = new Rect(new Vec2(), paddedWidth, paddedHeight);
        const p = rectToAdd.pos;

        if (paddedWidth > maxX || paddedHeight > maxY) {
            // No chance of ever fitting.
            return this._single(img);
        }

        // find position
        let x = pad, y = pad, found = false;
        const doesitfit = () => {
            // goes offscreen?
            if (
                x + paddedWidth > (maxX + pad)
                || y + paddedHeight > (maxY + pad)
            ) return false;
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

        const f = this._p._saveFrame(
            this,
            curTex,
            new Quad(x / maxX, y / maxY, imgWidth / maxX, imgHeight / maxY),
        );

        this._used.set(f.id, {
            rect: rectToAdd,
            tex: curTex,
            used: 0,
        });

        return f;
    }
    _free() {
        this._textures.forEach(tex => tex.free());
        this._big.forEach(f => f.tex.free());
        this._used.clear();
        this._big = [];
    }
    _remove(packerId: number) {
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
        this._tex2Map.get(tex)!.ctx.clearRect(x, y, width, height);

        this._used.delete(packerId);
        this._hasPendingRefresh = true;
    }
}

export class TexPacker {
    _packers: Partial<Record<TexFilter, FilterTexPacker>> = {};
    _last = 0;
    _idsToPackers: Record<number, FilterTexPacker> = {};
    constructor(
        private _gfx: GfxCtx,
        private _w: number,
        private _h: number,
        private _pad: number,
    ) {}
    private _getPacker(filter: TexFilter): FilterTexPacker {
        return (this._packers[filter] ??= new FilterTexPacker(
            this,
            filter,
            this._gfx,
            this._w,
            this._h,
            this._pad,
        ));
    }
    _saveFrame(packer: FilterTexPacker, tex: Texture, quad: Quad): Frame {
        const id = this._last++;
        this._idsToPackers[id] = packer;
        return {
            id,
            tex,
            q: quad,
        };
    }
    /**
     * create the default 1x1 white pixel used for primitives at uv = (1, 1) on the nearest filter texture
     *
     * must be called prior to initializing anything else, as it doesn't check for
     * collisions with anything!
     */
    _createWhitePixel(): Frame {
        const packer = this._getPacker("nearest");
        const { el, ctx, tex } = packer._curMap;
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
        packer._used.set(-1, {
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
    add(img: ImageSource, filter: TexFilter, chopQuad?: Quad): Frame {
        return this._getPacker(filter)._add(img, chopQuad);
    }
    // create a image with a single texture
    addSingle(img: ImageSource, filter: TexFilter): Frame {
        return this._getPacker(filter)._single(img);
    }
    syncIfPending() {
        Object.values(this._packers).forEach(p => p._sync());
    }
    remove(id: number) {
        this._idsToPackers[id]?._remove(id);
        delete this._idsToPackers[id];
    }
    free() {
        Object.values(this._packers).forEach(p => p._free());
        this._packers = {};
    }
}

import { drawImageSourceAt } from "../assets/utils";
import { Quad, Rect, testRectRect } from "../math/math";
import { Vec2 } from "../math/Vec2";
import type { ImageSource, TexFilter } from "../types";
import { type GfxCtx, Texture } from "./gfx";

export type Frame = { tex: Texture; q: Quad; id: number };

class TexMap {
    constructor(
        public tex: Texture,
        public el: HTMLCanvasElement,
        public ctx: CanvasRenderingContext2D,
    ) {}
    hg = new PackerHashGrid();
    fch: RectNode | undefined = undefined;
    fct: RectNode | undefined = undefined;
    _addRect(node: RectNode) {
        if (this.fch === undefined) {
            this.fch = this.fct = node;
            node.prev = undefined;
            node.next = undefined;
        }
        else {
            node.prev = undefined;
            node.next = this.fch;
            this.fch!.prev = node;
            this.fch = node;
        }
    }
    _removeRect(node: RectNode) {
        if (node.prev) {
            node.prev.next = node.next;
        }
        else {
            this.fch = node.next;
        }

        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            this.fct = node.prev;
        }
        node.next = node.prev = undefined;
    }
    _isInFreeList(node: RectNode) {
        return node.prev !== undefined || node.next !== undefined
            || this.fch === node;
    }
}

interface RectNode {
    id: number;
    rect: Rect;
    tex: Texture;
    parent?: RectNode;
    childTR?: RectNode;
    childBL?: RectNode;
    prev?: RectNode;
    next?: RectNode;
}

const floor = Math.floor;
class PackerHashGrid {
    private g: Partial<Record<string, Set<RectNode>>> = {};

    constructor(private c = 64) {}

    _insert(node: RectNode) {
        const { rect: { pos: { x, y }, width, height } } = node;
        const cs = this.c;
        // Get all cells the rectangle overlaps
        const minCellX = floor(x / cs);
        const minCellY = floor(y / cs);
        const maxCellX = floor((x + width) / cs);
        const maxCellY = floor((y + height) / cs);

        for (let x = minCellX; x <= maxCellX; x++) {
            for (let y = minCellY; y <= maxCellY; y++) {
                (this.g[`${x},${y}`] ??= new Set()).add(node);
            }
        }
    }

    _remove(node: RectNode) {
        const { rect: { pos: { x, y }, width, height } } = node;
        const cs = this.c;
        // Get all cells the rectangle overlaps
        const minCellX = floor(x / cs);
        const minCellY = floor(y / cs);
        const maxCellX = floor((x + width) / cs);
        const maxCellY = floor((y + height) / cs);

        for (let x = minCellX; x <= maxCellX; x++) {
            for (let y = minCellY; y <= maxCellY; y++) {
                this.g[`${x},${y}`]?.delete(node);
            }
        }
    }

    _fitCheck(rect: Rect): boolean {
        const { pos: { x, y }, width, height } = rect;
        const cs = this.c;
        // Get all cells the rectangle overlaps
        const minCellX = floor(x / cs);
        const minCellY = floor(y / cs);
        const maxCellX = floor((x + width) / cs);
        const maxCellY = floor((y + height) / cs);

        let fits = true;
        for (let x = minCellX; x <= maxCellX && fits; x++) {
            for (let y = minCellY; y <= maxCellY && fits; y++) {
                this.g[`${x},${y}`]?.forEach(node => {
                    if (testRectRect(rect, node.rect)) fits = false;
                });
            }
        }
        return fits;
    }
}

class FilterTexPacker {
    _textures: Texture[] = [];
    #big: Frame[] = [];
    #used = new Map<number, RectNode>();
    _curMap!: TexMap;
    #tex2Map = new Map<Texture, TexMap>();

    constructor(
        private _p: TexPacker,
        private _f: TexFilter,
        private _gfx: GfxCtx,
        private _w: number,
        private _h: number,
        private _pad: number,
    ) {
        this.#newTexture();
    }

    #hasPendingRefresh = false;
    #newTexture(): TexMap {
        this._sync();
        const el = document.createElement("canvas");
        el.width = this._w;
        el.height = this._h;
        const tex = Texture.fromImage(this._gfx, el, { filter: this._f });
        this._textures.push(tex);

        const ctx = el.getContext("2d");
        if (!ctx) throw new Error("Failed to get 2d context");

        this.#tex2Map.set(tex, this._curMap = new TexMap(tex, el, ctx));
        return this._curMap;
    }
    _sync() {
        if (this.#hasPendingRefresh) {
            this._curMap.tex.update(this._curMap.el);
            this.#hasPendingRefresh = false;
        }
    }

    _single(img: ImageSource): Frame {
        const f = this._p._saveFrame(
            this,
            Texture.fromImage(this._gfx, img, { filter: this._f }),
            new Quad(0, 0, 1, 1),
        );
        this.#big.push(f);
        return f;
    }

    _blit(
        img: ImageSource,
        x: number,
        y: number,
        chopX: number,
        chopY: number,
        imgWidth: number,
        imgHeight: number,
    ) {
        const m = this._curMap;
        drawImageSourceAt(
            m.ctx,
            img,
            x,
            y,
            chopX,
            chopY,
            imgWidth,
            imgHeight,
        );
        this.#hasPendingRefresh = true;
    }

    _add(img: ImageSource, chopQuad: Quad | undefined): Frame {
        const imgWidth = img.width * (chopQuad?.w ?? 1);
        const imgHeight = img.height * (chopQuad?.h ?? 1);
        const chopX = img.width * (chopQuad?.x ?? 0);
        const chopY = img.height * (chopQuad?.y ?? 0);
        const pad = this._pad;
        const paddedWidth = imgWidth + pad;
        const paddedHeight = imgHeight + pad;
        let m = this._curMap;
        let { el: curEl, tex: curTex } = m;

        const maxX = curEl.width, maxY = curEl.height;
        const rectToAdd = new Rect(new Vec2(), paddedWidth, paddedHeight);
        const p = rectToAdd.pos;

        if (paddedWidth > maxX || paddedHeight > maxY) {
            // No chance of ever fitting.
            return this._single(img);
        }

        // find position
        let x = pad, y = pad;
        const doesitfit = () => {
            // goes offscreen?
            if (x + paddedWidth > maxX || y + paddedHeight > maxY) return false;
            // try it
            p.set(x, y);
            return m.hg._fitCheck(rectToAdd);
        };

        // initial check for (0, 0)
        let found = false,
            foundParentNode: RectNode | undefined,
            foundCornerIsTopRight: boolean;
        if (doesitfit()) {
            found = true;
        }
        else {
            for (let node = m.fch; node !== undefined; node = node.next) {
                const { rect: { pos, width, height }, childBL, childTR } = node;
                if (!childTR) {
                    x = pos.x + width;
                    y = pos.y;
                    if (doesitfit()) {
                        foundParentNode = node;
                        found = foundCornerIsTopRight = true;
                        if (childBL) m._removeRect(node);
                        break;
                    }
                }
                // try below
                if (!childBL) {
                    x = pos.x;
                    y = pos.y + height;
                    if (doesitfit()) {
                        foundParentNode = node;
                        found = true;
                        foundCornerIsTopRight = false;
                        if (childTR) m._removeRect(node);
                        break;
                    }
                }
            }
        }

        // no room --> go to next texture and put at (pad, pad)
        if (!found) {
            x =
                y =
                p.x =
                p.y =
                    pad;
            ({ tex: curTex, el: curEl } = m = this.#newTexture());
        }

        this._blit(img, x, y, chopX, chopY, imgWidth, imgHeight);

        const f = this._p._saveFrame(
            this,
            curTex,
            new Quad(x / maxX, y / maxY, imgWidth / maxX, imgHeight / maxY),
        );

        const newNode: RectNode = {
            id: f.id,
            rect: rectToAdd,
            tex: curTex,
            parent: foundParentNode,
        };

        if (foundParentNode) {
            foundParentNode[foundCornerIsTopRight! ? "childTR" : "childBL"] =
                newNode;
        }

        this.#used.set(f.id, newNode);
        m.hg._insert(newNode);
        m._addRect(newNode);

        return f;
    }
    _addPrepacked(img: ImageSource, frames: Quad[]): Frame[] {
        const main = this._add(img, undefined);
        return frames.map(frame =>
            this._p._saveFrame(
                this,
                main.tex,
                main.q.scale(frame),
            )
        );
    }
    _free() {
        this._textures.forEach(tex => tex.free());
        this.#big.forEach(f => f.tex.free());
        this.#used.clear();
        this.#big = [];
    }
    _remove(packerId: number) {
        const node = this.#used.get(packerId);

        if (!node) {
            const big = this.#big.findIndex(f => f.id === packerId);
            if (big < 0) {
                throw new Error(
                    "Image not found in packer (was this loaded via a prepacked spritesheet?)",
                );
            }
            this.#big.splice(big, 1)[0]!.tex.free();
            return;
        }

        const { rect: { pos: { x, y }, width, height }, tex } = node;
        const m = this.#tex2Map.get(tex)!;
        m.ctx.clearRect(x, y, width, height);

        m.hg._remove(node);
        if (m._isInFreeList(node)) m._removeRect(node);

        // free parent corner
        const parent = node.parent;
        if (parent) {
            if (parent.childTR === node) {
                parent.childTR = undefined;
            }
            if (parent.childBL === node) {
                parent.childBL = undefined;
            }
            if (!m._isInFreeList(parent)) m._addRect(parent);
        }

        this.#used.delete(packerId);
        this.#hasPendingRefresh = true;
    }
}

export class TexPacker {
    _packers: Partial<Record<string, FilterTexPacker>> = {};
    _last = 0;
    _idsToPackers: Record<number, FilterTexPacker> = {};
    constructor(
        private _gfx: GfxCtx,
        private _w: number,
        private _h: number,
        private _pad: number,
    ) {}
    _getPacker(filter: TexFilter, name: string = filter): FilterTexPacker {
        return (this._packers[name] ??= new FilterTexPacker(
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
        const { el: { width, height }, tex } = packer._curMap;
        const whitePixel = new ImageData(
            new Uint8ClampedArray([255, 255, 255, 255]),
            1,
            1,
        );
        packer._blit(whitePixel, width - 1, height - 1, 0, 0, 1, 1);
        packer._curMap.hg._insert({
            rect: new Rect(new Vec2(width - 1, height - 1), 1, 1),
            tex: tex,
            id: -1,
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
    addPrepacked(img: ImageSource, filter: TexFilter, frames: Quad[]): Frame[] {
        return this._getPacker(filter)._addPrepacked(img, frames);
    }
    // create a image with a single texture
    addSingle(img: ImageSource, filter: TexFilter): Frame {
        return this._getPacker(filter)._single(img);
    }
    syncIfPending() {
        Object.values(this._packers).forEach(p => p!._sync());
    }
    _remove(id: number) {
        this._idsToPackers[id]?._remove(id);
        delete this._idsToPackers[id];
    }
    _free() {
        Object.values(this._packers).forEach(p => p!._free());
        this._packers = {};
    }
}

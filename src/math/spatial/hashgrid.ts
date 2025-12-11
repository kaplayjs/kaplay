import { DEF_HASH_GRID_SIZE } from "../../constants/general";
import type { AreaComp } from "../../ecs/components/physics/area";
import { objectTransformNeedsUpdate } from "../../ecs/entity/GameObjRaw";
import { drawRect } from "../../gfx/draw/drawRect";
import type { GameObj } from "../../types";
import { type Rect, vec2 } from "../math";
import { calcTransform } from "../various";
import type { Vec2 } from "../Vec2";

export type HashGridOpt = {
    hashGridSize?: number;
};

export class HashGrid {
    bounds: Rect;
    cellSize: number;
    columns: number;
    grid: Array<Array<GameObj<AreaComp>>> = [];
    hashesForObject: Map<GameObj<AreaComp>, Array<number>> = new Map<
        GameObj<AreaComp>,
        Array<number>
    >();

    constructor(bounds: Rect, opt: HashGridOpt) {
        this.bounds = bounds.clone();
        this.cellSize = opt.hashGridSize || DEF_HASH_GRID_SIZE;
        this.columns = Math.floor(bounds.width / this.cellSize);

        this._clampBoundsToCellSize();
    }

    add(obj: GameObj<AreaComp>) {
        const bbox = obj.worldBbox();
        if (!this._isInside(bbox)) {
            this._resizeToFit(bbox);
        }
        const hashes = this._hashRect(bbox);
        for (let i = 0; i < hashes.length; i++) {
            const hash = hashes[i];
            this._addObjectToGridByHash(obj, hash);
        }
        this.hashesForObject.set(obj, hashes);
    }

    remove(obj: GameObj<AreaComp>) {
        const hashes = this.hashesForObject.get(obj);
        if (hashes) {
            for (let i = 0; i < hashes.length; i++) {
                const hash = hashes[i];
                this._removeObjectFromGridByHash(obj, hash);
            }
        }
        this.hashesForObject.delete(obj);
    }

    clear() {
        this.grid = [];
        this.hashesForObject.clear();
    }

    update() {
        const oldSet = new Set<number>();
        const newSet = new Set<number>();
        for (const [obj, oldHashes] of this.hashesForObject) {
            for (let i = 0; i < oldHashes.length; i++) {
                const hash = oldHashes[i];
                oldSet.add(hash);
            }
            const newHashes = this._hashRect(obj.worldBbox());
            for (let i = 0; i < newHashes.length; i++) {
                const hash = newHashes[i];
                newSet.add(hash);
            }
            if (oldSet.symmetricDifference(newSet).size == 0) {
                oldSet.clear();
                newSet.clear();
                continue;
            }
            for (const hash of oldSet.difference(newSet)) {
                this._removeObjectFromGridByHash(obj, hash);
            }
            for (const hash of newSet.difference(oldSet)) {
                this._addObjectToGridByHash(obj, hash);
            }
            oldHashes.length = 0;
            for (let i = 0; i < newHashes.length; i++) {
                const hash = newHashes[i];
                oldHashes.push(hash);
            }
            oldSet.clear();
            newSet.clear();
        }

        /*for (const i in this.grid) {
            if (this.grid[i].length) {
                drawRect({
                    pos: vec2(i % this.columns, Math.floor(i / this.columns)).scale(this.cellSize),
                    width: this.cellSize,
                    height: this.cellSize
                });
            }
        }*/
    }

    /**
     * Iterates all object pairs which potentially collide
     */
    iterPairs(
        pairCb: (obj1: GameObj<AreaComp>, obj2: GameObj<AreaComp>) => void,
    ) {
        const checked = new Set<GameObj<AreaComp>>();
        for (const [obj1, hashes] of this.hashesForObject) {
            checked.add(obj1);
            const collisions = new Set<GameObj<AreaComp>>();
            for (let i = 0; i < hashes.length; i++) {
                const hash = hashes[i];
                for (const obj2 of this.grid[hash]) {
                    if (!checked.has(obj2)) {
                        collisions.add(obj2);
                    }
                }
            }
            for (const obj2 of collisions) {
                pairCb(obj1, obj2);
            }
        }
    }

    /**
     * Retrieves all object which potentially collide with the rectangle
     */
    retrieve(rect: Rect, retrieveCb: (obj: GameObj<AreaComp>) => void) {
        const hashes = this._hashRect(rect);
        const objects = new Set<GameObj<AreaComp>>();
        for (let i = 0; i < hashes.length; i++) {
            const hash = hashes[i];
            const cell = this.grid[hash];
            if (cell) {
                for (const obj of this.grid[hash]) {
                    objects.add(obj);
                }
            }
        }
        for (const obj of objects) {
            retrieveCb(obj);
        }
    }

    private _hashPoint(point: Vec2) {
        const x = Math.floor((point.x - this.bounds.pos.x) / this.cellSize);
        const y = Math.floor((point.y - this.bounds.pos.y) / this.cellSize);
        return x + y * this.columns;
    }

    private _hashRect(rect: Rect) {
        rect = rect.clone();

        // Clamp rect
        // TODO: remove this once update resizes too
        if (rect.pos.x < this.bounds.pos.x) {
            const diff = this.bounds.pos.x - rect.pos.x;
            rect.pos.x = this.bounds.pos.x;
            rect.width -= diff;
        }
        if (rect.pos.y < this.bounds.pos.y) {
            const diff = this.bounds.pos.y - rect.pos.y;
            rect.pos.y = this.bounds.pos.y;
            rect.height -= diff;
        }
        if (rect.pos.x + rect.width > this.bounds.pos.x + this.bounds.width) {
            rect.width = this.bounds.pos.x + this.bounds.width - rect.pos.x;
        }
        if (rect.pos.y + rect.height > this.bounds.pos.y + this.bounds.height) {
            rect.height = this.bounds.pos.y + this.bounds.height - rect.pos.y;
        }

        // Calculate hashes
        const w = Math.floor(this.bounds.width / this.cellSize);
        let hash = this._hashPoint(rect.pos);
        const hashes = [];
        const rw = Math.ceil(rect.width / this.cellSize);
        const rh = Math.ceil(rect.height / this.cellSize);
        for (let y = 0; y <= rh; y++) {
            for (let x = 0; x <= rw; x++) {
                hashes.push(hash);
                hash++;
            }
            hash += w - rw - 1;
        }
        return hashes;
    }

    private _addObjectToGridByHash(obj: GameObj<AreaComp>, hash: number) {
        if (!this.grid[hash]) {
            this.grid[hash] = [];
        }
        this.grid[hash].push(obj);
    }

    private _removeObjectFromGridByHash(obj: GameObj<AreaComp>, hash: number) {
        const objects = this.grid[hash];
        const index = objects.indexOf(obj);
        if (index >= 0) {
            objects.splice(index, 1);
        }
    }

    private _isInside(bbox: Rect) {
        return bbox.pos.x >= this.bounds.pos.x
            && bbox.pos.y >= this.bounds.pos.y
            && bbox.pos.x + bbox.width <= this.bounds.pos.x + this.bounds.width
            && bbox.pos.y + bbox.height
                <= this.bounds.pos.y + this.bounds.height;
    }

    private _resizeToFit(bbox: Rect) {
        this.bounds.pos.x = Math.min(this.bounds.pos.x, bbox.pos.x);
        this.bounds.pos.y = Math.min(this.bounds.pos.y, bbox.pos.y);
        this.bounds.width = Math.max(
            this.bounds.pos.x + this.bounds.width,
            bbox.pos.x + bbox.width,
        ) - this.bounds.pos.x;
        this.bounds.height = Math.max(
            this.bounds.pos.y + this.bounds.height,
            bbox.pos.y + bbox.height,
        ) - this.bounds.pos.y;

        this._clampBoundsToCellSize();

        // TODO: Recalculate hashes instead of restarting from scratch
        const objects = [...this.hashesForObject.keys()];

        this.clear();

        for (const obj of objects) {
            this.add(obj);
        }
    }

    private _clampBoundsToCellSize() {
        this.bounds.pos.x = Math.floor(this.bounds.pos.x / this.cellSize)
            * this.cellSize;
        this.bounds.pos.y = Math.floor(this.bounds.pos.y / this.cellSize)
            * this.cellSize;
        this.bounds.width = Math.ceil(this.bounds.width / this.cellSize)
            * this.cellSize;
        this.bounds.height = Math.ceil(this.bounds.height / this.cellSize)
            * this.cellSize;
    }
}

import { DEF_HASH_GRID_SIZE } from "../../constants/general";
import type { AreaComp } from "../../ecs/components/physics/area";
import { objectTransformNeedsUpdate } from "../../ecs/entity/GameObjRaw";
import type { GameObj } from "../../types";
import { calcTransform } from "../various";

export type HashGridOpt = {
    hashGridSize?: number;
};

export class HashGrid {
    grid: Record<number, Record<number, GameObj<AreaComp>[]>> = {};
    cellSize: number;
    objects: Array<GameObj<AreaComp>> = [];

    constructor(opt: HashGridOpt) {
        this.cellSize = opt.hashGridSize || DEF_HASH_GRID_SIZE;
    }

    add(obj: GameObj<AreaComp>) {
        this.objects.push(obj);
    }

    remove(obj: GameObj<AreaComp>) {
        const index = this.objects.indexOf(obj);
        if (index >= 0) {
            this.objects.splice(index, 1);
        }
    }

    clear() {
        this.objects = [];
    }

    update() {
        // Update edge data
        for (const obj of this.objects) {
            if (objectTransformNeedsUpdate(obj)) {
                calcTransform(obj, obj.transform);
            }
        }
    }

    /**
     * Iterates all object pairs which potentially collide
     */
    iterPairs(
        pairCb: (obj1: GameObj<AreaComp>, obj2: GameObj<AreaComp>) => void,
    ) {
        const checked = new Set();
        for (const obj of this.objects) {
            const bbox = obj.worldBbox();

            // Get spatial hash grid coverage
            const xMin = Math.floor(bbox.pos.x / this.cellSize);
            const yMin = Math.floor(bbox.pos.y / this.cellSize);
            const xMax = Math.ceil((bbox.pos.x + bbox.width) / this.cellSize);
            const yMax = Math.ceil((bbox.pos.y + bbox.height) / this.cellSize);

            // Cache objects that are already checked with this object
            checked.clear();

            // insert & check against all covered grids
            for (let x = xMin; x <= xMax; x++) {
                for (let y = yMin; y <= yMax; y++) {
                    if (!this.grid[x]) {
                        this.grid[x] = {};
                        this.grid[x][y] = [obj];
                    }
                    else if (!this.grid[x][y]) {
                        this.grid[x][y] = [obj];
                    }
                    else {
                        const cell = this.grid[x][y];
                        for (let i = 0; i < cell.length; i++) {
                            const other = cell[i];
                            if (checked.has(other.id)) continue;
                            pairCb(obj, other);
                            checked.add(other.id);
                        }
                        cell.push(obj);
                    }
                }
            }
        }
    }
}

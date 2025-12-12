import {
    type AreaComp,
    getLocalAreaVersion,
    getRenderAreaVersion,
} from "../../ecs/components/physics/area";
import type { PosComp } from "../../ecs/components/transform/pos";
import {
    getTransformVersion,
    objectTransformNeedsUpdate,
    transformNeedsUpdate,
} from "../../ecs/entity/GameObjRaw";
import { isPaused } from "../../ecs/entity/utils";
import type { GameObj } from "../../types";
import type { Rect } from "../math";
import { calcTransform } from "../various";
import type { BroadPhaseAlgorithm } from ".";

/**
 * Left or right edge of an object's bbox
 */
class SapEdgeHorizontal {
    obj: GameObj<AreaComp>;
    x: number;
    isLeft: boolean;

    constructor(obj: GameObj<AreaComp>, isLeft: boolean) {
        this.obj = obj;
        this.x = 0;
        this.isLeft = isLeft;
    }
}

/**
 * One dimensional horizontal sweep and prune
 *
 * @ignore
 */
export class SweepAndPruneHorizontal implements BroadPhaseAlgorithm {
    edges: Array<SapEdgeHorizontal>;
    objects: Map<GameObj<AreaComp>, [SapEdgeHorizontal, SapEdgeHorizontal]>;
    versionsForObject: Map<GameObj<AreaComp>, [number, number, number]> =
        new Map<
            GameObj<AreaComp>,
            [number, number, number]
        >();

    constructor() {
        this.edges = [];
        this.objects = new Map<
            GameObj<AreaComp>,
            [SapEdgeHorizontal, SapEdgeHorizontal]
        >();
    }

    /**
     * Add the object and its edges to the list
     * @param obj - The object to add
     */
    add(obj: GameObj<AreaComp>) {
        const left = new SapEdgeHorizontal(obj, true);
        const right = new SapEdgeHorizontal(obj, false);
        this.edges.push(left);
        this.edges.push(right);
        this.objects.set(obj, [left, right]);
        this.versionsForObject.set(obj, [
            getTransformVersion(obj),
            getRenderAreaVersion(obj),
            getLocalAreaVersion(obj),
        ]);
    }

    /**
     * Remove the object and its edges from the list
     * @param obj - The object to remove
     */
    remove(obj: GameObj<AreaComp>) {
        const pair = this.objects.get(obj);
        if (pair) {
            this.edges.splice(this.edges.indexOf(pair[0]), 1);
            this.edges.splice(this.edges.indexOf(pair[1]), 1);
            this.objects.delete(obj);
            this.versionsForObject.delete(obj);
        }
    }

    clear() {
        this.edges = [];
        this.objects.clear();
    }

    /**
     * Update edges and sort
     */
    update() {
        // Update edge data
        for (const [obj, edges] of this.objects.entries()) {
            if (shouldIgnore(obj)) continue;

            // Check if this world area changed since last frame
            const versions = this.versionsForObject.get(obj);
            if (
                versions![0] === getTransformVersion(obj)
                && versions![1] === getRenderAreaVersion(obj)
                && versions![2] === getLocalAreaVersion(obj)
            ) {
                // No change
                continue;
            }
            versions![0] = getTransformVersion(obj);
            versions![1] = getRenderAreaVersion(obj);
            versions![2] = getLocalAreaVersion(obj);

            const bbox = obj.worldBbox();
            edges[0].x = bbox.pos.x;
            edges[1].x = bbox.pos.x + bbox.width;
        }
        // Insertion sort is ~O(n) for nearly-sorted lists - which this will be
        // on all but the first iteration. The builtin Array.sort() can't make
        // this guarantee of speed -- JS engines typically use various other sorting
        // algorithms (introsort, mergesort, selection sort, treesort, etc.) that don't
        // have this nice property.
        //
        // There's an insertionSort() function elsewhere, but inlining it here
        // offers some speed benefits especially with dumber JS optimizers that
        // won't or can't automatically inline "hot" functions.
        for (let i = 1; i < this.edges.length; i++) {
            for (let j = i - 1; j >= 0; j--) {
                if (this.edges[j].x < this.edges[j + 1].x) break;
                const temp = this.edges[j];
                this.edges[j] = this.edges[j + 1];
                this.edges[j + 1] = temp;
            }
        }
    }

    /**
     * Iterates all object pairs which potentially collide
     */
    iterPairs(
        pairCb: (obj1: GameObj<AreaComp>, obj2: GameObj<AreaComp>) => void,
    ) {
        const touching = new Set<GameObj<AreaComp>>();

        for (const edge of this.edges) {
            if (edge.isLeft) {
                if (!shouldIgnore(edge.obj)) {
                    for (const obj of touching) {
                        if (!shouldIgnore(obj)) {
                            pairCb(obj, edge.obj);
                        }
                    }
                }
                touching.add(edge.obj);
            }
            else {
                touching.delete(edge.obj);
            }
        }
    }

    retrieve(rect: Rect, retrieveCb: (obj: GameObj<AreaComp>) => void) {
        const left = rect.pos.x;
        const right = left + rect.width;
        const hits = new Set<GameObj<AreaComp>>();
        for (const edge of this.edges) {
            if (edge.isLeft) {
                if (edge.x < right) {
                    hits.add(edge.obj);
                }
            }
            else {
                if (edge.x < left) {
                    hits.delete(edge.obj);
                }
            }
        }
        hits.forEach(retrieveCb);
    }
}

/**
 * Left or right edge of an object's bbox
 */
class SapEdgeVertical {
    obj: GameObj<AreaComp>;
    y: number;
    isTop: boolean;

    constructor(obj: GameObj<AreaComp>, isTop: boolean) {
        this.obj = obj;
        this.y = 0;
        this.isTop = isTop;
    }
}

/**
 * One dimensional vertical sweep and prune
 *
 * @ignore
 */
export class SweepAndPruneVertical implements BroadPhaseAlgorithm {
    edges: Array<SapEdgeVertical>;
    objects: Map<GameObj<AreaComp>, [SapEdgeVertical, SapEdgeVertical]>;
    versionsForObject: Map<GameObj<AreaComp>, [number, number, number]> =
        new Map<
            GameObj<AreaComp>,
            [number, number, number]
        >();

    constructor() {
        this.edges = [];
        this.objects = new Map<
            GameObj<AreaComp>,
            [SapEdgeVertical, SapEdgeVertical]
        >();
    }

    /**
     * Add the object and its edges to the list
     * @param obj - The object to add
     */
    add(obj: GameObj<AreaComp>) {
        const top = new SapEdgeVertical(obj, true);
        const bottom = new SapEdgeVertical(obj, false);
        this.edges.push(top);
        this.edges.push(bottom);
        this.objects.set(obj, [top, bottom]);
        this.versionsForObject.set(obj, [
            getTransformVersion(obj),
            getRenderAreaVersion(obj),
            getLocalAreaVersion(obj),
        ]);
    }

    /**
     * Remove the object and its edges from the list
     * @param obj - The object to remove
     */
    remove(obj: GameObj<AreaComp>) {
        const pair = this.objects.get(obj);
        if (pair) {
            this.edges.splice(this.edges.indexOf(pair[0]), 1);
            this.edges.splice(this.edges.indexOf(pair[1]), 1);
            this.objects.delete(obj);
            this.versionsForObject.delete(obj);
        }
    }

    clear() {
        this.edges = [];
        this.objects.clear();
    }

    /**
     * Update edges and sort
     */
    update() {
        // Update edge data
        for (const [obj, edges] of this.objects.entries()) {
            if (shouldIgnore(obj)) continue;

            // Check if this world area changed since last frame
            const versions = this.versionsForObject.get(obj);
            if (
                versions![0] === getTransformVersion(obj)
                && versions![1] === getRenderAreaVersion(obj)
                && versions![2] === getLocalAreaVersion(obj)
            ) {
                // No change
                continue;
            }
            versions![0] = getTransformVersion(obj);
            versions![1] = getRenderAreaVersion(obj);
            versions![2] = getLocalAreaVersion(obj);

            const bbox = obj.worldBbox();
            edges[0].y = bbox.pos.y;
            edges[1].y = bbox.pos.y + bbox.height;
        }
        // Insertion sort is ~O(n) for nearly-sorted lists - which this will be
        // on all but the first iteration. The builtin Array.sort() can't make
        // this guarantee of speed -- JS engines typically use various other sorting
        // algorithms (introsort, mergesort, selection sort, treesort, etc.) that don't
        // have this nice property.
        //
        // There's an insertionSort() function elsewhere, but inlining it here
        // offers some speed benefits especially with dumber JS optimizers that
        // won't or can't automatically inline "hot" functions.
        for (let i = 1; i < this.edges.length; i++) {
            for (let j = i - 1; j >= 0; j--) {
                if (this.edges[j].y < this.edges[j + 1].y) break;
                const temp = this.edges[j];
                this.edges[j] = this.edges[j + 1];
                this.edges[j + 1] = temp;
            }
        }
    }

    /**
     * Iterates all object pairs which potentially collide
     */
    iterPairs(
        pairCb: (obj1: GameObj<AreaComp>, obj2: GameObj<AreaComp>) => void,
    ): void {
        const touching = new Set<GameObj<AreaComp>>();

        for (const edge of this.edges) {
            if (edge.isTop) {
                if (!shouldIgnore(edge.obj)) {
                    for (const obj of touching) {
                        if (!shouldIgnore(obj)) {
                            pairCb(obj, edge.obj);
                        }
                    }
                }
                touching.add(edge.obj);
            }
            else {
                touching.delete(edge.obj);
            }
        }
    }

    retrieve(rect: Rect, retrieveCb: (obj: GameObj<AreaComp>) => void) {
        const top = rect.pos.y;
        const bottom = top + rect.height;
        const hits = new Set<GameObj<AreaComp>>();
        for (const edge of this.edges) {
            if (edge.isTop) {
                if (edge.y < bottom) {
                    hits.add(edge.obj);
                }
            }
            else {
                if (edge.y < top) {
                    hits.delete(edge.obj);
                }
            }
        }
        hits.forEach(retrieveCb);
    }
}

function shouldIgnore(obj: GameObj) {
    return !obj.exists() || isPaused(obj);
}

import type { AreaComp } from "../../ecs/components/physics/area";
import { isPaused } from "../../ecs/entity/utils";
import type { GameObj } from "../../types";
import { calcTransform } from "../various";

/**
 * Left or right edge of an object's bbox
 */
class SapEdge {
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
 * One dimensional sweep and prune
 *
 * @ignore
 */
export class SweepAndPrune {
    edges: Array<SapEdge>;
    objects: Map<GameObj<AreaComp>, [SapEdge, SapEdge]>;

    constructor() {
        this.edges = [];
        this.objects = new Map<GameObj<AreaComp>, [SapEdge, SapEdge]>();
    }

    /**
     * Add the object and its edges to the list
     * @param obj - The object to add
     */
    add(obj: GameObj<AreaComp>) {
        if (this.objects.has(obj)) return;
        const left = new SapEdge(obj, true);
        const right = new SapEdge(obj, false);
        this.edges.push(left);
        this.edges.push(right);
        this.objects.set(obj, [left, right]);
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
            if (!obj.exists()) continue;
            calcTransform(obj, obj.transform);
            const bbox = obj.worldArea().bbox();
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
     * Iterates all object pairs which potentially collide and
     * passes them to the collision callback.
     */
    process(
        collisionCb: (obj1: GameObj<AreaComp>, obj2: GameObj<AreaComp>) => void,
    ) {
        const touching = new Set<GameObj<AreaComp>>();

        for (const edge of this.edges) {
            if (edge.isLeft) {
                if (edge.obj.exists()) {
                    for (const obj of touching) {
                        if (obj.exists()) {
                            collisionCb(obj, edge.obj);
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
}

import type { AreaComp } from "../../ecs/components/physics/area";
import { isPaused } from "../../ecs/entity/utils";
import type { GameObj } from "../../types";
import { insertionSort } from "../sort";
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
            if (shouldIgnore(obj)) continue;
            calcTransform(obj, obj.transform);
            const bbox = obj.worldArea().bbox();
            edges[0].x = bbox.pos.x;
            edges[1].x = bbox.pos.x + bbox.width;
        }
        insertionSort(this.edges, (a, b) => b.x > a.x);
    }

    /**
     * Iterates all object pairs which potentially collide
     */
    *[Symbol.iterator]() {
        const touching = new Set<GameObj<AreaComp>>();

        for (const edge of this.edges) {
            if (edge.isLeft) {
                if (!shouldIgnore(edge.obj)) {
                    for (const obj of touching) {
                        if (!shouldIgnore(obj)) {
                            yield [obj, edge.obj];
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

function shouldIgnore(obj: GameObj) {
    return !obj.exists() || isPaused(obj);
}

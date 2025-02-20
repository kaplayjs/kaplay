import type { AreaComp } from "../../components";
import type { GameObj } from "../../types";
import { calcTransform } from "../various";

/**
 * Left or right edge of an object's bbox
 */
class HorizontalEdge {
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
 * One dimensional sweep and prune in the horizontal direction
 */
export class SweepAndPruneHorizontal {
    edges: Array<HorizontalEdge>;
    objects: Map<GameObj<AreaComp>, [HorizontalEdge, HorizontalEdge]>;

    constructor() {
        this.edges = [];
        this.objects = new Map<GameObj<AreaComp>, [HorizontalEdge, HorizontalEdge]>();
    }

    /**
     * Add the object and its edges to the list
     * @param obj The object to add
     */
    add(obj: GameObj<AreaComp>) {
        const left = new HorizontalEdge(obj, true);
        const right = new HorizontalEdge(obj, false);
        this.edges.push(left);
        this.edges.push(right);
        this.objects.set(obj, [left, right]);
    }

    /**
     * Remove the object and its edges from the list
     * @param obj The object to remove
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
            calcTransform(obj, obj.transform);
            const bbox = obj.worldArea().bbox();
            edges[0].x = bbox.pos.x;
            edges[1].x = bbox.pos.x + bbox.width;
        }
        // Insertion sort. This is slow the first time, but faster afterwards as the list is nearly sorted
        for (let i = 1; i < this.edges.length; i++) {
            for (let j = i - 1; j >= 0; j--) {
                if (this.edges[j].x < this.edges[j + 1].x) break;
                [this.edges[j], this.edges[j + 1]] = [
                    this.edges[j + 1],
                    this.edges[j],
                ];
            }
        }
    }

    /**
     * Iterates all object pairs which potentially collide
     */
    *[Symbol.iterator]() {
        const touching = new Set<GameObj<AreaComp>>();

        for (const edge of this.edges) {
            if (edge.isLeft) {
                for (const obj of touching) {
                    yield [obj, edge.obj];
                }
                touching.add(edge.obj);
            }
            else {
                touching.delete(edge.obj);
            }
        }
    }
}

/**
 * Top or bottom edge of an object's bbox
 */
class VerticalEdge {
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
 * One dimensional sweep and prune
 */
export class SweepAndPruneVertical {
    edges: Array<VerticalEdge>;
    objects: Map<GameObj<AreaComp>, [VerticalEdge, VerticalEdge]>;

    constructor() {
        this.edges = [];
        this.objects = new Map<GameObj<AreaComp>, [VerticalEdge, VerticalEdge]>();
    }

    /**
     * Add the object and its edges to the list
     * @param obj The object to add
     */
    add(obj: GameObj<AreaComp>) {
        const top = new VerticalEdge(obj, true);
        const bottom = new VerticalEdge(obj, false);
        this.edges.push(top);
        this.edges.push(bottom);
        this.objects.set(obj, [top, bottom]);
    }

    /**
     * Remove the object and its edges from the list
     * @param obj The object to remove
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
            calcTransform(obj, obj.transform);
            const bbox = obj.worldArea().bbox();
            edges[0].y = bbox.pos.y;
            edges[1].y = bbox.pos.y + bbox.height;
        }
        // Insertion sort. This is slow the first time, but faster afterwards as the list is nearly sorted
        for (let i = 1; i < this.edges.length; i++) {
            for (let j = i - 1; j >= 0; j--) {
                if (this.edges[j].y < this.edges[j + 1].y) break;
                [this.edges[j], this.edges[j + 1]] = [
                    this.edges[j + 1],
                    this.edges[j],
                ];
            }
        }
    }

    /**
     * Iterates all object pairs which potentially collide
     */
    *[Symbol.iterator]() {
        const touching = new Set<GameObj<AreaComp>>();

        for (const edge of this.edges) {
            if (edge.isTop) {
                for (const obj of touching) {
                    yield [obj, edge.obj];
                }
                touching.add(edge.obj);
            }
            else {
                touching.delete(edge.obj);
            }
        }
    }
}

/**
 * two dimensional sweep and prune
 */
export class SweepAndPruneBoth {
    horizontal: SweepAndPruneHorizontal = new SweepAndPruneHorizontal();
    vertical: SweepAndPruneVertical = new SweepAndPruneVertical();

    constructor() {

    }

    add(obj: GameObj<AreaComp>) {
        this.horizontal.add(obj);
        this.vertical.add(obj);
    }

    remove(obj: GameObj<AreaComp>) {
        this.horizontal.remove(obj);
        this.vertical.remove(obj);
    }

    clear() {
        this.horizontal.clear();
        this.vertical.clear();
    }

    update() {
        this.horizontal.update();
        this.vertical.update();
    }

    *[Symbol.iterator]() {
        function hash(pair: GameObj<AreaComp>[]) {
            const [l, h] = pair[0].id! < pair[1].id! ? [pair[0].id!, pair[1].id!] : [pair[1].id! < pair[0].id!];
            return `${l}-${h}`;
        }
        const horizontalColliding = [...this.horizontal];
        const verticalColliding = [...this.vertical];
        const horizontalMap = new Map<string, GameObj<AreaComp>[]>(horizontalColliding.map(c => [hash(c), c]));
        const verticalMap = new Map<string, GameObj<AreaComp>[]>(verticalColliding.map(c => [hash(c), c]));
        const intersection = new Set(horizontalMap.keys()).intersection(new Set(verticalMap.keys()));

        for (let key in intersection) {
            yield horizontalMap.get(key);
        }
    }
}
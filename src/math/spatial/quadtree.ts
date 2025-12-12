import {
    type AreaComp,
    getLocalAreaVersion,
    getRenderAreaVersion,
} from "../../ecs/components/physics/area";
import { getTransformVersion } from "../../ecs/entity/GameObjRaw";
import { drawRect } from "../../gfx/draw/drawRect";
import type { GameObj } from "../../types";
import { Rect, vec2 } from "../math";
import type { Vec2 } from "../Vec2";
import type { BroadPhaseAlgorithm } from ".";

/**
 * A quadtree structure
 */
export class Quadtree implements BroadPhaseAlgorithm {
    bounds: Rect;
    maxObjects: number;
    maxLevels: number;
    level: number;
    nodes: Quadtree[];
    objects: GameObj<AreaComp>[];
    static versionsForObject: Map<GameObj<AreaComp>, [number, number, number]> =
        new Map<GameObj<AreaComp>, [number, number, number]>();

    /**
     * Creates a new quadtree
     * @param bounds - The bounds of this node.
     * @param maxObjects - The maximum amount of objects before triggering a split.
     * @param maxLevels - The maximum amount of levels before no more splits are made.
     * @param level - The current level.
     */
    constructor(
        bounds: Rect,
        maxObjects: number = 8,
        maxLevels: number = 4,
        level: number = 0,
    ) {
        this.bounds = bounds;
        this.maxObjects = maxObjects;
        this.maxLevels = maxLevels;
        this.level = level;
        this.nodes = []; // lt, rt, rb, lb
        this.objects = [];
    }

    /**
     * True if this node is a leaf node.
     */
    get isLeaf() {
        return this.nodes.length === 0;
    }

    /**
     * Splits the node, but doesn't redistribute objects
     */
    subdivide() {
        const level = this.level + 1;
        const width = this.bounds.width / 2;
        const height = this.bounds.height / 2;
        const x = this.bounds.pos.x;
        const y = this.bounds.pos.y;

        const pos = [
            vec2(x, y),
            vec2(x + width, y),
            vec2(x + width, y + height),
            vec2(x, y + height),
        ];

        for (let i = 0; i < 4; i++) {
            this.nodes[i] = new Quadtree(
                new Rect(pos[i], width, height),
                this.maxObjects,
                this.maxLevels,
                level,
            );
        }
    }

    /**
     * Tries to merge and collapse nodes which are no longer overpopulated.
     */
    merge() {
        if (this.nodes.length > 0) {
            let count = this.objects.length;
            let allLeaves = true;
            for (let i = 0; i < 4; i++) {
                this.nodes[i].merge();
                allLeaves &&= this.nodes[i].isLeaf;
                count += this.nodes[i].objects.length;
            }

            if (allLeaves && count <= this.maxObjects) {
                for (let i = 0; i < 4; i++) {
                    this.objects.push(...this.nodes[i].objects);
                }
                this.nodes = [];
            }
        }
    }

    /**
     * Returns the quadrant this rect fits in or -1 if it doesn't fit any quadrant
     * @param rect - The rect to test with.
     *
     * @returns The index of the quadrant fitting the rect completely, or -1 if none.
     */
    getQuadrant(rect: Rect) {
        const boundsCenterX = this.bounds.pos.x + (this.bounds.width / 2);
        const boundsCenterY = this.bounds.pos.y + (this.bounds.height / 2);
        // Left - If the right side is left of the center
        if (rect.pos.x + rect.width < boundsCenterX) {
            // Top Left - If the bottom side is above the center
            if (rect.pos.y + rect.height < boundsCenterY) {
                return 0;
            }
            // Bottom Left - If the top side is below the center
            else if (rect.pos.y >= boundsCenterY) {
                return 3;
            }
        }
        // Right - If the left side is right of the center
        else if (rect.pos.x >= boundsCenterX) {
            // Top Right - If the bottom side is above the center
            if (rect.pos.y + rect.height < boundsCenterY) {
                return 1;
            }
            // Bottom Right - If the top side is below the center
            else if (rect.pos.y >= boundsCenterY) {
                return 2;
            }
        }
        return -1;
    }

    /**
     * Returns the quadrants this rect intersects
     * @param rect - The rect to test with. Note that this rect is assumed to be within the node.
     *
     * @returns the list of quadrant indices
     */
    getQuadrants(rect: Rect): number[] {
        const boundsCenterX = this.bounds.pos.x + (this.bounds.width / 2);
        const boundsCenterY = this.bounds.pos.y + (this.bounds.height / 2);
        const quadrants: number[] = [];

        // Left - The left side is left of the center
        if (rect.pos.x < boundsCenterX) {
            // Top Left - If the top side is above the center
            if (rect.pos.y < boundsCenterY) {
                quadrants.push(0);
            }
            // Bottom Left - If the bottom side is below the center
            if (rect.pos.y + rect.height > boundsCenterY) {
                quadrants.push(3);
            }
        }
        // Right - If the right side is right of the center
        if (rect.pos.x + rect.width > boundsCenterX) {
            // Top Right - If the top side is above the center
            if (rect.pos.y < boundsCenterY) {
                quadrants.push(1);
            }
            // Bottom Right - If the bottom side is below the center
            if (rect.pos.y + rect.height > boundsCenterY) {
                quadrants.push(2);
            }
        }
        return quadrants;
    }

    /**
     * Inserts the object with the given rectangle
     * @param obj - The object to add
     * @param bbox - The bounding box of the object
     */
    insert(obj: GameObj<AreaComp>, bbox: Rect): void {
        // If we reached max objects, subdivide and redistribute
        if (this.objects.length >= this.maxObjects) {
            if (this.nodes.length === 0 && this.level < this.maxLevels) {
                this.subdivide();
                // Redistribute objects
                let j = 0;
                for (let i = 0; i < this.objects.length; i++) {
                    const obj = this.objects[i];
                    const bbox = obj.worldBbox();
                    const index = this.getQuadrant(bbox);
                    if (index !== -1) {
                        this.nodes[index].insert(obj, bbox);
                    }
                    else {
                        this.objects[j++] = obj;
                        Quadtree.versionsForObject.set(obj, [
                            getTransformVersion(obj),
                            getRenderAreaVersion(obj),
                            getLocalAreaVersion(obj),
                        ]);
                    }
                }
                this.objects.length = j;
            }
        }

        // Check if the object fits in a smaller quadrant
        if (this.nodes.length) {
            const index = this.getQuadrant(bbox);

            if (index !== -1) {
                this.nodes[index].insert(obj, bbox);
                return;
            }
        }

        this.objects.push(obj);
        Quadtree.versionsForObject.set(obj, [
            getTransformVersion(obj),
            getRenderAreaVersion(obj),
            getLocalAreaVersion(obj),
        ]);
    }

    /**
     * Add the object
     * @param obj - The object to add
     */
    add(obj: GameObj<AreaComp>) {
        const bbox = obj.worldBbox();
        this.insert(obj, bbox);
    }

    /**
     * Retrieves all objects potentially intersecting the rectangle
     * @param rect - The rect to test with
     *
     * @returns A set of objects potentially intersecting the rectangle
     */
    retrieve(rect: Rect, retrieveCb: (obj: GameObj<AreaComp>) => void): void {
        for (let i = 0; i < this.objects.length; i++) {
            retrieveCb(this.objects[i]);
        }

        if (this.nodes.length) {
            const indices = this.getQuadrants(rect);
            for (let i = 0; i < indices.length; i++) {
                this.nodes[indices[i]].retrieve(rect, retrieveCb);
            }
        }
    }

    /**
     * Removes the object
     * @param obj - The object to remove
     * @param fast - No node collapse if true
     */
    remove(obj: GameObj<AreaComp>, fast = false): boolean {
        let index = this.objects.indexOf(obj);
        if (index != -1) {
            this.objects.splice(index, 1);
            Quadtree.versionsForObject.delete(obj);
            if (!fast) {
                this.merge();
            }
            return true;
        }

        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].remove(obj, fast)) {
                if (!fast) {
                    this.merge();
                }
                return true;
            }
        }

        return false;
    }

    /**
     * Updates a single object
     * Note that no testing is done here. Make sure the object needs to be actually updated.
     * @param root - The tree root, since insertion happens from the root
     * @param obj - The object to update
     * @param bbox - The new bounding box
     */
    updateObject(root: Quadtree, obj: GameObj<AreaComp>, bbox: Rect): void {
        this.remove(obj);
        root.insert(obj, bbox);
    }

    /**
     * True if the rectangle is completely outside this node's bounds
     * @param bbox - The bounding box to test
     */
    isOutside(bbox: Rect) {
        return bbox.pos.x + bbox.width < this.bounds.pos.x
            || bbox.pos.y + bbox.height < this.bounds.pos.y
            || bbox.pos.x > this.bounds.pos.x + this.bounds.width
            || bbox.pos.y > this.bounds.pos.y + this.bounds.height;
    }

    /**
     * True if the rectangle is completely outside this node's bounds
     * @param bbox - The bounding box to test
     */
    isInside(bbox: Rect) {
        return bbox.pos.x >= this.bounds.pos.x
            && bbox.pos.y >= this.bounds.pos.y
            && bbox.pos.x + bbox.width <= this.bounds.pos.x + this.bounds.width
            && bbox.pos.y + bbox.height
                <= this.bounds.pos.y + this.bounds.height;
    }

    /**
     * Updates all objects in this node and the objects of its children
     * @param root - The tree root, since insertion happens from the root
     */
    updateNode(orphans: [GameObj<AreaComp>, Rect][]) {
        let i = 0;
        while (i < this.objects.length) {
            const obj = this.objects[i];
            // Check if this world area changed since last frame
            const versions = Quadtree.versionsForObject.get(obj);
            if (
                versions![0] === getTransformVersion(obj)
                && versions![1] === getRenderAreaVersion(obj)
                && versions![2] === getLocalAreaVersion(obj)
            ) {
                i++;
                continue;
            }
            versions![0] = getTransformVersion(obj);
            versions![1] = getRenderAreaVersion(obj);
            versions![2] = getLocalAreaVersion(obj);

            const bbox = obj.worldBbox();
            // If the object is outside the bounds, remove it and add it to the root later
            if (!this.isInside(bbox)) {
                orphans.push([obj, bbox]);
                this.objects.splice(i, 1);
                continue; // Don't increase i, the object at i was removed
            }
            else if (this.nodes.length > 0) {
                // If the object fits in a quadrant, remove it and add it to the quadrant
                const index = this.getQuadrant(bbox);
                if (index !== -1) {
                    // Use fast without merge, since it may remove the quadrant we are going to add it to
                    this.nodes[index].insert(obj, bbox);
                    this.objects.splice(i, 1);
                    continue; // Don't increase i, the object at i was removed
                }
            }
            i++;
        }
        // Update sub quadrants
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].updateNode(orphans);
        }
    }

    /**
     * Update this tree
     */
    update() {
        const orphans: [GameObj<AreaComp>, Rect][] = [];
        this.updateNode(orphans);
        // Reinsert all objects that were removed because they went outside the bounds of their quadrant
        for (let i = 0; i < orphans.length; i++) {
            this.insert(orphans[i][0], orphans[i][1]);
        }
    }

    /**
     * Clears this node and collapses it
     */
    clear() {
        this.objects.length = 0;

        // Do we need this? It only makes sense if someone is still holding a reference to a node
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].clear();
        }

        this.nodes = [];
    }

    /**
     * Gathers all collision pairs in this node and child nodes
     * @param ancestorObjects - Objects in one of the node's ancestors
     * @param pairs - The pairs being gathered
     */
    gatherPairs(
        ancestorObjects: Array<GameObj<AreaComp>>,
        pairCb: (obj1: GameObj<AreaComp>, obj2: GameObj<AreaComp>) => void,
    ) {
        // The objects in this node potentially collide with each other
        for (let i = 0; i < this.objects.length; i++) {
            // Note that we don't create doubles, since j = i + 1
            for (let j = i + 1; j < this.objects.length; j++) {
                pairCb(this.objects[i], this.objects[j]);
            }
        }

        // The objects in this node potentially collide with ancestor objects
        for (let i = 0; i < this.objects.length; i++) {
            // Note that we don't create doubles, since the lists are disjoint
            for (let j = 0; j < ancestorObjects.length; j++) {
                pairCb(this.objects[i], ancestorObjects[j]);
            }
        }

        // Check child nodes if any
        if (this.nodes.length) {
            // Add the local objects to the ancestors
            ancestorObjects = ancestorObjects.concat(this.objects);
            for (let i = 0; i < this.nodes.length; i++) {
                this.nodes[i].gatherPairs(ancestorObjects, pairCb);
            }
        }
    }

    iterPairs(
        pairCb: (obj1: GameObj<AreaComp>, obj2: GameObj<AreaComp>) => void,
    ): void {
        this.gatherPairs([], pairCb);
    }
}

export class ResizingQuadtree implements BroadPhaseAlgorithm {
    root: Quadtree;
    constructor(
        bounds: Rect,
        maxObjects: number = 8,
        maxLevels: number = 4,
    ) {
        this.root = new Quadtree(bounds, maxObjects, maxLevels, 0);
    }

    add(obj: GameObj<AreaComp>): void {
        const increaseLevel = (node: Quadtree) => {
            node.level++;
            for (const n of node.nodes) {
                increaseLevel(n);
            }
        };
        const bbox = obj.worldBbox();
        const isLeft = bbox.pos.x < this.root.bounds.pos.x;
        // Note: Even though an object can be so large that it extends to the right as well, we prioritize left
        const isRight = !isLeft
            && bbox.pos.x + bbox.width
                > this.root.bounds.pos.x + this.root.bounds.width;
        const isCenter = !(isLeft || isRight);
        const isTop = bbox.pos.y < this.root.bounds.pos.y;
        // Note: Even though an object can be so large that it extends to the bottom as well, we prioritize top
        const isBottom = !isTop
            && bbox.pos.y + bbox.height
                > this.root.bounds.pos.y + this.root.bounds.height;
        const isMiddle = !(isTop || isBottom);
        if (isTop && (isLeft || isCenter)) {
            /**
             * X X O => N N
             * O O O    N O
             * O O O
             */
            // New bounds
            const bounds = new Rect(
                this.root.bounds.pos.sub(
                    this.root.bounds.width,
                    this.root.bounds.height,
                ),
                this.root.bounds.width * 2,
                this.root.bounds.height * 2,
            );
            // Create new root
            const node = new Quadtree(
                bounds,
                this.root.maxObjects,
                this.root.maxLevels,
                0,
            );
            // Subdivide top level
            node.subdivide();
            // Replace bottom right node with old root
            increaseLevel(this.root);
            node.nodes[2] = this.root;
            // Replace root with new node
            this.root = node;

            // Retry
            return this.add(obj);
        }
        else if (isLeft && (isMiddle || isBottom)) {
            /**
             * O O O => N O
             * X O O    N N
             * X O O
             */
            // New bounds
            const bounds = new Rect(
                this.root.bounds.pos.sub(this.root.bounds.width, 0),
                this.root.bounds.width * 2,
                this.root.bounds.height * 2,
            );
            // Create new root
            const node = new Quadtree(
                bounds,
                this.root.maxObjects,
                this.root.maxLevels,
                0,
            );
            // Subdivide top level
            node.subdivide();
            // Replace top right node with old root
            increaseLevel(this.root);
            node.nodes[1] = this.root;
            // Replace root with new node
            this.root = node;

            // Retry
            return this.add(obj);
        }
        else if (isRight && (isTop || isMiddle)) {
            /**
             * O O X => N N
             * O O X    O N
             * O O O
             */
            // New bounds
            const bounds = new Rect(
                this.root.bounds.pos.sub(0, this.root.bounds.height),
                this.root.bounds.width * 2,
                this.root.bounds.height * 2,
            );
            // Create new root
            const node = new Quadtree(
                bounds,
                this.root.maxObjects,
                this.root.maxLevels,
                0,
            );
            // Subdivide top level
            node.subdivide();
            // Replace bottom left node with old root
            increaseLevel(this.root);
            node.nodes[3] = this.root;
            // Replace root with new node
            this.root = node;

            // Retry
            return this.add(obj);
        }
        else if (isBottom && (isCenter || isRight)) {
            /**
             * O O O => O N
             * O O O    N N
             * O X X
             */
            // New bounds
            const bounds = new Rect(
                this.root.bounds.pos,
                this.root.bounds.width * 2,
                this.root.bounds.height * 2,
            );
            // Create new root
            const node = new Quadtree(
                bounds,
                this.root.maxObjects,
                this.root.maxLevels,
                0,
            );
            // Subdivide top level
            node.subdivide();
            // Replace bottom left node with old root
            increaseLevel(this.root);
            node.nodes[0] = this.root;
            // Replace root with new node
            this.root = node;

            // Retry
            return this.add(obj);
        }
        else {
            this.root.insert(obj, bbox);
        }
    }

    remove(obj: GameObj<AreaComp>): void {
        this.root.remove(obj);
        // TODO: If it can shrink, shrink. Not the best idea though, as this can oscillate
    }

    clear(): void {
        this.root.clear();
    }

    update(): void {
        const orphans: [GameObj<AreaComp>, Rect][] = [];
        this.root.updateNode(orphans);
        // Reinsert all objects that were removed because they went outside the bounds of their quadrant
        for (let i = 0; i < orphans.length; i++) {
            this.add(orphans[i][0]);
        }
    }

    iterPairs(
        pairCb: (obj1: GameObj<AreaComp>, obj2: GameObj<AreaComp>) => void,
    ): void {
        this.root.iterPairs(pairCb);
    }

    get bounds() {
        return this.root.bounds;
    }

    get nodes() {
        return this.root.nodes;
    }

    retrieve(rect: Rect, retrieveCb: (obj: GameObj<AreaComp>) => void) {
        return this.root.retrieve(rect, retrieveCb);
    }
}

export function makeQuadtree(
    pos: Vec2,
    width: number,
    height: number,
    maxObjects: number = 8,
    maxLevels: number = 4,
    resizing: boolean = false,
) {
    if (resizing) {
        return new ResizingQuadtree(
            new Rect(pos, width, height),
            maxObjects,
            maxLevels,
        );
    }
    else {
        return new Quadtree(
            new Rect(pos, width, height),
            maxObjects,
            maxLevels,
            0,
        );
    }
}

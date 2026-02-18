import type { KEventController } from "../../../events/events";
import {
    raycastGrid,
    type RaycastResult,
    vec2,
    type Vec2Args,
} from "../../../math/math";
import { calcTransform } from "../../../math/various";
import { type Vec2 } from "../../../math/Vec2";
import {
    type Comp,
    type CompList,
    EdgeMask,
    type GameObj,
} from "../../../types";
import { BinaryHeap } from "../../../utils/binaryheap";
import { deserializeComp } from "../../entity/prefab";
import { pos, type PosComp } from "../transform/pos";
import { tile } from "./tile";

/**
 * The {@link level `level()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface LevelComp extends Comp {
    tileWidth(): number;
    tileHeight(): number;
    numRows(): number;
    numColumns(): number;
    /**
     * Spawn a tile from a symbol defined previously.
     */
    spawn(sym: string, p: Vec2): GameObj | null;
    spawn(sym: string, x: number, y: number): GameObj | null;
    /**
     * Spawn a tile from a component list.
     *
     * @returns The spawned game object, or null if the obj hasn't components.
     */
    spawn<T>(obj: CompList<T>, p: Vec2): GameObj<T> | null;
    spawn<T>(sym: CompList<T>, x: number, y: number): GameObj<T> | null;
    /**
     * Total width of level in pixels.
     */
    levelWidth(): number;
    /**
     * Total height of level in pixels.
     */
    levelHeight(): number;
    /**
     * Get all game objects that's currently inside a given tile.
     */
    getAt(tilePos: Vec2): GameObj[];
    /**
     * Raycast all game objects on the given path.
     */
    raycast(origin: Vec2, direction: Vec2): RaycastResult;
    /**
     * Convert tile position to pixel position.
     */
    tile2Pos(tilePos: Vec2): Vec2;
    tile2Pos(x: number, y: number): Vec2;
    /**
     * Convert pixel position to tile position.
     */
    pos2Tile(pos: Vec2): Vec2;
    pos2Tile(x: number, y: number): Vec2;
    /**
     * Find the path to navigate from one tile to another tile.
     *
     * @returns A list of traverse points in tile positions.
     */
    getTilePath(from: Vec2, to: Vec2, opts?: PathFindOpt): Vec2[] | null;
    /**
     * Find the path to navigate from one tile to another tile.
     *
     * @returns A list of traverse points in pixel positions.
     */
    getPath(from: Vec2, to: Vec2, opts?: PathFindOpt): Vec2[] | null;
    getSpatialMap(): GameObj[][];
    removeFromSpatialMap(obj: GameObj): void;
    insertIntoSpatialMap(obj: GameObj): void;
    onSpatialMapChanged(cb: () => void): KEventController;
    onNavigationMapInvalid(cb: () => void): KEventController;
    invalidateNavigationMap(): void;
    onNavigationMapChanged(cb: () => void): KEventController;

    serialize(): any;
}

/**
 * Options for the {@link level `level()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface LevelCompOpt {
    /**
     * Width of each block.
     */
    tileWidth: number;
    /**
     * Height of each block.
     */
    tileHeight: number;
    /**
     * Definition of each tile.
     */
    tiles: {
        [sym: string]: (pos: Vec2) => CompList<Comp>;
    };
    /**
     * Called when encountered a symbol not defined in "tiles".
     */
    wildcardTile?: (
        sym: string,
        pos: Vec2,
    ) => CompList<Comp> | null | undefined;
}

/**
 * @group Components
 * @subgroup Component Types
 */
export type PathFindOpt = {
    allowDiagonals?: boolean;
};

export function level(map: string[], opt: LevelCompOpt): LevelComp {
    const numRows = map.length;
    let numColumns = 0;

    // The spatial map keeps track of the objects at each location
    let spatialMap: GameObj[][] | null = null;
    let costMap: number[] | null = null;
    let edgeMap: number[] | null = null;
    let connectivityMap: number[] | null = null;

    const tile2Hash = (tilePos: Vec2) => tilePos.x + tilePos.y * numColumns;
    const hash2Tile = (hash: number) =>
        vec2(Math.floor(hash % numColumns), Math.floor(hash / numColumns));

    const createSpatialMap = (level: GameObj<LevelComp>) => {
        spatialMap = [];
        for (const child of level.children) {
            insertIntoSpatialMap(child);
        }
    };

    const insertIntoSpatialMap = (obj: GameObj) => {
        const i = tile2Hash(obj.tilePos);
        if (spatialMap![i]) {
            spatialMap![i].push(obj);
        }
        else {
            spatialMap![i] = [obj];
        }
    };

    const removeFromSpatialMap = (obj: GameObj) => {
        const i = tile2Hash(obj.tilePos);
        if (spatialMap![i]) {
            const index = spatialMap![i].indexOf(obj);
            if (index >= 0) {
                spatialMap![i].splice(index, 1);
            }
        }
    };

    const updateSpatialMap = (level: GameObj<LevelComp>) => {
        let spatialMapChanged = false;
        for (const child of level.children) {
            const tilePos = level.pos2Tile(child.pos);
            if (child.tilePos.x != tilePos.x || child.tilePos.y != tilePos.y) {
                spatialMapChanged = true;
                removeFromSpatialMap(child);
                child.tilePos.x = tilePos.x;
                child.tilePos.y = tilePos.y;
                insertIntoSpatialMap(child);
            }
        }
        if (spatialMapChanged) {
            level.trigger("spatialMapChanged");
        }
    };

    // The obstacle map tells which tiles are accessible
    // Cost: accessible with cost
    // Infinite: inaccessible
    const createCostMap = (level: GameObj<LevelComp>) => {
        const spatialMap = level.getSpatialMap();
        const size = level.numRows() * level.numColumns();
        if (!costMap) {
            costMap = new Array<number>(size);
        }
        else {
            costMap.length = size;
        }
        costMap.fill(1, 0, size);
        for (let i = 0; i < spatialMap.length; i++) {
            const objects = spatialMap[i];
            if (objects) {
                let cost = 0;
                for (const obj of objects) {
                    if (obj.isObstacle) {
                        cost = Infinity;
                        break;
                    }
                    else {
                        cost += obj.cost;
                    }
                }
                costMap[i] = cost || 1;
            }
        }
    };

    // The edge map tells which edges between nodes are walkable
    const createEdgeMap = (level: GameObj<LevelComp>) => {
        const spatialMap = level.getSpatialMap();
        const size = level.numRows() * level.numColumns();
        if (!edgeMap) {
            edgeMap = new Array<number>(size);
        }
        else {
            edgeMap.length = size;
        }
        edgeMap.fill(EdgeMask.All, 0, size);
        for (let i = 0; i < spatialMap.length; i++) {
            const objects = spatialMap[i];
            if (objects) {
                const len = objects.length;
                let mask = EdgeMask.All;
                for (let j = 0; j < len; j++) {
                    mask |= objects[j].edgeMask;
                }
                edgeMap[i] = mask;
            }
        }
    };

    // The connectivity map is used to see whether two locations are connected
    // -1: inaccesible n: connectivity group
    const createConnectivityMap = (level: GameObj<LevelComp>) => {
        const size = level.numRows() * level.numColumns();
        const traverse = (i: number, index: number) => {
            const frontier: number[] = [];
            frontier.push(i);
            while (frontier.length > 0) {
                // TODO: Remove non-null assertion
                const i = frontier.pop()!;

                getNeighbours(i).forEach((i) => {
                    if (connectivityMap![i] < 0) {
                        connectivityMap![i] = index;
                        frontier.push(i);
                    }
                });
            }
        };
        if (!connectivityMap) {
            connectivityMap = new Array<number>(size);
        }
        else {
            connectivityMap.length = size;
        }
        connectivityMap.fill(-1, 0, size);
        let index = 0;
        for (let i = 0; i < costMap!.length; i++) {
            if (connectivityMap[i] >= 0) {
                index++;
                continue;
            }
            traverse(i, index);
            index++;
        }
    };

    const getCost = (node: number, neighbour: number) => {
        // Cost of destination tile
        return costMap![neighbour];
    };

    const getHeuristic = (node: number, goal: number) => {
        // Euclidian distance to target
        const p1 = hash2Tile(node);
        const p2 = hash2Tile(goal);
        return p1.dist(p2);
    };

    const getNeighbours = (node: number, diagonals?: boolean) => {
        const n = [];
        const x = Math.floor(node % numColumns);
        const left = x > 0
            && edgeMap![node] & EdgeMask.Left
            && costMap![node - 1] !== Infinity;
        const top = node >= numColumns
            && edgeMap![node] & EdgeMask.Top
            && costMap![node - numColumns] !== Infinity;
        const right = x < numColumns - 1
            && edgeMap![node] & EdgeMask.Right
            && costMap![node + 1] !== Infinity;
        const bottom = node < numColumns * numRows - numColumns - 1
            && edgeMap![node] & EdgeMask.Bottom
            && costMap![node + numColumns] !== Infinity;
        if (diagonals) {
            if (left) {
                if (top) n.push(node - numColumns - 1);
                n.push(node - 1);
                if (bottom) n.push(node + numColumns - 1);
            }
            if (top) {
                n.push(node - numColumns);
            }
            if (right) {
                if (top) n.push(node - numColumns + 1);
                n.push(node + 1);
                if (bottom) n.push(node + numColumns + 1);
            }
            if (bottom) {
                n.push(node + numColumns);
            }
        }
        else {
            if (left) {
                n.push(node - 1);
            }
            if (top) {
                n.push(node - numColumns);
            }
            if (right) {
                n.push(node + 1);
            }
            if (bottom) {
                n.push(node + numColumns);
            }
        }
        return n;
    };

    return {
        id: "level",

        add(this: GameObj<LevelComp>) {
            map.forEach((row, i) => {
                const keys = row.split("");
                numColumns = Math.max(keys.length, numColumns);
                keys.forEach((key, j) => {
                    this.spawn(key, vec2(j, i));
                });
            });
        },

        tileWidth() {
            return opt.tileWidth;
        },

        tileHeight() {
            return opt.tileHeight;
        },

        spawn(
            this: GameObj<LevelComp>,
            key: string | CompList<any>,
            ...args: Vec2Args
        ) {
            const p = vec2(...args);

            const comps = (() => {
                if (typeof key === "string") {
                    if (opt.tiles[key]) {
                        if (typeof opt.tiles[key] !== "function") {
                            throw new Error(
                                "Level symbol def must be a function returning a component list",
                            );
                        }
                        return opt.tiles[key](p);
                    }
                    else if (opt.wildcardTile) {
                        return opt.wildcardTile(key, p);
                    }
                }
                else if (Array.isArray(key)) {
                    return key;
                }
                else {
                    throw new Error("Expected a symbol or a component list");
                }
            })();

            // empty tile
            if (!comps) {
                return null;
            }

            let hasPos = false;
            let hasTile = false;

            for (const comp of comps) {
                if (comp.id === "tile") hasTile = true;
                if (comp.id === "pos") hasPos = true;
            }

            if (!hasPos) comps.push(pos(this.tile2Pos(p)));
            if (!hasTile) comps.push(tile());

            const obj = this.add(comps);

            if (hasPos) {
                obj.tilePosOffset = obj.pos.clone();
            }

            obj.tilePos = p;
            // Stale, so recalculate
            calcTransform(obj, obj.transform);

            if (spatialMap) {
                insertIntoSpatialMap(obj);
                this.trigger("spatialMapChanged");
                this.trigger("navigationMapInvalid");
            }

            return obj;
        },

        numColumns() {
            return numColumns;
        },

        numRows() {
            return numRows;
        },

        levelWidth() {
            return numColumns * this.tileWidth();
        },

        levelHeight() {
            return numRows * this.tileHeight();
        },

        tile2Pos(...args: Vec2Args) {
            return vec2(...args).scale(this.tileWidth(), this.tileHeight());
        },

        pos2Tile(...args: Vec2Args) {
            const p = vec2(...args);
            return vec2(
                Math.floor(p.x / this.tileWidth()),
                Math.floor(p.y / this.tileHeight()),
            );
        },

        getSpatialMap(this: GameObj<LevelComp>) {
            if (!spatialMap) {
                createSpatialMap(this);
            }
            return spatialMap!;
        },

        removeFromSpatialMap,

        insertIntoSpatialMap,

        onSpatialMapChanged(this: GameObj<LevelComp>, cb: () => void) {
            return this.on("spatialMapChanged", cb);
        },

        onNavigationMapInvalid(this: GameObj<LevelComp>, cb: () => void) {
            return this.on("navigationMapInvalid", cb);
        },

        getAt(this: GameObj<LevelComp>, tilePos: Vec2) {
            if (!spatialMap) {
                createSpatialMap(this);
            }
            const hash = tile2Hash(tilePos);
            return spatialMap![hash] || [];
        },

        raycast(
            this: GameObj<LevelComp | PosComp>,
            origin: Vec2,
            direction: Vec2,
        ) {
            const worldOrigin = this.toWorld(origin);
            const worldDirection = this.toWorld(origin.add(direction)).sub(
                worldOrigin,
            );
            const invTileWidth = 1 / this.tileWidth();
            const levelOrigin = origin.scale(invTileWidth);
            const hit = raycastGrid(
                levelOrigin,
                direction,
                (tilePos: Vec2) => {
                    const tiles = this.getAt(tilePos);
                    if (tiles.some((t) => t.isObstacle)) {
                        return true;
                    }
                    let minHit: RaycastResult = null;
                    for (const tile of tiles) {
                        if (tile.has("area")) {
                            const shape = tile.worldArea();
                            const hit = shape.raycast(
                                worldOrigin,
                                worldDirection,
                            ) as RaycastResult;
                            if (hit) {
                                if (minHit) {
                                    if (hit.fraction < minHit.fraction) {
                                        minHit = hit;
                                        minHit.object = tile;
                                    }
                                }
                                else {
                                    minHit = hit;
                                    minHit.object = tile;
                                }
                            }
                        }
                    }
                    if (minHit) {
                        minHit.point = this.fromWorld(minHit.point).scale(
                            invTileWidth,
                        );
                    }
                    return minHit || false;
                },
                64,
            );
            if (hit) {
                hit.point = hit.point.scale(this.tileWidth());
            }
            return hit;
        },

        update(this: GameObj<LevelComp>) {
            if (spatialMap) {
                updateSpatialMap(this);
            }
        },

        invalidateNavigationMap() {
            costMap = null;
            edgeMap = null;
            connectivityMap = null;
        },

        onNavigationMapChanged(this: GameObj<LevelComp>, cb: () => void) {
            return this.on("navigationMapChanged", cb);
        },

        getTilePath(
            this: GameObj<LevelComp>,
            from: Vec2,
            to: Vec2,
            opts: PathFindOpt = {},
        ) {
            if (!costMap) {
                createCostMap(this);
            }
            if (!edgeMap) {
                createEdgeMap(this);
            }
            if (!connectivityMap) {
                createConnectivityMap(this);
            }

            // Tiles are outside the grid
            if (
                from.x < 0
                || from.x >= numColumns
                || from.y < 0
                || from.y >= numRows
            ) {
                return null;
            }
            if (to.x < 0 || to.x >= numColumns || to.y < 0 || to.y >= numRows) {
                return null;
            }

            const start = tile2Hash(from);
            const goal = tile2Hash(to);

            // Tiles are not accessible
            // If we test the start tile, we may get stuck
            /*if (costMap[start] === Infinity) {
            return null
        }*/
            if (costMap![goal] === Infinity) {
                return null;
            }

            // Same Tile, no waypoints needed
            if (start === goal) {
                return [];
            }

            // Tiles are not within the same section
            // If we test the start tile when invalid, we may get stuck
            // TODO: Remove non-null assertion
            if (
                connectivityMap![start] != -1
                && connectivityMap![start] !== connectivityMap![goal]
            ) {
                return null;
            }

            // Find a path
            interface CostNode {
                cost: number;
                node: number;
            }
            const frontier = new BinaryHeap<CostNode>((a, b) =>
                a.cost < b.cost
            );
            frontier.insert({ cost: 0, node: start });

            const cameFrom = new Map<number, number>();
            cameFrom.set(start, start);
            const costSoFar = new Map<number, number>();
            costSoFar.set(start, 0);

            while (frontier.length !== 0) {
                // TODO: Remove non-null assertion
                const current = frontier.remove()?.node!;

                if (current === goal) {
                    break;
                }

                const neighbours = getNeighbours(current, opts.allowDiagonals);
                for (const next of neighbours) {
                    const newCost = (costSoFar.get(current) || 0)
                        + getCost(current, next)
                        + getHeuristic(next, goal);
                    if (
                        !costSoFar.has(next)
                        // TODO: Remove non-null assertion
                        || newCost < costSoFar.get(next)!
                    ) {
                        costSoFar.set(next, newCost);
                        frontier.insert({ cost: newCost, node: next });
                        cameFrom.set(next, current);
                    }
                }
            }

            const path = [];
            let node = goal;
            const p = hash2Tile(node);
            path.push(p);

            while (node !== start) {
                let cameNode = cameFrom.get(node);

                if (cameNode === undefined) {
                    throw new Error("Bug in pathfinding algorithm");
                }

                node = cameNode;

                const p = hash2Tile(node);
                path.push(p);
            }

            return path.reverse();
        },

        getPath(
            this: GameObj<LevelComp>,
            from: Vec2,
            to: Vec2,
            opts: PathFindOpt = {},
        ) {
            const tw = this.tileWidth();
            const th = this.tileHeight();
            const path = this.getTilePath(
                this.pos2Tile(from),
                this.pos2Tile(to),
                opts,
            );
            if (path) {
                return [
                    from,
                    ...path
                        .slice(1, -1)
                        .map((tilePos) =>
                            tilePos.scale(tw, th).add(tw / 2, th / 2)
                        ),
                    to,
                ];
            }
            else {
                return null;
            }
        },

        serialize(): any {
            const data: any = {};
            data.tileWidth = opt.tileWidth;
            data.tileHeight = opt.tileHeight;
            data.tiles = {}; // { symbol: prefab };
            // tiles maps symbols to functions returning a list of components
            // To serialize this, we get the list of components for each symbol, and serialize them
            for (const key of Object.keys(opt.tiles)) {
                const compsAndTags = opt.tiles[key](vec2());
                const comps: any = {};
                const tags = [];
                for (const compOrTag of compsAndTags) {
                    if (typeof compOrTag === "string") {
                        tags.push(compOrTag);
                    }
                    else {
                        if ("id" in compOrTag && "serialize" in compOrTag) {
                            comps[compOrTag.id!] =
                                (compOrTag.serialize as () => any)();
                        }
                    }
                }
                if (tags.length) comps.tags = tags;
                data.tiles[key] = comps;
            }
            // No idea how to handle this yet
            data.wildcardTile = {}; // prefab
            return data;
        },
    };
}

export function levelFactory(data: any) {
    const opt: any = { tileWidth: data.tileWidth, tileHeight: data.tileHeight };
    opt.tiles = {};
    for (const key in Object.keys(data.tiles)) {
        const d = data.tiles[key];
        const tags = d.tags;
        opt.tiles[key] = (pos: Vec2) => {
            const comps: Comp[] = Object.keys(d).filter(k => k != "tags").map(
                id => deserializeComp(id, d[id]),
            );
            return [...comps, ...tags];
        };
    }
    return level([], opt);
}

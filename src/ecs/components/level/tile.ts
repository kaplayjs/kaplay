import { vec2 } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import { type Comp, type Edge, EdgeMask, type GameObj } from "../../../types";
import type { LevelComp } from "./level";

/**
 * The {@link tile `tile()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface TileComp extends Comp {
    /**
     * The tile position inside the level.
     */
    tilePos: Vec2;
    /**
     * If the tile is an obstacle in pathfinding.
     */
    isObstacle: boolean;
    /**
     * How much a tile is cost to traverse in pathfinding (default 0).
     */
    cost: number;
    /**
     * If the tile has hard edges that cannot pass in pathfinding.
     */
    edges: Edge[];
    /**
     * Position offset when setting `tilePos`.
     */
    tilePosOffset: Vec2;
    readonly edgeMask: EdgeMask;
    getLevel(): GameObj<LevelComp>;
    tileMove(dir: Vec2): void;
    moveLeft(): void;
    moveRight(): void;
    moveUp(): void;
    moveDown(): void;
}

/**
 * Options for the {@link tile `tile()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export type TileCompOpt = {
    /**
     * If the tile is an obstacle in pathfinding.
     */
    isObstacle?: boolean;
    /**
     * How much a tile is cost to traverse in pathfinding (default 0).
     */
    cost?: number;
    /**
     * If the tile has hard edges that cannot pass in pathfinding.
     */
    edges?: Edge[];
    /**
     * Position offset when setting `tilePos`.
     */
    offset?: Vec2;
};

export function tile(opts: TileCompOpt = {}): TileComp {
    let tilePos = vec2(0);
    let isObstacle = opts.isObstacle ?? false;
    let cost = opts.cost ?? 0;
    let edges = opts.edges ?? [];

    const getEdgeMask = () => {
        const loopup = {
            "left": EdgeMask.Left,
            "top": EdgeMask.Top,
            "right": EdgeMask.Right,
            "bottom": EdgeMask.Bottom,
        };
        return edges.map(s => loopup[s] || 0).reduce(
            (mask, dir) => mask | dir,
            0,
        );
    };

    let edgeMask = getEdgeMask();

    return {
        id: "tile",
        tilePosOffset: opts.offset ?? vec2(0),

        set tilePos(p: Vec2) {
            const level = this.getLevel();
            tilePos = p.clone();
            // @ts-ignore
            this.pos = vec2(
                this.tilePos.x * level.tileWidth(),
                this.tilePos.y * level.tileHeight(),
            ).add(this.tilePosOffset);
        },

        get tilePos() {
            return tilePos;
        },

        set isObstacle(is: boolean) {
            if (isObstacle === is) return;
            isObstacle = is;
            this.getLevel().invalidateNavigationMap();
        },

        get isObstacle() {
            return isObstacle;
        },

        set cost(n: number) {
            if (cost === n) return;
            cost = n;
            this.getLevel().invalidateNavigationMap();
        },

        get cost() {
            return cost;
        },

        set edges(e: Edge[]) {
            edges = e;
            edgeMask = getEdgeMask();
            this.getLevel().invalidateNavigationMap();
        },

        get edges() {
            return edges;
        },

        get edgeMask() {
            return edgeMask;
        },

        getLevel(this: GameObj) {
            return this.parent as GameObj<LevelComp>;
        },

        tileMove(dir: Vec2) {
            const level = this.getLevel();
            level.removeFromSpatialMap(this as unknown as GameObj<TileComp>);
            this.tilePos = this.tilePos.add(dir);
            level.insertIntoSpatialMap(this as unknown as GameObj<TileComp>);
            level.trigger("spatialMapChanged");
        },

        moveLeft() {
            this.tileMove(vec2(-1, 0));
        },

        moveRight() {
            this.tileMove(vec2(1, 0));
        },

        moveUp() {
            this.tileMove(vec2(0, -1));
        },

        moveDown() {
            this.tileMove(vec2(0, 1));
        },
    };
}

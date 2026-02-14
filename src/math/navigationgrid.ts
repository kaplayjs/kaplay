import { vec2 } from "./math";
import { aStarSearch, buildConnectivityMap, type Graph } from "./navigation";
import { Vec2 } from "./Vec2";

/**
 * A navigation grid is a graph consisting of connected grid cells
 */
export class NavGrid implements Graph {
    private _columns: number;
    private _rows: number;
    private _tileWidth: number;
    private _tileHeight: number;
    private _diagonals: boolean;
    private _connMap: number[];
    private _isConnected: (a: number, b: number) => boolean;

    /**
     * @param data - Grid data
     * @param options - Navigation options
     */
    constructor(
        width: number,
        height: number,
        isConnected: (a: number, b: number) => boolean,
        { diagonals = false, tileWidth = 1, tileHeight = 1 } = {},
    ) {
        this._columns = width;
        this._rows = height;
        this._tileWidth = tileWidth;
        this._tileHeight = tileHeight;
        this._diagonals = diagonals;
        this._connMap = new Array(this._columns * this._rows).fill(-1);
        this._isConnected = isConnected;

        this._buildConnectivityMap();
    }

    private _buildConnectivityMap() {
        const map = buildConnectivityMap(this);
        map.forEach((index, node) => this._connMap[node] = index);
    }

    private _getTile(x: number, y: number): number {
        const column = Math.floor(x / this._tileWidth);
        const row = Math.floor(y / this._tileHeight);
        return row * this._columns + column;
    }

    private _getTileX(tile: number): number {
        return tile % this._columns;
    }

    private _getTileY(tile: number): number {
        return Math.floor(tile / this._columns);
    }

    get nodes(): number[] {
        return [...new Array(this._columns * this._rows).keys()];
    }

    getNeighbors(tile: number): number[] {
        const neighbors = [];
        const x = tile % this._columns;
        // x > 0
        if (x > 0) {
            neighbors.push(tile - 1);
            if (this._diagonals) {
                if (tile >= this._columns) {
                    neighbors.push(tile - this._columns - 1);
                }
                if (tile < (this._rows - 1) * this._columns) {
                    neighbors.push(tile + this._columns - 1);
                }
            }
        }
        // y > 0
        if (tile >= this._columns) {
            neighbors.push(tile - this._columns);
        }
        // y < height
        if (tile < (this._rows - 1) * this._columns) {
            neighbors.push(tile + this._columns);
        }
        // x < width
        if (x < this._columns - 1) {
            neighbors.push(tile + 1);
            if (this._diagonals) {
                if (tile >= this._columns) {
                    neighbors.push(tile - this._columns + 1);
                }
                if (tile < (this._rows - 1) * this._columns) {
                    neighbors.push(tile + this._columns + 1);
                }
            }
        }

        return neighbors.filter(other => this._isConnected(tile, other));
    }

    getCost(a: number, b: number) {
        // Manhattan distance
        const x = Math.abs(this._getTileX(a) - this._getTileX(b));
        const y = Math.abs(this._getTileY(a) - this._getTileY(b));
        return Math.max(x, y);
    }

    getHeuristic(a: number, b: number) {
        // Euclidean distance
        const x = this._getTileX(a) - this._getTileX(b);
        const y = this._getTileY(a) - this._getTileY(b);
        return Math.sqrt(x * x + y * y);
    }

    getPath(start: number, goal: number): number[] {
        // Tiles are not within the grid
        const maxNode = this._columns * this._rows;
        if (
            start === null || goal === null || start < 0 || start >= maxNode
            || goal < 0 || goal >= maxNode
        ) {
            return [];
        }

        // Tiles are not within the same section
        if (this._connMap[start] !== this._connMap[goal]) {
            return [];
        }

        // Same grid square
        if (start === goal) {
            return [start, goal];
        }

        return [start, ...aStarSearch(this, start, goal), goal];
    }

    getWaypointPath(
        start: Vec2,
        goal: Vec2,
    ): Vec2[] {
        const path = this.getPath(
            this._getTile(start.x, start.y),
            this._getTile(goal.x, goal.y),
        );

        if (!path) {
            return [];
        }

        // Center of tile
        const dx = Math.floor(this._tileWidth / 2);
        const dy = Math.floor(this._tileHeight / 2);
        return [
            start,
            ...path.slice(1, -1).map(tile => (vec2(
                this._getTileX(tile) * this._tileWidth + dx,
                this._getTileY(tile) * this._tileWidth + dy,
            ))),
            goal,
        ];
    }
}

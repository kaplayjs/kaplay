import { Vec2, vec2 } from "./math";
import { aStarSearch, type Graph } from "./navigation";

/**
 * A grid is a graph consisting of connected grid cells
 */
export class Grid implements Graph {
    private _columns: number;
    private _rows: number;
    private _tileWidth: number;
    private _tileHeight: number;
    // Initializer here?
    // TODO: Remove non-null assertion
    private _data!: string[];
    private _diagonals: boolean;
    private _connMap: number[];

    /**
     * @param data Grid data
     * @param options Navigation options
     */
    constructor(
        width: number,
        height: number,
        { diagonals = false, tileWidth = 1, tileHeight = 1 } = {},
    ) {
        this._columns = width;
        this._rows = height;
        this._tileWidth = tileWidth;
        this._tileHeight = tileHeight;
        this._diagonals = diagonals;
        this._connMap = new Array(this._columns * this._rows).fill(-1);

        this._buildConnectivityMap();
    }

    private _buildConnectivityMap() {
        function traverse(that: Grid, tile: number, index: number) {
            let frontier: number[] = [];
            frontier.push(tile);
            while (frontier.length > 0) {
                const tile = frontier.pop();
                // TODO: Remove non-null assertion
                that.getNeighbours(tile!).forEach(t => {
                    if (that._connMap[t] < 0) {
                        that._connMap[t] = index;
                        frontier.push(t);
                    }
                });
            }
        }
        let index = 0;
        for (let i = 0; i < this._rows; i++) {
            if (this._connMap[i] >= 0) {
                index++;
                continue;
            }
            traverse(this, i, index);
            index++;
        }
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

    getNeighbours(tile: number): number[] {
        const neighbours = [];
        // x > 0
        if (tile > 0) {
            neighbours.push(tile - 1);
            if (this._diagonals) {
                if (tile >= this._columns) {
                    neighbours.push(tile - this._columns - 1);
                }
                if (tile < (this._rows - 1) * this._columns) {
                    neighbours.push(tile + this._columns - 1);
                }
            }
        }
        // y > 0
        if (tile >= this._columns) {
            neighbours.push(tile - this._columns);
        }
        // y < height
        if (tile < (this._rows - 1) * this._columns) {
            neighbours.push(tile + this._columns);
        }
        // x < width
        if (tile % this._columns < this._columns - 1) {
            neighbours.push(tile + 1);
            if (this._diagonals) {
                if (tile >= this._columns) {
                    neighbours.push(tile - this._columns + 1);
                }
                if (tile < (this._rows - 1) * this._columns) {
                    neighbours.push(tile + this._columns + 1);
                }
            }
        }

        // TODO: Remove @ts-ignore
        // @ts-ignore neighbours look like as a number[]?
        return neighbours.filter(({ x, y }) => this._data[y][x] != "x");
    }

    getCost(a: number, b: number) {
        const x = (a % this._tileWidth) - (b % this._tileWidth);
        const y = Math.floor(a / this._tileWidth)
            - Math.floor(b / this._tileWidth);
        return Math.max(x, y);
    }

    getHeuristic(a: number, b: number) {
        const x = (a % this._tileWidth) - (b % this._tileWidth);
        const y = Math.floor(a / this._tileWidth)
            - Math.floor(b / this._tileWidth);
        return Math.sqrt(x * x + y * y);
    }

    getPath(start: number, goal: number): number[] {
        // Tiles are not within the grid
        if (start == null || goal == null) {
            return [];
        }

        // Tiles are not within the same section
        if (this._connMap[start] != this._connMap[goal]) {
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

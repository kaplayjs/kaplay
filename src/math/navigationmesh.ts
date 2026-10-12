import { vec2 } from "./math";
import { aStarSearch, type Graph } from "./navigation";
import { Vec2 } from "./Vec2";

class NavEdge {
    a: Vec2;
    b: Vec2;
    polygon: WeakRef<NavPolygon>;

    constructor(a: Vec2, b: Vec2, polygon: NavPolygon) {
        this.a = a;
        this.b = b;
        this.polygon = new WeakRef(polygon);
    }

    isLeft(x: number, y: number) {
        return ((this.b.x - this.a.x) * (y - this.a.y)
            - (x - this.a.x) * (this.b.y - this.a.y));
    }

    get middle() {
        return this.a.add(this.b).scale(0.5);
    }
}

class NavPolygon {
    // I don't know if set a default affects how the code is did
    // TODO: Remove non-null assertion
    private _edges!: NavEdge[];
    private _centroid!: Vec2;
    private _id: number;

    constructor(id: number) {
        this._id = id;
    }

    get id() {
        return this._id;
    }

    set edges(edges: NavEdge[]) {
        this._edges = edges;
        let centerX = 0;
        let centerY = 0;
        let area = 0;
        for (let edge of this._edges) {
            edge.polygon = new WeakRef(this);
            const cross = edge.a.x * edge.b.y - edge.a.y * edge.b.x;
            centerX += (edge.a.x + edge.b.x) * cross;
            centerY += (edge.a.y + edge.b.y) * cross;
            area += cross;
        }
        area /= 2;
        this._centroid = vec2(centerX / (6 * area), centerY / (6 * area));
    }

    get edges(): NavEdge[] {
        return this._edges;
    }

    get centroid(): Vec2 {
        return this._centroid;
    }

    // https://web.archive.org/web/20130126163405/http://geomalgorithms.com/a03-_inclusion.html
    /*contains(x: number, y: number) {
        let wn = 0;

        for (let edge of this._edges) {
            if (edge.a.y <= y) {
                if (edge.b.y > y) {
                    if (edge.isLeft(x, y) > 0) {
                        ++wn;
                    }
                }
            } else {
                if (edge.b.y <= y) {
                    if (edge.isLeft(x, y) < 0) {
                        --wn;
                    }
                }
            }
        }
        return wn;
    }*/

    contains(p: Vec2) {
        let c = false;

        for (const e of this.edges) {
            if (
                ((e.b.y > p.y) != (e.a.y > p.y))
                && (p.x
                    < (e.a.x - e.b.x) * (p.y - e.b.y) / (e.a.y - e.b.y) + e.b.x)
            ) {
                c = !c;
            }
        }

        return c;
    }
}

export class NavMesh implements Graph {
    private _polygons: NavPolygon[];
    private _pointCache: { [key: string]: Vec2 };
    private _edgeCache: { [key: string]: NavEdge };

    constructor() {
        this._polygons = [];
        this._pointCache = {};
        this._edgeCache = {};
    }

    private _addPoint(p: Vec2) {
        let point = this._pointCache[`${p.x}_${p.y}`];
        if (point) {
            return point;
        }
        point = p.clone();
        this._pointCache[`${p.x}_${p.y}`] = point;
        return point;
    }

    private _addEdge(edge: NavEdge): NavEdge {
        const key = `${edge.a.x}_${edge.a.y}-${edge.b.x}_${edge.b.y}`;
        this._edgeCache[key] = edge;
        return edge;
    }

    private _findEdge(a: Vec2, b: Vec2) {
        const key = `${a.x}_${a.y}-${b.x}_${b.y}`;
        return this._edgeCache[key];
    }

    private _findCommonEdge(a: NavPolygon, b: NavPolygon): NavEdge | null {
        for (const edge of a.edges) {
            const e = this._findEdge(edge.b, edge.a);
            // TODO: Remove non-null assertion
            if (e && e.polygon.deref()!.id === b.id) {
                return e;
            }
        }
        return null;
    }
    get nodes(): number[] {
        return [...this._polygons.keys()];
    }

    addPolygon(vertices: Vec2[]) {
        const polygon = new NavPolygon(this._polygons.length);
        const edges = vertices.map((v, index) =>
            new NavEdge(v, vertices[(index + 1) % vertices.length], polygon)
        );
        polygon.edges = edges;
        this._polygons.push(polygon);
        for (const edge of polygon.edges) {
            this._addEdge(edge);
        }
        return polygon;
    }

    addRect(pos: Vec2, size: Vec2) {
        const a = this._addPoint(pos);
        const b = this._addPoint(pos.add(size.x, 0));
        const c = this._addPoint(pos.add(size));
        const d = this._addPoint(pos.add(0, size.y));
        return this.addPolygon([a, b, c, d]);
    }

    private _getLocation(p: Vec2): NavPolygon | null {
        for (let polygon of this._polygons) {
            if (polygon.contains(p)) {
                return polygon;
            }
        }
        return null;
    }

    getNeighbors(index: number): number[] {
        const neighbours = [];
        for (let edge of this._polygons[index].edges) {
            // Lookup polygons with reverse edge
            const pairEdge = this._findEdge(edge.b, edge.a);
            if (pairEdge) {
                const pairPolygon = pairEdge.polygon.deref();
                if (pairPolygon) {
                    neighbours.push(pairPolygon.id);
                }
            }
        }
        return neighbours;
    }

    getCost(a: number, b: number) {
        return 1;
    }

    getHeuristic(indexA: number, indexB: number) {
        const a = this._polygons[indexA];
        const b = this._polygons[indexB];
        const x = a.centroid.x - b.centroid.x;
        const y = a.centroid.y - b.centroid.y;
        return Math.sqrt(x * x + y * y);
    }

    getPath(start: number, goal: number): number[] {
        // Points are not within the navigation mesh
        if (start === undefined || goal === undefined) {
            return [];
        }

        // Same polygon
        if (start === goal) {
            return [start, goal];
        }

        return aStarSearch(this, start, goal);
    }

    getWaypointPath(start: Vec2, goal: Vec2, opt: any): Vec2[] {
        const type = opt?.type || "centroids";

        const startPolygon = this._getLocation(start);
        const goalPolygon = this._getLocation(goal);

        // Points are not within the navigation mesh
        if (startPolygon === undefined || goalPolygon === undefined) {
            return [];
        }

        // TODO: Remove non-null assertion
        const path = this.getPath(startPolygon!.id, goalPolygon!.id);

        // No path was found
        if (!path) {
            return [];
        }

        if (type === "edges") {
            const edges = [];
            for (let i = 1; i < path.length; i++) {
                const p1 = this._polygons[path[i - 1]];
                const p2 = this._polygons[path[i]];
                const edge = this._findCommonEdge(p1, p2);
                // TODO: Remove non-null assertion
                edges.push(
                    edge!.middle.add(
                        p2.centroid.sub(edge!.middle).unit().scale(4),
                    ),
                );
            }
            return [start, ...edges, goal];
        }
        else { // type === "centroids"
            return [
                start,
                ...path.slice(1, -1).map(index =>
                    this._polygons[index].centroid
                ),
                goal,
            ];
        }
    }
}

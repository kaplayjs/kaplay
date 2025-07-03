"use strict";
var __spreadArray = (this && this.__spreadArray) || function(to, from, pack) {
    if (pack || arguments.length === 2) {
        for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) {
                    ar = Array.prototype.slice.call(from, 0, i);
                }
                ar[i] = from[i];
            }
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavMesh = void 0;
var math_1 = require("./math");
var navigation_1 = require("./navigation");
var NavEdge = /** @class */ function() {
    function NavEdge(a, b, polygon) {
        this.a = a;
        this.b = b;
        this.polygon = new WeakRef(polygon);
    }
    NavEdge.prototype.isLeft = function(x, y) {
        return ((this.b.x - this.a.x) * (y - this.a.y)
            - (x - this.a.x) * (this.b.y - this.a.y));
    };
    Object.defineProperty(NavEdge.prototype, "middle", {
        get: function() {
            return this.a.add(this.b).scale(0.5);
        },
        enumerable: false,
        configurable: true,
    });
    return NavEdge;
}();
var NavPolygon = /** @class */ function() {
    function NavPolygon(id) {
        this._id = id;
    }
    Object.defineProperty(NavPolygon.prototype, "id", {
        get: function() {
            return this._id;
        },
        enumerable: false,
        configurable: true,
    });
    Object.defineProperty(NavPolygon.prototype, "edges", {
        get: function() {
            return this._edges;
        },
        set: function(edges) {
            this._edges = edges;
            var centerX = 0;
            var centerY = 0;
            var area = 0;
            for (var _i = 0, _a = this._edges; _i < _a.length; _i++) {
                var edge = _a[_i];
                edge.polygon = new WeakRef(this);
                var cross = edge.a.x * edge.b.y - edge.a.y * edge.b.x;
                centerX += (edge.a.x + edge.b.x) * cross;
                centerY += (edge.a.y + edge.b.y) * cross;
                area += cross;
            }
            area /= 2;
            this._centroid = (0, math_1.vec2)(
                centerX / (6 * area),
                centerY / (6 * area),
            );
        },
        enumerable: false,
        configurable: true,
    });
    Object.defineProperty(NavPolygon.prototype, "centroid", {
        get: function() {
            return this._centroid;
        },
        enumerable: false,
        configurable: true,
    });
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
    NavPolygon.prototype.contains = function(p) {
        var c = false;
        for (var _i = 0, _a = this.edges; _i < _a.length; _i++) {
            var e = _a[_i];
            if (
                ((e.b.y > p.y) != (e.a.y > p.y))
                && (p.x
                    < (e.a.x - e.b.x) * (p.y - e.b.y) / (e.a.y - e.b.y) + e.b.x)
            ) {
                c = !c;
            }
        }
        return c;
    };
    return NavPolygon;
}();
var NavMesh = /** @class */ function() {
    function NavMesh() {
        this._polygons = [];
        this._pointCache = {};
        this._edgeCache = {};
    }
    NavMesh.prototype._addPoint = function(p) {
        var point = this._pointCache["".concat(p.x, "_").concat(p.y)];
        if (point) {
            return point;
        }
        point = p.clone();
        this._pointCache["".concat(p.x, "_").concat(p.y)] = point;
        return point;
    };
    NavMesh.prototype._addEdge = function(edge) {
        var key = "".concat(edge.a.x, "_").concat(edge.a.y, "-").concat(
            edge.b.x,
            "_",
        ).concat(edge.b.y);
        this._edgeCache[key] = edge;
        return edge;
    };
    NavMesh.prototype._findEdge = function(a, b) {
        var key = "".concat(a.x, "_").concat(a.y, "-").concat(b.x, "_").concat(
            b.y,
        );
        return this._edgeCache[key];
    };
    NavMesh.prototype._findCommonEdge = function(a, b) {
        for (var _i = 0, _a = a.edges; _i < _a.length; _i++) {
            var edge = _a[_i];
            var e = this._findEdge(edge.b, edge.a);
            // TODO: Remove non-null assertion
            if (e && e.polygon.deref().id === b.id) {
                return e;
            }
        }
        return null;
    };
    NavMesh.prototype.addPolygon = function(vertices) {
        var polygon = new NavPolygon(this._polygons.length);
        var edges = vertices.map(function(v, index) {
            return new NavEdge(
                v,
                vertices[(index + 1) % vertices.length],
                polygon,
            );
        });
        polygon.edges = edges;
        this._polygons.push(polygon);
        for (var _i = 0, _a = polygon.edges; _i < _a.length; _i++) {
            var edge = _a[_i];
            this._addEdge(edge);
        }
        return polygon;
    };
    NavMesh.prototype.addRect = function(pos, size) {
        var a = this._addPoint(pos);
        var b = this._addPoint(pos.add(size.x, 0));
        var c = this._addPoint(pos.add(size));
        var d = this._addPoint(pos.add(0, size.y));
        return this.addPolygon([a, b, c, d]);
    };
    NavMesh.prototype._getLocation = function(p) {
        for (var _i = 0, _a = this._polygons; _i < _a.length; _i++) {
            var polygon = _a[_i];
            if (polygon.contains(p)) {
                return polygon;
            }
        }
        return null;
    };
    NavMesh.prototype.getNeighbours = function(index) {
        var neighbours = [];
        for (
            var _i = 0, _a = this._polygons[index].edges;
            _i < _a.length;
            _i++
        ) {
            var edge = _a[_i];
            // Lookup polygons with reverse edge
            var pairEdge = this._findEdge(edge.b, edge.a);
            if (pairEdge) {
                var pairPolygon = pairEdge.polygon.deref();
                if (pairPolygon) {
                    neighbours.push(pairPolygon.id);
                }
            }
        }
        return neighbours;
    };
    NavMesh.prototype.getCost = function(a, b) {
        return 1;
    };
    NavMesh.prototype.getHeuristic = function(indexA, indexB) {
        var a = this._polygons[indexA];
        var b = this._polygons[indexB];
        var x = a.centroid.x - b.centroid.x;
        var y = a.centroid.y - b.centroid.y;
        return Math.sqrt(x * x + y * y);
    };
    NavMesh.prototype.getPath = function(start, goal) {
        // Points are not within the navigation mesh
        if (start === undefined || goal === undefined) {
            return [];
        }
        // Same polygon
        if (start === goal) {
            return [start, goal];
        }
        return (0, navigation_1.aStarSearch)(this, start, goal);
    };
    NavMesh.prototype.getWaypointPath = function(start, goal, opt) {
        var _this = this;
        var type = (opt === null || opt === void 0 ? void 0 : opt.type)
            || "centroids";
        var startPolygon = this._getLocation(start);
        var goalPolygon = this._getLocation(goal);
        // Points are not within the navigation mesh
        if (startPolygon === undefined || goalPolygon === undefined) {
            return [];
        }
        // TODO: Remove non-null assertion
        var path = this.getPath(startPolygon.id, goalPolygon.id);
        // No path was found
        if (!path) {
            return [];
        }
        if (type === "edges") {
            var edges = [];
            for (var i = 1; i < path.length; i++) {
                var p1 = this._polygons[path[i - 1]];
                var p2 = this._polygons[path[i]];
                var edge = this._findCommonEdge(p1, p2);
                // TODO: Remove non-null assertion
                edges.push(
                    edge.middle.add(
                        p2.centroid.sub(edge.middle).unit().scale(4),
                    ),
                );
            }
            return __spreadArray(
                __spreadArray([start], edges, true),
                [goal],
                false,
            );
        }
        else { // type === "centroids"
            return __spreadArray(
                __spreadArray(
                    [
                        start,
                    ],
                    path.slice(1, -1).map(function(index) {
                        return _this._polygons[index].centroid;
                    }),
                    true,
                ),
                [
                    goal,
                ],
                false,
            );
        }
    };
    return NavMesh;
}();
exports.NavMesh = NavMesh;

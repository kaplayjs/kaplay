"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.level = level;
var math_1 = require("../../../math/math");
var various_1 = require("../../../math/various");
var types_1 = require("../../../types");
var binaryheap_1 = require("../../../utils/binaryheap");
var pos_1 = require("../transform/pos");
var tile_1 = require("./tile");
function level(map, opt) {
    var numRows = map.length;
    var numColumns = 0;
    // The spatial map keeps track of the objects at each location
    var spatialMap = null;
    var costMap = null;
    var edgeMap = null;
    var connectivityMap = null;
    var tile2Hash = function (tilePos) { return tilePos.x + tilePos.y * numColumns; };
    var hash2Tile = function (hash) {
        return (0, math_1.vec2)(Math.floor(hash % numColumns), Math.floor(hash / numColumns));
    };
    var createSpatialMap = function (level) {
        spatialMap = [];
        for (var _i = 0, _a = level.children; _i < _a.length; _i++) {
            var child = _a[_i];
            insertIntoSpatialMap(child);
        }
    };
    var insertIntoSpatialMap = function (obj) {
        var i = tile2Hash(obj.tilePos);
        if (spatialMap[i]) {
            spatialMap[i].push(obj);
        }
        else {
            spatialMap[i] = [obj];
        }
    };
    var removeFromSpatialMap = function (obj) {
        var i = tile2Hash(obj.tilePos);
        if (spatialMap[i]) {
            var index = spatialMap[i].indexOf(obj);
            if (index >= 0) {
                spatialMap[i].splice(index, 1);
            }
        }
    };
    var updateSpatialMap = function (level) {
        var spatialMapChanged = false;
        for (var _i = 0, _a = level.children; _i < _a.length; _i++) {
            var child = _a[_i];
            var tilePos = level.pos2Tile(child.pos);
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
    var createCostMap = function (level) {
        var spatialMap = level.getSpatialMap();
        var size = level.numRows() * level.numColumns();
        if (!costMap) {
            costMap = new Array(size);
        }
        else {
            costMap.length = size;
        }
        costMap.fill(1, 0, size);
        for (var i = 0; i < spatialMap.length; i++) {
            var objects = spatialMap[i];
            if (objects) {
                var cost = 0;
                for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
                    var obj = objects_1[_i];
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
    var createEdgeMap = function (level) {
        var spatialMap = level.getSpatialMap();
        var size = level.numRows() * level.numColumns();
        if (!edgeMap) {
            edgeMap = new Array(size);
        }
        else {
            edgeMap.length = size;
        }
        edgeMap.fill(types_1.EdgeMask.All, 0, size);
        for (var i = 0; i < spatialMap.length; i++) {
            var objects = spatialMap[i];
            if (objects) {
                var len = objects.length;
                var mask = types_1.EdgeMask.All;
                for (var j = 0; j < len; j++) {
                    mask |= objects[j].edgeMask;
                }
                edgeMap[i] = mask;
            }
        }
    };
    // The connectivity map is used to see whether two locations are connected
    // -1: inaccesible n: connectivity group
    var createConnectivityMap = function (level) {
        var size = level.numRows() * level.numColumns();
        var traverse = function (i, index) {
            var frontier = [];
            frontier.push(i);
            while (frontier.length > 0) {
                // TODO: Remove non-null assertion
                var i_1 = frontier.pop();
                getNeighbours(i_1).forEach(function (i) {
                    if (connectivityMap[i] < 0) {
                        connectivityMap[i] = index;
                        frontier.push(i);
                    }
                });
            }
        };
        if (!connectivityMap) {
            connectivityMap = new Array(size);
        }
        else {
            connectivityMap.length = size;
        }
        connectivityMap.fill(-1, 0, size);
        var index = 0;
        for (var i = 0; i < costMap.length; i++) {
            if (connectivityMap[i] >= 0) {
                index++;
                continue;
            }
            traverse(i, index);
            index++;
        }
    };
    var getCost = function (node, neighbour) {
        // Cost of destination tile
        return costMap[neighbour];
    };
    var getHeuristic = function (node, goal) {
        // Euclidian distance to target
        var p1 = hash2Tile(node);
        var p2 = hash2Tile(goal);
        return p1.dist(p2);
    };
    var getNeighbours = function (node, diagonals) {
        var n = [];
        var x = Math.floor(node % numColumns);
        var left = x > 0
            && edgeMap[node] & types_1.EdgeMask.Left
            && costMap[node - 1] !== Infinity;
        var top = node >= numColumns
            && edgeMap[node] & types_1.EdgeMask.Top
            && costMap[node - numColumns] !== Infinity;
        var right = x < numColumns - 1
            && edgeMap[node] & types_1.EdgeMask.Right
            && costMap[node + 1] !== Infinity;
        var bottom = node < numColumns * numRows - numColumns - 1
            && edgeMap[node] & types_1.EdgeMask.Bottom
            && costMap[node + numColumns] !== Infinity;
        if (diagonals) {
            if (left) {
                if (top)
                    n.push(node - numColumns - 1);
                n.push(node - 1);
                if (bottom)
                    n.push(node + numColumns - 1);
            }
            if (top) {
                n.push(node - numColumns);
            }
            if (right) {
                if (top)
                    n.push(node - numColumns + 1);
                n.push(node + 1);
                if (bottom)
                    n.push(node + numColumns + 1);
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
        add: function () {
            var _this = this;
            map.forEach(function (row, i) {
                var keys = row.split("");
                numColumns = Math.max(keys.length, numColumns);
                keys.forEach(function (key, j) {
                    _this.spawn(key, (0, math_1.vec2)(j, i));
                });
            });
        },
        tileWidth: function () {
            return opt.tileWidth;
        },
        tileHeight: function () {
            return opt.tileHeight;
        },
        spawn: function (key) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var p = math_1.vec2.apply(void 0, args);
            var comps = (function () {
                if (typeof key === "string") {
                    if (opt.tiles[key]) {
                        if (typeof opt.tiles[key] !== "function") {
                            throw new Error("Level symbol def must be a function returning a component list");
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
            var hasPos = false;
            var hasTile = false;
            for (var _a = 0, comps_1 = comps; _a < comps_1.length; _a++) {
                var comp = comps_1[_a];
                if (comp.id === "tile")
                    hasTile = true;
                if (comp.id === "pos")
                    hasPos = true;
            }
            if (!hasPos)
                comps.push((0, pos_1.pos)(this.tile2Pos(p)));
            if (!hasTile)
                comps.push((0, tile_1.tile)());
            var obj = this.add(comps);
            if (hasPos) {
                obj.tilePosOffset = obj.pos.clone();
            }
            obj.tilePos = p;
            // Stale, so recalculate
            (0, various_1.calcTransform)(obj, obj.transform);
            if (spatialMap) {
                insertIntoSpatialMap(obj);
                this.trigger("spatialMapChanged");
                this.trigger("navigationMapInvalid");
            }
            return obj;
        },
        numColumns: function () {
            return numColumns;
        },
        numRows: function () {
            return numRows;
        },
        levelWidth: function () {
            return numColumns * this.tileWidth();
        },
        levelHeight: function () {
            return numRows * this.tileHeight();
        },
        tile2Pos: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return math_1.vec2.apply(void 0, args).scale(this.tileWidth(), this.tileHeight());
        },
        pos2Tile: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var p = math_1.vec2.apply(void 0, args);
            return (0, math_1.vec2)(Math.floor(p.x / this.tileWidth()), Math.floor(p.y / this.tileHeight()));
        },
        getSpatialMap: function () {
            if (!spatialMap) {
                createSpatialMap(this);
            }
            return spatialMap;
        },
        removeFromSpatialMap: removeFromSpatialMap,
        insertIntoSpatialMap: insertIntoSpatialMap,
        onSpatialMapChanged: function (cb) {
            return this.on("spatialMapChanged", cb);
        },
        onNavigationMapInvalid: function (cb) {
            return this.on("navigationMapInvalid", cb);
        },
        getAt: function (tilePos) {
            if (!spatialMap) {
                createSpatialMap(this);
            }
            var hash = tile2Hash(tilePos);
            return spatialMap[hash] || [];
        },
        raycast: function (origin, direction) {
            var _this = this;
            var worldOrigin = this.toWorld(origin);
            var worldDirection = this.toWorld(origin.add(direction)).sub(worldOrigin);
            var invTileWidth = 1 / this.tileWidth();
            var levelOrigin = origin.scale(invTileWidth);
            var hit = (0, math_1.raycastGrid)(levelOrigin, direction, function (tilePos) {
                var tiles = _this.getAt(tilePos);
                if (tiles.some(function (t) { return t.isObstacle; })) {
                    return true;
                }
                var minHit = null;
                for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
                    var tile_2 = tiles_1[_i];
                    if (tile_2.has("area")) {
                        var shape = tile_2.worldArea();
                        var hit_1 = shape.raycast(worldOrigin, worldDirection);
                        if (hit_1) {
                            if (minHit) {
                                if (hit_1.fraction < minHit.fraction) {
                                    minHit = hit_1;
                                    minHit.object = tile_2;
                                }
                            }
                            else {
                                minHit = hit_1;
                                minHit.object = tile_2;
                            }
                        }
                    }
                }
                if (minHit) {
                    minHit.point = _this.fromWorld(minHit.point).scale(invTileWidth);
                }
                return minHit || false;
            }, 64);
            if (hit) {
                hit.point = hit.point.scale(this.tileWidth());
            }
            return hit;
        },
        update: function () {
            if (spatialMap) {
                updateSpatialMap(this);
            }
        },
        invalidateNavigationMap: function () {
            costMap = null;
            edgeMap = null;
            connectivityMap = null;
        },
        onNavigationMapChanged: function (cb) {
            return this.on("navigationMapChanged", cb);
        },
        getTilePath: function (from, to, opts) {
            var _a;
            if (opts === void 0) { opts = {}; }
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
            if (from.x < 0
                || from.x >= numColumns
                || from.y < 0
                || from.y >= numRows) {
                return null;
            }
            if (to.x < 0 || to.x >= numColumns || to.y < 0 || to.y >= numRows) {
                return null;
            }
            var start = tile2Hash(from);
            var goal = tile2Hash(to);
            // Tiles are not accessible
            // If we test the start tile, we may get stuck
            /*if (costMap[start] === Infinity) {
            return null
        }*/
            if (costMap[goal] === Infinity) {
                return null;
            }
            // Same Tile, no waypoints needed
            if (start === goal) {
                return [];
            }
            // Tiles are not within the same section
            // If we test the start tile when invalid, we may get stuck
            // TODO: Remove non-null assertion
            if (connectivityMap[start] != -1
                && connectivityMap[start] !== connectivityMap[goal]) {
                return null;
            }
            var frontier = new binaryheap_1.BinaryHeap(function (a, b) {
                return a.cost < b.cost;
            });
            frontier.insert({ cost: 0, node: start });
            var cameFrom = new Map();
            cameFrom.set(start, start);
            var costSoFar = new Map();
            costSoFar.set(start, 0);
            while (frontier.length !== 0) {
                // TODO: Remove non-null assertion
                var current = (_a = frontier.remove()) === null || _a === void 0 ? void 0 : _a.node;
                if (current === goal) {
                    break;
                }
                var neighbours = getNeighbours(current, opts.allowDiagonals);
                for (var _i = 0, neighbours_1 = neighbours; _i < neighbours_1.length; _i++) {
                    var next = neighbours_1[_i];
                    var newCost = (costSoFar.get(current) || 0)
                        + getCost(current, next)
                        + getHeuristic(next, goal);
                    if (!costSoFar.has(next)
                        // TODO: Remove non-null assertion
                        || newCost < costSoFar.get(next)) {
                        costSoFar.set(next, newCost);
                        frontier.insert({ cost: newCost, node: next });
                        cameFrom.set(next, current);
                    }
                }
            }
            var path = [];
            var node = goal;
            var p = hash2Tile(node);
            path.push(p);
            while (node !== start) {
                var cameNode = cameFrom.get(node);
                if (cameNode === undefined) {
                    throw new Error("Bug in pathfinding algorithm");
                }
                node = cameNode;
                var p_1 = hash2Tile(node);
                path.push(p_1);
            }
            return path.reverse();
        },
        getPath: function (from, to, opts) {
            if (opts === void 0) { opts = {}; }
            var tw = this.tileWidth();
            var th = this.tileHeight();
            var path = this.getTilePath(this.pos2Tile(from), this.pos2Tile(to), opts);
            if (path) {
                return __spreadArray(__spreadArray([
                    from
                ], path
                    .slice(1, -1)
                    .map(function (tilePos) {
                    return tilePos.scale(tw, th).add(tw / 2, th / 2);
                }), true), [
                    to,
                ], false);
            }
            else {
                return null;
            }
        },
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tile = tile;
var math_1 = require("../../../math/math");
var types_1 = require("../../../types");
function tile(opts) {
    var _a, _b, _c, _d;
    if (opts === void 0) opts = {};
    var tilePos = (0, math_1.vec2)(0);
    var isObstacle = (_a = opts.isObstacle) !== null && _a !== void 0
        ? _a
        : false;
    var cost = (_b = opts.cost) !== null && _b !== void 0 ? _b : 0;
    var edges = (_c = opts.edges) !== null && _c !== void 0 ? _c : [];
    var getEdgeMask = function() {
        var loopup = {
            "left": types_1.EdgeMask.Left,
            "top": types_1.EdgeMask.Top,
            "right": types_1.EdgeMask.Right,
            "bottom": types_1.EdgeMask.Bottom,
        };
        return edges.map(function(s) {
            return loopup[s] || 0;
        }).reduce(function(mask, dir) {
            return mask | dir;
        }, 0);
    };
    var edgeMask = getEdgeMask();
    return {
        id: "tile",
        tilePosOffset: (_d = opts.offset) !== null && _d !== void 0
            ? _d
            : (0, math_1.vec2)(0),
        set tilePos(p) {
            var level = this.getLevel();
            tilePos = p.clone();
            // @ts-ignore
            this.pos = (0, math_1.vec2)(
                this.tilePos.x * level.tileWidth(),
                this.tilePos.y * level.tileHeight(),
            ).add(this.tilePosOffset);
        },
        get tilePos() {
            return tilePos;
        },
        set isObstacle(is) {
            if (isObstacle === is) {
                return;
            }
            isObstacle = is;
            this.getLevel().invalidateNavigationMap();
        },
        get isObstacle() {
            return isObstacle;
        },
        set cost(n) {
            if (cost === n) {
                return;
            }
            cost = n;
            this.getLevel().invalidateNavigationMap();
        },
        get cost() {
            return cost;
        },
        set edges(e) {
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
        getLevel: function() {
            return this.parent;
        },
        tileMove: function(dir) {
            var level = this.getLevel();
            level.removeFromSpatialMap(this);
            this.tilePos = this.tilePos.add(dir);
            level.insertIntoSpatialMap(this);
            level.trigger("spatialMapChanged");
        },
        moveLeft: function() {
            this.tileMove((0, math_1.vec2)(-1, 0));
        },
        moveRight: function() {
            this.tileMove((0, math_1.vec2)(1, 0));
        },
        moveUp: function() {
            this.tileMove((0, math_1.vec2)(0, -1));
        },
        moveDown: function() {
            this.tileMove((0, math_1.vec2)(0, 1));
        },
    };
}

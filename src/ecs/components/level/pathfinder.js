"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathfinderMap = pathfinderMap;
exports.pathfinder = pathfinder;
function pathfinderMap(opts) {
    var graph = opts.graph;
    return {
        id: "pathfinderMap",
        get graph() {
            return graph;
        },
        set graph(value) {
            graph = value;
        },
        navigate: function (origin, target, navigationOpt) {
            if (navigationOpt === void 0) { navigationOpt = {}; }
            return graph === null || graph === void 0 ? void 0 : graph.getWaypointPath(origin, target, navigationOpt);
        },
    };
}
function pathfinder(opts) {
    var graph = opts.graph;
    return {
        id: "pathfinder",
        require: ["pos"],
        navigateTo: function (target) {
            var graph = this.graph;
            return graph === null || graph === void 0 ? void 0 : graph.getWaypointPath(this.pos, target, opts.navigationOpt);
        },
        get graph() {
            if (graph) {
                return graph;
            }
            var parent = this.parent;
            while (parent) {
                if (parent.has("pathfinderMap")) {
                    return parent.graph;
                }
                parent = parent.parent;
            }
            return undefined;
        },
        set graph(value) {
            graph = value;
        },
    };
}

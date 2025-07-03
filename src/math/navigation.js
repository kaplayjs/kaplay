"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.breadthFirstSearch = breadthFirstSearch;
exports.dijkstraSearch = dijkstraSearch;
exports.aStarSearch = aStarSearch;
var binaryheap_1 = require("../utils/binaryheap");
function buildPath(start, goal, cameFrom) {
    var path = [];
    var node = goal;
    path.push(node);
    while (node !== start) {
        // TODO: Remove non-null assertion
        node = cameFrom.get(node);
        if (node == undefined)
            return null;
        path.push(node);
    }
    return path.reverse();
}
function breadthFirstSearch(graph, start, goal) {
    var frontier = [];
    frontier.push(start);
    var cameFrom = new Map();
    cameFrom.set(start, start);
    while (frontier.length !== 0) {
        var current = frontier.pop();
        if (current === goal) {
            break;
        }
        // TODO: Remove non-null assertion
        var neighbours = graph.getNeighbours(current);
        for (var _i = 0, neighbours_1 = neighbours; _i < neighbours_1.length; _i++) {
            var next = neighbours_1[_i];
            if (!cameFrom.get(next)) {
                frontier.push(next);
                // TODO: Remove non-null assertion
                cameFrom.set(next, current);
            }
        }
    }
    return buildPath(start, goal, cameFrom);
}
function dijkstraSearch(graph, start, goal) {
    var _a;
    var frontier = new binaryheap_1.BinaryHeap();
    frontier.insert({ cost: 0, node: start });
    var cameFrom = new Map();
    cameFrom.set(start, start);
    var costSoFar = new Map();
    costSoFar.set(start, 0);
    while (frontier.length !== 0) {
        var current = (_a = frontier.remove()) === null || _a === void 0 ? void 0 : _a.node;
        if (current === goal) {
            break;
        }
        // TODO: Remove non-null assertion
        var neighbours = graph.getNeighbours(current);
        for (var _i = 0, neighbours_2 = neighbours; _i < neighbours_2.length; _i++) {
            var next = neighbours_2[_i];
            var newCost = (costSoFar.get(current) || 0)
                + graph.getCost(current, next);
            if (!costSoFar.has(next)
                || newCost < costSoFar.get(next)) {
                costSoFar.set(next, newCost);
                frontier.insert({ cost: newCost, node: next });
                cameFrom.set(next, current);
            }
        }
    }
    return buildPath(start, goal, cameFrom);
}
function aStarSearch(graph, start, goal) {
    var _a;
    var frontier = new binaryheap_1.BinaryHeap(function (a, b) { return a.cost < b.cost; });
    frontier.insert({ cost: 0, node: start });
    var cameFrom = new Map();
    cameFrom.set(start, start);
    var costSoFar = new Map();
    costSoFar.set(start, 0);
    while (frontier.length !== 0) {
        var current = (_a = frontier.remove()) === null || _a === void 0 ? void 0 : _a.node;
        if (current === goal) {
            break;
        }
        // TODO: Remove non-null assertion
        var neighbours = graph.getNeighbours(current);
        for (var _i = 0, neighbours_3 = neighbours; _i < neighbours_3.length; _i++) {
            var next = neighbours_3[_i];
            var newCost = (costSoFar.get(current) || 0)
                + graph.getCost(current, next)
                + graph.getHeuristic(next, goal);
            if (!costSoFar.has(next)
                || newCost < costSoFar.get(next)) {
                costSoFar.set(next, newCost);
                frontier.insert({ cost: newCost, node: next });
                cameFrom.set(next, current);
            }
        }
    }
    // TODO: Remove non-null assertion
    return buildPath(start, goal, cameFrom);
}

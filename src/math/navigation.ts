import { BinaryHeap } from "../utils";
import { Vec2 } from "./math";

export interface Graph {
    /* Returns the reachable neighbours of this location */
    getNeighbours(node: number): number[];
    /* Returns the cost to go from the node to its neighbor */
    getCost(node: number, neighbor: number): number;
    /* Returns the cost to go from the node to the goal */
    getHeuristic(node: number, goal: number): number;
    /* Returns the path as locations */
    getPath(from: number, to: number): number[];
    /* Returns the path as waypoints */
    getWaypointPath(
        from: Vec2,
        to: Vec2,
        opt: any,
    ): Vec2[];
}

function buildPath(start: number, goal: number, cameFrom: Map<number, number>) {
    const path = [];
    let node = goal;
    path.push(node);
    while (node !== start) {
        // TODO: Remove non-null assertion
        node = cameFrom.get(node)!;
        if (node == undefined) return null;
        path.push(node);
    }
    return path.reverse();
}

export function breadthFirstSearch(
    graph: Graph,
    start: number,
    goal: number,
) {
    let frontier = [];
    frontier.push(start);

    let cameFrom = new Map<number, number>();
    cameFrom.set(start, start);

    while (frontier.length !== 0) {
        let current = frontier.pop();

        if (current === goal) {
            break;
        }

        // TODO: Remove non-null assertion
        const neighbours = graph.getNeighbours(current!);
        for (let next of neighbours) {
            if (!cameFrom.get(next)) {
                frontier.push(next);
                // TODO: Remove non-null assertion
                cameFrom.set(next, current!);
            }
        }
    }
    return buildPath(start, goal, cameFrom);
}

export function dijkstraSearch(
    graph: Graph,
    start: number,
    goal: number,
) {
    interface CostNode {
        cost: number;
        node: number;
    }
    const frontier = new BinaryHeap<CostNode>();
    frontier.insert({ cost: 0, node: start });

    const cameFrom = new Map<number, number>();
    cameFrom.set(start, start);
    const costSoFar = new Map<number, number>();
    costSoFar.set(start, 0);

    while (frontier.length !== 0) {
        const current = frontier.remove()?.node;

        if (current === goal) {
            break;
        }

        // TODO: Remove non-null assertion
        const neighbours = graph.getNeighbours(current!);
        for (let next of neighbours) {
            const newCost = (costSoFar.get(current!) || 0)
                + graph.getCost(current!, next);
            if (
                !costSoFar.has(next)
                || newCost < costSoFar.get(next)!
            ) {
                costSoFar.set(next, newCost);
                frontier.insert({ cost: newCost, node: next });
                cameFrom.set(next, current!);
            }
        }
    }

    return buildPath(start, goal, cameFrom);
}

export function aStarSearch(
    graph: Graph,
    start: number,
    goal: number,
): number[] {
    interface CostNode {
        cost: number;
        node: number;
    }
    const frontier = new BinaryHeap<CostNode>((a, b) => a.cost < b.cost);
    frontier.insert({ cost: 0, node: start });

    const cameFrom = new Map<number, number>();
    cameFrom.set(start, start);
    const costSoFar = new Map<number, number>();
    costSoFar.set(start, 0);

    while (frontier.length !== 0) {
        const current = frontier.remove()?.node;

        if (current === goal) {
            break;
        }

        // TODO: Remove non-null assertion
        const neighbours = graph.getNeighbours(current!);
        for (let next of neighbours) {
            const newCost = (costSoFar.get(current!) || 0)
                + graph.getCost(current!, next)
                + graph.getHeuristic(next, goal);
            if (
                !costSoFar.has(next)
                || newCost < costSoFar.get(next)!
            ) {
                costSoFar.set(next, newCost);
                frontier.insert({ cost: newCost, node: next });
                cameFrom.set(next, current!);
            }
        }
    }

    // TODO: Remove non-null assertion
    return buildPath(start, goal, cameFrom)!;
}

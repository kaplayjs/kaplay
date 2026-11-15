import { BinaryHeap } from "../utils/binaryheap";
import type { Graph } from "./navigation";

export type PathQueryStatus = "pending" | "found" | "unreachable" | "cancelled";

/** A route calculation that the caller can advance without completing it at once. */
export interface PathQuery<T> {
    readonly status: PathQueryStatus;
    readonly path: T[];
    readonly cost: number;
    readonly expanded: number;
    step(budget: number): PathQueryStatus;
    cancel(): void;
}

export function validatePathBudget(budget: number) {
    if (!Number.isSafeInteger(budget) || budget < 0) {
        throw new RangeError("Path budget must be a nonnegative safe integer");
    }
}

interface Candidate {
    node: number;
    cost: number;
    priority: number;
}

export class NodePathQuery implements PathQuery<number> {
    private frontier = new BinaryHeap<Candidate>((a, b) =>
        a.priority < b.priority
    );
    private costs = new Map<number, number>();
    private previous = new Map<number, number>();
    private next: Candidate | null = null;
    private result: number[] = [];
    private resultCost = Infinity;
    private state: PathQueryStatus = "pending";
    private expansions = 0;
    private stepping = false;

    constructor(
        private graph: Graph,
        private start: number,
        private goal: number,
        valid = true,
    ) {
        if (!valid) {
            this.state = "unreachable";
        }
        else if (start === goal) {
            this.state = "found";
            this.result = [start];
            this.resultCost = 0;
        }
        else {
            this.costs.set(start, 0);
            this.frontier.insert({ node: start, cost: 0, priority: 0 });
        }
    }

    get status(): PathQueryStatus {
        return this.state;
    }

    get path(): number[] {
        return this.result.slice();
    }

    get cost(): number {
        return this.resultCost;
    }

    get expanded(): number {
        return this.expansions;
    }

    private pending() {
        return this.state === "pending";
    }

    private clear() {
        this.frontier.clear();
        this.costs.clear();
        this.previous.clear();
        this.next = null;
    }

    cancel() {
        if (this.pending()) {
            this.state = "cancelled";
            this.clear();
        }
    }

    private complete(current: Candidate) {
        const path = [current.node];
        while (path[path.length - 1] !== this.start) {
            path.push(this.previous.get(path[path.length - 1])!);
        }
        this.result = path.reverse();
        this.resultCost = current.cost;
        this.state = "found";
        this.clear();
    }

    step(budget: number): PathQueryStatus {
        validatePathBudget(budget);
        if (!this.pending() || this.stepping || budget === 0) {
            return this.state;
        }
        this.stepping = true;
        let used = 0;
        try {
            while (this.pending()) {
                const current = this.next ?? this.frontier.remove();
                this.next = null;
                if (!current) {
                    this.state = "unreachable";
                    this.clear();
                    break;
                }
                if (this.costs.get(current.node) !== current.cost) {
                    continue;
                }
                if (current.node === this.goal) {
                    this.complete(current);
                    break;
                }
                if (used === budget) {
                    this.next = current;
                    break;
                }
                used++;
                this.expansions++;
                const neighbors = this.graph.getNeighbors(current.node);
                if (!this.pending()) break;
                for (const neighbor of neighbors) {
                    const cost = current.cost
                        + this.graph.getCost(current.node, neighbor);
                    if (!this.pending()) break;
                    if (cost >= (this.costs.get(neighbor) ?? Infinity)) {
                        continue;
                    }
                    const priority = cost
                        + this.graph.getHeuristic(neighbor, this.goal);
                    if (!this.pending()) break;
                    this.costs.set(neighbor, cost);
                    this.previous.set(neighbor, current.node);
                    this.frontier.insert({ node: neighbor, cost, priority });
                }
            }
        } catch (error) {
            this.cancel();
            throw error;
        } finally {
            this.stepping = false;
        }
        return this.state;
    }
}

/** Preserve the search lifecycle while presenting another route representation. */
export function mapPathQuery<T>(
    query: PathQuery<number>,
    convert: (path: number[]) => T[],
): PathQuery<T> {
    return {
        get status() {
            return query.status;
        },
        get path() {
            return query.status === "found" ? convert(query.path) : [];
        },
        get cost() {
            return query.cost;
        },
        get expanded() {
            return query.expanded;
        },
        step(budget) {
            return query.step(budget);
        },
        cancel() {
            query.cancel();
        },
    };
}

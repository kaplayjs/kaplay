import type { KEventController } from "../../../events/events";
import { type Graph } from "../../../math/navigation";
import { type PathQuery, validatePathBudget } from "../../../math/pathquery";
import { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp, GameObj } from "../../../types";
import type { PosComp } from "../transform/pos";

export interface PathfinderMapComp extends Comp {
    /**
     * Get navigation waypoints to reach the given target from the given origin.
     */
    navigate(
        origin: Vec2,
        target: Vec2,
        navigationOpt: any,
    ): Vec2[] | undefined;
    /**
     * The graph to use for navigation.
     */
    graph: Graph | undefined;
    /** Queue an independent route calculation on this map. */
    requestNavigation(
        origin: Vec2,
        target: Vec2,
        navigationOpt?: any,
    ): PathQuery<Vec2> | undefined;
}

export interface PathfinderMapCompOpt {
    /** Shared expansion budget for all requests advanced by this map. */
    searchBudget?: number;
    /**
     * The graph to use for navigation. If null, the ancestors are queried for a pathfinderMap component.
     */
    graph?: Graph;
}

export function pathfinderMap(
    opts: PathfinderMapCompOpt,
): PathfinderMapComp {
    const budget = opts.searchBudget === undefined ? 64 : opts.searchBudget;
    validatePathBudget(budget);
    let graph = opts.graph;
    let disposed = false;
    let updating = false;
    let queue: PathQuery<Vec2>[] = [];
    const active = new Set<PathQuery<Vec2>>();
    let destroyEvent: KEventController | undefined;
    const cancelAll = () => {
        for (const query of active) query.cancel();
        active.clear();
        queue = [];
    };
    const dispose = () => {
        disposed = true;
        cancelAll();
        destroyEvent?.cancel();
        destroyEvent = undefined;
    };
    return {
        id: "pathfinderMap",
        add(this: GameObj<PathfinderMapComp>) {
            destroyEvent = _k.appScope.onDestroy(owner => {
                if (owner === this) dispose();
            });
        },
        destroy: dispose,
        get graph(): Graph | undefined {
            return graph;
        },
        set graph(value) {
            if (graph !== value) cancelAll();
            graph = value;
        },
        requestNavigation(origin, target, navigationOpt = {}) {
            if (disposed) return undefined;
            const query = graph?.createWaypointQuery?.(
                origin,
                target,
                navigationOpt,
            );
            if (query?.status === "pending") {
                active.add(query);
                queue.push(query);
            }
            return query;
        },
        update() {
            if (disposed || updating || budget === 0) return;
            updating = true;
            let remaining = budget;
            try {
                while (queue.length && remaining > 0 && !disposed) {
                    const query = queue.shift()!;
                    if (query.status !== "pending") {
                        active.delete(query);
                        continue;
                    }
                    const before = query.expanded;
                    try {
                        query.step(1);
                    } finally {
                        remaining -= query.expanded - before;
                        if (active.has(query) && query.status === "pending") {
                            queue.push(query);
                        }
                        else {
                            active.delete(query);
                        }
                    }
                }
            } finally {
                updating = false;
            }
        },
        navigate(
            this: GameObj<PathfinderMapComp>,
            origin: Vec2,
            target: Vec2,
            navigationOpt: any = {},
        ): Vec2[] | undefined {
            return graph?.getWaypointPath(origin, target, navigationOpt);
        },
    };
}

export interface PathfinderComp extends Comp {
    /**
     * Get navigation waypoints to reach the given target from the current position.
     */
    navigateTo(target: Vec2): Vec2[] | undefined;
    /** Start a route query advanced by this component on each update. */
    requestNavigationTo(target: Vec2): PathQuery<Vec2> | undefined;
    /** The last request, including its terminal result. */
    readonly navigationQuery: PathQuery<Vec2> | undefined;
    /**
     * Get the graph used for navigastion if any.
     */
    graph: Graph | undefined;
}

export interface PathfinderCompOpt {
    /**
     * The graph to use for navigation. If null, the ancestors are queried for a pathfinderMap component.
     */
    graph?: Graph;
    /**
     * The navigation options depending on the kind of graph used.
     */
    navigationOpt?: any;
    /** Maximum node expansions per update. Zero pauses automatic progress. */
    searchBudget?: number;
}

export function pathfinder(
    opts: PathfinderCompOpt,
): PathfinderComp {
    const budget = opts.searchBudget === undefined ? 64 : opts.searchBudget;
    validatePathBudget(budget);
    let graph = opts.graph;
    let query: PathQuery<Vec2> | undefined;
    let queryGraph: Graph | undefined;
    let disposed = false;
    let destroyEvent: KEventController | undefined;
    const dispose = () => {
        disposed = true;
        query?.cancel();
        destroyEvent?.cancel();
        destroyEvent = undefined;
    };
    return {
        id: "pathfinder",
        require: ["pos"],
        add(this: GameObj<PathfinderComp>) {
            destroyEvent = _k.appScope.onDestroy(owner => {
                if (owner === this) dispose();
            });
        },
        get navigationQuery() {
            return query;
        },
        requestNavigationTo(this: GameObj<PathfinderComp | PosComp>, target) {
            query?.cancel();
            query = undefined;
            queryGraph = undefined;
            if (disposed) return undefined;
            const selected = this.graph;
            queryGraph = selected;
            query = selected?.createWaypointQuery?.(
                this.pos,
                target,
                opts.navigationOpt,
            );
            return query;
        },
        update(this: GameObj<PathfinderComp>) {
            if (disposed || !query || query.status !== "pending") return;
            if (this.graph !== queryGraph) {
                query.cancel();
                return;
            }
            query.step(budget);
        },
        destroy: dispose,
        navigateTo(
            this: GameObj<PathfinderComp | PosComp>,
            target: Vec2,
        ): Vec2[] | undefined {
            const graph: Graph | undefined = this.graph;
            return graph?.getWaypointPath(this.pos, target, opts.navigationOpt);
        },
        get graph(): Graph | undefined {
            if (graph) {
                return graph;
            }
            let parent: GameObj<any> | null =
                (this as unknown as GameObj<PathfinderComp>).parent;
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
            if (queryGraph !== this.graph) query?.cancel();
        },
    };
}

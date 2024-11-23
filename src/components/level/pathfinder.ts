import { Vec2 } from "../../math/math";
import { type Graph } from "../../math/navigation";
import type { Comp, GameObj } from "../../types";
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
}

export interface PathfinderMapCompOpt {
    /**
     * The graph to use for navigation. If null, the ancestors are queried for a pathfinderMap component.
     */
    graph?: Graph;
}

export function pathfinderMap(
    opts: PathfinderMapCompOpt,
): PathfinderMapComp {
    let graph = opts.graph;
    return {
        id: "pathfinderMap",
        get graph(): Graph | undefined {
            return graph;
        },
        set graph(value) {
            graph = value;
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
}

export function pathfinder(
    opts: PathfinderCompOpt,
): PathfinderComp {
    let graph = opts.graph;
    return {
        id: "pathfinder",
        require: ["pos"],
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
                if (parent.is("pathfinderMap")) {
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

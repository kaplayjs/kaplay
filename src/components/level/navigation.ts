import { Vec2 } from "../../math/math";
import { type Graph } from "../../math/navigation";
import type { Comp, GameObj } from "../../types";
import type { PosComp } from "../transform/pos";

export interface NavigationMapComp extends Comp {
    /*
     * Get navigation waypoints to reach the given target from the given origin.
     */
    navigate(
        origin: Vec2,
        target: Vec2,
        navigationOpt: any,
    ): Vec2[] | undefined;
    /*
     * The graph to use for navigation.
     */
    graph: Graph | undefined;
}

export interface NavigationMapCompOpt {
    /*
     * The graph to use for navigation. If null, the ancestors are queried for a navigatorMap component.
     */
    graph?: Graph;
}

export function navigationMap(
    opts: NavigationMapCompOpt,
): NavigationMapComp {
    let graph = opts.graph;
    return {
        id: "navigatorMap",
        get graph(): Graph | undefined {
            return graph;
        },
        set graph(value) {
            graph = value;
        },
        navigate(
            this: GameObj<NavigationMapComp>,
            origin: Vec2,
            target: Vec2,
            navigationOpt: any = {},
        ): Vec2[] | undefined {
            return graph?.getWaypointPath(origin, target, navigationOpt);
        },
    };
}

export interface NavigationComp extends Comp {
    /*
     * Get navigation waypoints to reach the given target from the current position.
     */
    navigateTo(target: Vec2): Vec2[] | undefined;
    /*
     * Get the graph used for navigastion if any.
     */
    graph: Graph | undefined;
}

export interface NavigationCompOpt {
    /*
     * The graph to use for navigation. If null, the ancestors are queried for a navigatorMap component.
     */
    graph?: Graph;
    /*
     * The navigation options depending on the kind of graph used.
     */
    navigationOpt?: any;
}

export function navigation(
    opts: NavigationCompOpt,
): NavigationComp {
    let graph = opts.graph;
    return {
        id: "navigator",
        require: ["pos"],
        navigateTo(
            this: GameObj<NavigationComp | PosComp>,
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
                (this as unknown as GameObj<NavigationComp>).parent;
            while (parent) {
                if (parent.is("navigatormap")) {
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

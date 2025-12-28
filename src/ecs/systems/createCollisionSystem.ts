import { DEF_HASH_GRID_SIZE } from "../../constants/general";
import { height, width } from "../../gfx/stack";
import { gjkShapeIntersection } from "../../math/gjk";
import { Rect, vec2 } from "../../math/math";
import { minkowskiRectShapeIntersection } from "../../math/minkowski";
import { satShapeIntersection } from "../../math/sat";
import type { BroadPhaseAlgorithm } from "../../math/spatial";
import { HashGrid } from "../../math/spatial/hashgrid";
import { Quadtree } from "../../math/spatial/quadtree";
import {
    SweepAndPruneHorizontal,
    SweepAndPruneVertical,
} from "../../math/spatial/sweepandprune";
import { _k } from "../../shared";
import type { GameObj } from "../../types";
import { type AreaComp, usesArea } from "../components/physics/area";
import { Collision } from "./Collision";
export type BroadPhaseType = "sap" | "sapv" | "quadtree" | "grid";
export type NarrowPhaseType = "gjk" | "sat" | "box";

export const createCollisionSystem = (
    { broad = "sap", narrow = "gjk", opt = {} }: {
        broad?: BroadPhaseType;
        narrow?: NarrowPhaseType;
        opt?: any;
    } = {},
) => {
    const broadPhaseIntersection: BroadPhaseAlgorithm = broad === "sap"
        ? new SweepAndPruneHorizontal()
        : broad === "sapv"
        ? new SweepAndPruneVertical()
        : broad === "quadtree"
        ? new Quadtree(new Rect(vec2(0, 0), width(), height()), 8, 8)
        : broad == "grid"
        ? new HashGrid(
            new Rect(
                vec2(-DEF_HASH_GRID_SIZE, -DEF_HASH_GRID_SIZE),
                width() + DEF_HASH_GRID_SIZE * 2,
                height() + DEF_HASH_GRID_SIZE * 2,
            ),
            opt,
        )
        : new SweepAndPruneHorizontal();
    const narrowPhaseIntersection = narrow === "gjk"
        ? gjkShapeIntersection
        : narrow === "sat"
        ? satShapeIntersection
        : narrow === "box"
        ? minkowskiRectShapeIntersection
        : gjkShapeIntersection;

    function narrowPhase(
        obj: GameObj<AreaComp>,
        other: GameObj<AreaComp>,
    ): boolean {
        for (const tag of obj.collisionIgnore) {
            if (other.is(tag)) {
                return false;
            }
        }
        for (const tag of other.collisionIgnore) {
            if (obj.is(tag)) {
                return false;
            }
        }
        const res = narrowPhaseIntersection(obj.worldArea(), other.worldArea());
        if (res) {
            const col1 = new Collision(
                obj,
                other,
                res.normal,
                res.distance,
            );
            obj.trigger("collideUpdate", other, col1);
            const col2 = col1.reverse();
            // resolution only has to happen once
            col2.resolved = col1.resolved;
            other.trigger("collideUpdate", obj, col2);
        }
        return true;
    }

    let broadInit = false;

    function broadPhase() {
        if (!broadInit) {
            broadInit = true;
            _k.appScope.onAdd(obj => {
                if (obj.has("area")) {
                    broadPhaseIntersection.add(obj as GameObj<AreaComp>);
                }
            });
            _k.appScope.onDestroy(obj => {
                broadPhaseIntersection.remove(obj as GameObj<AreaComp>);
            });
            _k.appScope.onUse((obj, id) => {
                if (id === "area") {
                    broadPhaseIntersection.add(obj as GameObj<AreaComp>);
                }
            });
            _k.appScope.onUnuse((obj, id) => {
                if (id === "area") {
                    broadPhaseIntersection.remove(obj as GameObj<AreaComp>);
                }
            });

            _k.appScope.onSceneLeave(scene => {
                broadInit = false;
                broadPhaseIntersection.clear();
            });

            for (const obj of _k.game.root.get("*", { recursive: true })) {
                if (obj.has("area")) {
                    broadPhaseIntersection.add(obj as GameObj<AreaComp>);
                }
            }
        }

        broadPhaseIntersection.update();
        broadPhaseIntersection.iterPairs(narrowPhase);
    }

    function checkFrame() {
        if (!usesArea()) {
            return;
        }

        return broadPhase();
    }

    function retrieve(
        rect: Rect,
        retrieveCb: (obj: GameObj<AreaComp>) => void,
    ) {
        broadPhaseIntersection.retrieve(rect, retrieveCb);
    }

    return {
        checkFrame,
        retrieve,
    };
};

import { onAdd, onDestroy, onUnuse, onUse } from "../../events/globalEvents";
import { onSceneLeave } from "../../game/scenes";
import { _k } from "../../kaplay";
import { gjkShapeIntersection } from "../../math/gjk";
import { type Vec2, vec2 } from "../../math/math";
import { SweepAndPrune } from "../../math/spatial/sweepandprune";
import type { GameObj } from "../../types";
import { type AreaComp, usesArea } from "../components/physics/area";

export const getCollisionSystem = () => {
    class Collision {
        source: GameObj;
        target: GameObj;
        normal: Vec2;
        distance: number;
        resolved: boolean = false;
        constructor(
            source: GameObj,
            target: GameObj,
            normal: Vec2,
            distance: number,
            resolved = false,
        ) {
            this.source = source;
            this.target = target;
            this.normal = normal;
            this.distance = distance;
            this.resolved = resolved;
        }
        get displacement() {
            return this.normal.scale(this.distance);
        }
        reverse() {
            return new Collision(
                this.target,
                this.source,
                this.normal.scale(-1),
                this.distance,
                this.resolved,
            );
        }
        hasOverlap() {
            return !this.displacement.isZero();
        }
        isLeft() {
            return this.displacement.cross(_k.game.gravity || vec2(0, 1)) > 0;
        }
        isRight() {
            return this.displacement.cross(_k.game.gravity || vec2(0, 1)) < 0;
        }
        isTop() {
            return this.displacement.dot(_k.game.gravity || vec2(0, 1)) > 0;
        }
        isBottom() {
            return this.displacement.dot(_k.game.gravity || vec2(0, 1)) < 0;
        }
        preventResolution() {
            this.resolved = true;
        }
    }

    function narrowPhase(
        obj: GameObj<AreaComp>,
        other: GameObj<AreaComp>,
    ): boolean {
        if (other.paused) return false;
        if (!other.exists()) return false;
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
        const res = gjkShapeIntersection(
            obj.worldArea(),
            other.worldArea(),
        );
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

    const sap = new SweepAndPrune();
    let sapInit = false;

    function broadPhase() {
        if (!usesArea()) {
            return;
        }

        if (!sapInit) {
            sapInit = true;
            onAdd(obj => {
                if (obj.has("area")) {
                    sap.add(obj as GameObj<AreaComp>);
                }
            });
            onDestroy(obj => {
                sap.remove(obj as GameObj<AreaComp>);
            });
            onUse((obj, id) => {
                if (id === "area") {
                    sap.add(obj as GameObj<AreaComp>);
                }
            });
            onUnuse((obj, id) => {
                if (id === "area") {
                    sap.remove(obj as GameObj<AreaComp>);
                }
            });
            onSceneLeave(scene => {
                sapInit = false;
                sap.clear();
            });

            for (const obj of _k.game.root.get("*", { recursive: true })) {
                if (obj.has("area")) {
                    sap.add(obj as GameObj<AreaComp>);
                }
            }
        }

        sap.update();
        for (const [obj1, obj2] of sap) {
            narrowPhase(obj1, obj2);
        }
    }

    function checkFrame() {
        if (!usesArea()) {
            return;
        }

        return broadPhase();

        /*// TODO: persistent grid?
        // start a spatial hash grid for more efficient collision detection
        const grid: Record<number, Record<number, GameObj<AreaComp>[]>> = {};
        const cellSize = gopt.hashGridSize || DEF_HASH_GRID_SIZE;

        // current transform
        let tr = new Mat23();

        // a local transform stack
        const stack: any[] = [];

        function checkObj(obj: GameObj) {
            stack.push(tr.clone());

            // Update object transform here. This will be the transform later used in rendering.
            if (obj.pos) tr.translate(obj.pos);
            if (obj.scale) tr.scale(obj.scale);
            if (obj.angle) tr.rotate(obj.angle);
            obj.transform = tr.clone();

            if (obj.c("area") && !obj.paused) {
                // TODO: only update worldArea if transform changed
                const aobj = obj as GameObj<AreaComp>;
                const area = aobj.worldArea();
                const bbox = area.bbox();

                // Get spatial hash grid coverage
                const xmin = Math.floor(bbox.pos.x / cellSize);
                const ymin = Math.floor(bbox.pos.y / cellSize);
                const xmax = Math.ceil((bbox.pos.x + bbox.width) / cellSize);
                const ymax = Math.ceil((bbox.pos.y + bbox.height) / cellSize);

                // Cache objs that are already checked
                const checked = new Set();

                // insert & check against all covered grids
                for (let x = xmin; x <= xmax; x++) {
                    for (let y = ymin; y <= ymax; y++) {
                        if (!grid[x]) {
                            grid[x] = {};
                            grid[x][y] = [aobj];
                        }
                        else if (!grid[x][y]) {
                            grid[x][y] = [aobj];
                        }
                        else {
                            const cell = grid[x][y];
                            check: for (const other of cell) {
                                if (other.paused) continue;
                                if (!other.exists()) continue;
                                if (checked.has(other.id)) continue;
                                for (const tag of aobj.collisionIgnore) {
                                    if (other.is(tag)) {
                                        continue check;
                                    }
                                }
                                for (const tag of other.collisionIgnore) {
                                    if (aobj.is(tag)) {
                                        continue check;
                                    }
                                }
                                const res = gjkShapeIntersection( // sat(
                                    aobj.worldArea(),
                                    other.worldArea(),
                                );
                                if (res) {
                                    // TODO: rehash if the object position is changed after resolution?
                                    const col1 = new Collision(
                                        aobj,
                                        other,
                                        res.normal,
                                        res.distance,
                                    );
                                    aobj.trigger("collideUpdate", other, col1);
                                    const col2 = col1.reverse();
                                    // resolution only has to happen once
                                    col2.resolved = col1.resolved;
                                    other.trigger("collideUpdate", aobj, col2);
                                }
                                checked.add(other.id);
                            }
                            cell.push(aobj);
                        }
                    }
                }
            }

            obj.children.forEach(checkObj);
            tr = stack.pop();
        }

        checkObj(game.root);*/
    }

    return {
        checkFrame,
    };
};

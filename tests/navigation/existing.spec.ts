import { expect, test } from "@playwright/test";
import { NavGrid } from "../../src/math/navigationgrid";
import { NavMesh } from "../../src/math/navigationmesh";
import { Vec2 } from "../../src/math/Vec2";

test("grid neighbors retain cardinal and diagonal connectivity", () => {
    const cardinal = new NavGrid(3, 3, () => true);
    expect(cardinal.getNeighbors(4).sort()).toEqual([1, 3, 5, 7]);
    expect(cardinal.getNeighbors(0).sort()).toEqual([1, 3]);
    const diagonal = new NavGrid(3, 3, (_a, b) => b !== 8, { diagonals: true });
    expect(diagonal.getNeighbors(4).sort()).toEqual([0, 1, 2, 3, 5, 6, 7]);
    for (const neighbor of diagonal.getNeighbors(4)) {
        expect(diagonal.getCost(4, neighbor)).toBe(1);
    }
});

test("connected mesh routes retain centroid and passage waypoint modes", () => {
    const mesh = new NavMesh();
    for (let x = 0; x < 30; x += 10) {
        mesh.addRect(new Vec2(x, 0), new Vec2(10, 10));
    }
    expect(mesh.getNeighbors(0)).toEqual([1]);
    expect(mesh.getNeighbors(1).sort()).toEqual([0, 2]);
    expect(mesh.getPath(0, 2)).toEqual([0, 1, 2]);
    const start = new Vec2(2, 3), goal = new Vec2(28, 7);
    expect(mesh.getWaypointPath(start, goal, { type: "centroids" })).toEqual([
        start,
        new Vec2(15, 5),
        goal,
    ]);
    const passages = mesh.getWaypointPath(start, goal, { type: "edges" });
    expect(passages).toHaveLength(4);
    expect(passages[0]).toEqual(start);
    expect(passages[3]).toEqual(goal);
    expect(passages[1].x).toBeGreaterThanOrEqual(10);
    expect(passages[1].x).toBeLessThan(20);
    expect(passages[2].x).toBeGreaterThanOrEqual(20);
    expect(passages[2].x).toBeLessThan(30);
});

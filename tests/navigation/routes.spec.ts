import { expect, test } from "@playwright/test";
import { build } from "esbuild";
import { config } from "../../scripts/lib/build";
import { NavGrid } from "../../src/math/navigationgrid";
import { NavMesh } from "../../src/math/navigationmesh";
import { Vec2 } from "../../src/math/Vec2";

declare const navigationComponents:
    & typeof import("../../src/ecs/components/level/pathfinder")
    & typeof import("../../src/kaplay");

const point = (x: number, y: number) => new Vec2(x, y);
const links = [
    "0,1",
    "0,8",
    "1,2",
    "1,9",
    "2,3",
    "2,10",
    "3,11",
    "5,6",
    "5,13",
    "6,7",
    "6,14",
    "8,9",
    "8,16",
    "9,17",
    "10,18",
    "11,12",
    "11,19",
    "12,13",
    "12,20",
    "13,14",
    "13,21",
    "14,22",
    "16,24",
    "17,25",
    "18,19",
    "18,26",
    "21,29",
    "22,23",
    "22,30",
    "23,31",
    "24,25",
    "24,32",
    "25,33",
    "26,27",
    "26,34",
    "27,35",
    "28,29",
    "29,30",
    "30,31",
    "30,38",
    "31,39",
    "32,33",
    "32,40",
    "34,35",
    "35,36",
    "35,43",
    "36,44",
    "38,39",
    "40,41",
    "41,49",
    "42,43",
    "42,50",
    "43,44",
    "44,45",
    "45,46",
    "45,53",
    "46,47",
    "47,55",
    "48,49",
    "48,56",
    "49,57",
    "50,51",
    "51,52",
    "52,53",
    "52,60",
    "54,55",
    "54,62",
    "56,57",
    "57,58",
    "58,59",
    "59,60",
    "60,61",
    "61,62",
    "62,63",
].map(pair => pair.split(",").map(Number));

type RouteGraph = NavGrid | NavMesh;

// An exhaustive relaxation oracle does not share the production search strategy.
function minimumCost(graph: RouteGraph, start: number, goal: number) {
    const costs = new Map(graph.nodes.map(node => [node, Infinity]));
    costs.set(start, 0);
    for (let pass = 0; pass < graph.nodes.length - 1; pass++) {
        let changed = false;
        for (const node of graph.nodes) {
            for (const next of graph.getNeighbors(node)) {
                const cost = costs.get(node)! + graph.getCost(node, next);
                if (cost < costs.get(next)!) {
                    costs.set(next, cost);
                    changed = true;
                }
            }
        }
        if (!changed) break;
    }
    return costs.get(goal)!;
}

function checkRoute(graph: RouteGraph, start: number, goal: number) {
    const optimum = minimumCost(graph, start, goal);
    const route = graph.getPath(start, goal);
    if (!Number.isFinite(optimum)) {
        expect(route).toEqual([]);
        return;
    }
    expect(route[0]).toBe(start);
    expect(route.at(-1)).toBe(goal);
    expect(route.filter(node => node === start)).toHaveLength(1);
    expect(route.filter(node => node === goal)).toHaveLength(1);
    let cost = 0;
    for (let i = 1; i < route.length; i++) {
        expect(graph.getNeighbors(route[i - 1])).toContain(route[i]);
        cost += graph.getCost(route[i - 1], route[i]);
    }
    expect(cost).toBe(optimum);
}

function corridorGrid() {
    const edges = new Set(links.map(([a, b]) => `${a},${b}`));
    return new NavGrid(
        8,
        8,
        (a, b) => edges.has(`${Math.min(a, b)},${Math.max(a, b)}`),
    );
}

function corridorMesh(scale: number) {
    const mesh = new NavMesh();
    for (let node = 0; node < 64; node++) {
        mesh.addRect(
            point((node % 8) * 2 * scale, Math.floor(node / 8) * 2 * scale),
            point(scale, scale),
        );
    }
    for (const [a, b] of links) {
        mesh.addRect(
            point(
                ((a % 8) + (b % 8)) * scale,
                (Math.floor(a / 8) + Math.floor(b / 8)) * scale,
            ),
            point(scale, scale),
        );
    }
    return mesh;
}

test("grid routes include endpoints once, including zero-length routes", () => {
    expect(new NavGrid(1, 1, () => true).getPath(0, 0)).toEqual([0]);
    const grid = new NavGrid(4, 3, () => true);
    for (const [start, goal] of [[0, 11], [11, 0], [0, 0], [11, 11], [4, 7]]) {
        checkRoute(grid, start, goal);
    }
});

for (const kind of ["grid", "mesh"] as const) {
    test(`${kind} rejects nonexistent node IDs at either endpoint`, () => {
        const empty = kind === "grid"
            ? new NavGrid(0, 0, () => true)
            : new NavMesh();
        expect(empty.getPath(0, 0)).toEqual([]);
        const graph = kind === "grid"
            ? new NavGrid(2, 1, () => true)
            : new NavMesh();
        if (graph instanceof NavMesh) {
            graph.addRect(point(0, 0), point(10, 10));
            graph.addRect(point(10, 0), point(10, 10));
        }
        for (const invalid of [-1, 2, 0.5, NaN, Infinity, -Infinity]) {
            expect(graph.getPath(invalid, 0)).toEqual([]);
            expect(graph.getPath(0, invalid)).toEqual([]);
            expect(graph.getPath(invalid, invalid)).toEqual([]);
        }
        checkRoute(graph, 0, 1);
        checkRoute(graph, 1, 1);
    });
}

test("disconnected grid queries do not fabricate waypoint routes", () => {
    const grid = new NavGrid(3, 2, (a, b) => a % 3 !== 1 && b % 3 !== 1, {
        tileWidth: 10,
        tileHeight: 6,
    });
    for (
        const [a, b] of [[point(2, 2), point(22, 8)], [
            point(22, 8),
            point(2, 2),
        ]]
    ) {
        expect(grid.getWaypointPath(a, b)).toEqual([]);
    }
    checkRoute(grid, 0, 5);
    checkRoute(grid, 0, 3);
});

test("grid waypoint bounds do not alias rows and retain valid boundary positions", () => {
    const grid = new NavGrid(3, 2, () => true, {
        tileWidth: 10,
        tileHeight: 6,
    });
    const inside = point(15, 3);
    for (
        const outside of [
            point(-1, 8),
            point(30, 1),
            point(31, 1),
            point(1, -1),
            point(1, 12),
            point(1, 13),
        ]
    ) {
        expect(grid.getWaypointPath(outside, inside)).toEqual([]);
        expect(grid.getWaypointPath(inside, outside)).toEqual([]);
    }
    for (const boundary of [point(0, 0), point(29.5, 11.5)]) {
        const route = grid.getWaypointPath(boundary, inside);
        expect(route[0]).toEqual(boundary);
        expect(route.at(-1)).toEqual(inside);
    }
});

test("grid detours minimize cost instead of accumulated distance to the goal", () => {
    const branches = [
        [
            0,
            1,
            2,
            10,
            18,
            26,
            25,
            33,
            32,
            40,
            48,
            49,
            50,
            58,
            59,
            60,
            61,
            62,
            63,
        ],
        [
            0,
            1,
            2,
            10,
            18,
            19,
            27,
            35,
            36,
            28,
            20,
            21,
            22,
            23,
            31,
            39,
            47,
            46,
            54,
            55,
            63,
        ],
    ];
    const allowed = new Set<string>();
    for (const branch of branches) {
        for (let i = 1; i < branch.length; i++) {
            const a = branch[i - 1], b = branch[i];
            allowed.add(`${Math.min(a, b)},${Math.max(a, b)}`);
        }
    }
    const forcedDetour = new NavGrid(
        8,
        8,
        (a, b) => allowed.has(`${Math.min(a, b)},${Math.max(a, b)}`),
    );
    expect(minimumCost(forcedDetour, 0, 63)).toBe(18);
    checkRoute(forcedDetour, 0, 63);
    const grid = corridorGrid();
    expect(minimumCost(grid, 0, 63)).toBe(14);
    for (
        const [start, goal] of [[0, 63], [63, 0], [4, 63], [24, 55], [7, 48]]
    ) {
        checkRoute(grid, start, goal);
    }
});

test("diagonal grid routes use the existing diagonal cost", () => {
    const detour = new Set([
        7,
        9,
        14,
        19,
        21,
        26,
        30,
        34,
        43,
        44,
        45,
        46,
        53,
        59,
        61,
    ]);
    const diagonalDetour = new NavGrid(
        8,
        8,
        (a, b) => !detour.has(a) && !detour.has(b),
        { diagonals: true },
    );
    expect(minimumCost(diagonalDetour, 0, 63)).toBe(9);
    checkRoute(diagonalDetour, 0, 63);
    const blocked = new Set([2, 6, 8, 12, 15, 17]);
    const grid = new NavGrid(
        5,
        5,
        (a, b) => !blocked.has(a) && !blocked.has(b),
        { diagonals: true },
    );
    for (const start of [0, 4, 10, 19, 24]) {
        for (const goal of [0, 4, 10, 19, 24]) checkRoute(grid, start, goal);
    }
});

test("grid reachability respects the direction of allowed connections", () => {
    const grid = new NavGrid(3, 1, (a, b) => a > b);
    checkRoute(grid, 2, 0);
    checkRoute(grid, 0, 2);
    checkRoute(grid, 1, 1);
});

test("grid waypoint endpoints survive a route with intermediate cells", () => {
    const grid = new NavGrid(3, 1, () => true, {
        tileWidth: 10,
        tileHeight: 6,
    });
    const start = point(2, 1), goal = point(28, 5);
    checkRoute(grid, 0, 2);
    const route = grid.getWaypointPath(start, goal);
    expect(route[0]).toEqual(start);
    expect(route.at(-1)).toEqual(goal);
    for (const waypoint of route) {
        expect(waypoint.x).toBeGreaterThanOrEqual(0);
        expect(waypoint.x).toBeLessThan(30);
        expect(waypoint.y).toBeGreaterThanOrEqual(0);
        expect(waypoint.y).toBeLessThan(6);
    }
    expect(grid.getWaypointPath(point(1, 1), point(3, 2))).toEqual([
        point(1, 1),
        point(3, 2),
    ]);
});

for (const type of ["centroids", "edges"]) {
    test(`same-polygon mesh queries work in ${type} mode`, () => {
        const mesh = new NavMesh();
        mesh.addRect(point(0, 0), point(20, 20));
        expect(mesh.getPath(0, 0)).toEqual([0]);
        expect(mesh.getWaypointPath(point(2, 3), point(17, 16), { type }))
            .toEqual([point(2, 3), point(17, 16)]);
    });

    test(`outside and empty mesh queries return no route in ${type} mode`, () => {
        const mesh = new NavMesh();
        expect(mesh.getWaypointPath(point(1, 1), point(2, 2), { type }))
            .toEqual([]);
        mesh.addRect(point(0, 0), point(20, 20));
        for (
            const outside of [
                point(-2, 5),
                point(25, 5),
                point(5, -2),
                point(5, 25),
            ]
        ) {
            expect(mesh.getWaypointPath(outside, point(5, 5), { type }))
                .toEqual([]);
            expect(mesh.getWaypointPath(point(5, 5), outside, { type }))
                .toEqual([]);
        }
    });

    test(`disconnected mesh node and ${type} waypoint queries agree`, () => {
        const mesh = new NavMesh();
        mesh.addRect(point(0, 0), point(10, 10));
        mesh.addRect(point(30, 0), point(10, 10));
        expect(mesh.getPath(0, 1)).toEqual([]);
        expect(mesh.getPath(1, 0)).toEqual([]);
        expect(mesh.getWaypointPath(point(2, 2), point(32, 2), { type }))
            .toEqual([]);
        mesh.addRect(point(10, 0), point(20, 10));
        checkRoute(mesh, 0, 1);
        const waypoints = mesh.getWaypointPath(point(2, 2), point(32, 2), {
            type,
        });
        expect(waypoints[0]).toEqual(point(2, 2));
        expect(waypoints.at(-1)).toEqual(point(32, 2));
        expect(waypoints.length).toBeGreaterThan(2);
    });
}

test("mesh paths minimize transition cost across differently scaled layouts", () => {
    for (const scale of [1, 64]) {
        const mesh = corridorMesh(scale);
        expect(minimumCost(mesh, 0, 63)).toBe(28);
        for (const [start, goal] of [[0, 63], [63, 0], [24, 55]]) {
            checkRoute(mesh, start, goal);
        }
    }
});

for (const graphKind of ["grid", "mesh"] as const) {
    test(`components preserve ${graphKind} route results`, async ({ page }) => {
        const componentModule = await build({
            ...config,
            entryPoints: [],
            stdin: {
                contents:
                    "export { kaplay } from \"./src/kaplay\"; export { pathfinderMap } from \"./src/ecs/components/level/pathfinder\";",
                resolveDir: process.cwd(),
                loader: "ts",
            },
            write: false,
            format: "iife",
            globalName: "navigationComponents",
        });
        await page.addScriptTag({
            content: componentModule.outputFiles[0].text,
        });
        const result = await page.evaluate((kind) => {
            const k = navigationComponents.kaplay({ global: false });
            const graph = kind === "grid"
                ? new k.NavGrid(3, 1, () => false, {
                    tileWidth: 10,
                    tileHeight: 10,
                })
                : new k.NavMesh();
            if (graph instanceof k.NavMesh) {
                graph.addRect(k.vec2(0, 0), k.vec2(10, 10));
                graph.addRect(k.vec2(20, 0), k.vec2(10, 10));
            }
            const parent = k.add([
                navigationComponents.pathfinderMap({ graph }),
            ]);
            const inherited = parent.add([k.pos(2, 3), k.pathfinder({})]);
            const explicit = k.add([k.pos(2, 3), k.pathfinder({ graph })]);
            const unreachable = k.vec2(22, 3),
                outside = k.vec2(35, 3),
                nearby = k.vec2(4, 5);
            const values = [
                inherited.navigateTo(unreachable),
                explicit.navigateTo(unreachable),
                parent.navigate(k.vec2(2, 3), unreachable, {}),
                inherited.navigateTo(nearby),
                explicit.navigateTo(nearby),
                parent.navigate(k.vec2(2, 3), nearby, {}),
                inherited.navigateTo(outside),
                explicit.navigateTo(outside),
                parent.navigate(k.vec2(2, 3), outside, {}),
            ];
            k.quit();
            return values;
        }, graphKind);
        expect(result.slice(0, 3)).toEqual([[], [], []]);
        expect(result.slice(3, 6)).toEqual(
            Array(3).fill([{ x: 2, y: 3 }, { x: 4, y: 5 }]),
        );
        expect(result.slice(6)).toEqual([[], [], []]);
    });
}

test("resumed queries retain minimum costs on detours and scaled meshes", () => {
    const diagonals = new NavGrid(
        8,
        8,
        (a, b) =>
            ![7, 9, 14, 19, 21, 26, 30, 34, 43, 44, 45, 46, 53, 59, 61]
                .includes(b),
        { diagonals: true },
    );
    const edges = new Set(
        links.flatMap(([a, b]) => [`${a},${b}`, `${b},${a}`]),
    );
    const grid = new NavGrid(8, 8, (a, b) => edges.has(`${a},${b}`));
    for (const g of [grid, diagonals, corridorMesh(1), corridorMesh(64)]) {
        for (const [from, to] of [[0, 63], [63, 0]]) {
            const q = (g as any).createPathQuery(from, to);
            for (let i = 0; i < 10000 && q.status === "pending"; i++) {
                q.step(i % 3 + 1);
            }
            const expected = minimumCost(g, from, to);
            expect(q.cost).toBe(expected);
            expect(q.status).toBe(
                Number.isFinite(expected) ? "found" : "unreachable",
            );
            if (q.status === "found") {
                const path = q.path;
                expect(path[0]).toBe(from);
                expect(path.at(-1)).toBe(to);
                let cost = 0;
                for (let i = 1; i < path.length; i++) {
                    expect(g.getNeighbors(path[i - 1])).toContain(path[i]);
                    cost += g.getCost(path[i - 1], path[i]);
                }
                expect(cost).toBe(expected);
            }
        }
    }
    const mesh = new NavMesh();
    for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
            mesh.addRect(new Vec2(x, y), new Vec2(1, 1));
        }
    }
    for (const g of [new NavGrid(2, 2, () => true), mesh]) {
        g.getCost = (a: number, b: number) => a === 0 && b === 1 ? 9 : 1;
        g.getHeuristic = () => 0;
        checkRoute(g, 0, 1);
        const query = g.createPathQuery(0, 1);
        for (let i = 0; i < 10 && query.status === "pending"; i++) {
            query.step(1);
        }
        expect(query.status).toBe("found");
        expect(query.cost).toBe(3);
        let cost = 0;
        for (let i = 1; i < query.path.length; i++) {
            cost += g.getCost(query.path[i - 1], query.path[i]);
        }
        expect(cost).toBe(3);
    }
});

test("synchronous grid waypoint results do not share endpoint vectors", () => {
    const grid = new NavGrid(3, 1, () => true, {
        tileWidth: 10,
        tileHeight: 10,
    });
    const start = new Vec2(2, 3), goal = new Vec2(28, 7);
    const first = grid.getWaypointPath(start, goal);
    const second = grid.getWaypointPath(start, goal);
    const expected = [new Vec2(2, 3), new Vec2(15, 5), new Vec2(28, 7)];
    expect(first).toEqual(expected);
    first[0].x = -100;
    first[first.length - 1].y = 200;
    first.length = 0;
    expect(second).toEqual(expected);
    expect(grid.getWaypointPath(start, goal)).toEqual(expected);
});

test("synchronous mesh waypoint results cannot mutate other results or centroids", () => {
    const mesh = new NavMesh();
    for (let x = 0; x < 30; x += 10) {
        mesh.addRect(new Vec2(x, 0), new Vec2(10, 10));
    }
    const start = new Vec2(2, 3), goal = new Vec2(28, 7);
    const first = mesh.getWaypointPath(start, goal, { type: "centroids" });
    const second = mesh.getWaypointPath(start, goal, { type: "centroids" });
    const expected = [new Vec2(2, 3), new Vec2(15, 5), new Vec2(28, 7)];
    expect(first).toEqual(expected);
    first[1].x = -500;
    first[0].y = 400;
    first[first.length - 1].x = 400;
    first.length = 0;
    expect(second).toEqual(expected);
    expect(mesh.getWaypointPath(start, goal, { type: "centroids" })).toEqual(
        expected,
    );
    expect(mesh.getPath(0, 2)).toEqual([0, 1, 2]);
});

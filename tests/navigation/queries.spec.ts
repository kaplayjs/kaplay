import { expect, test } from "@playwright/test";
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { config } from "../../scripts/lib/build";
import { NavGrid } from "../../src/math/navigationgrid";
import { NavMesh } from "../../src/math/navigationmesh";
import { Vec2 } from "../../src/math/Vec2";

declare const navigationComponents: any;

function graph(kind: string, length = 9): any {
    if (kind === "grid") return new NavGrid(length, 1, () => true);
    const mesh = new NavMesh();
    for (let i = 0; i < length; i++) {
        mesh.addRect(new Vec2(i, 0), new Vec2(1, 1));
    }
    return mesh;
}

function finish(query: any, budget = 1) {
    for (let i = 0; i < 10000 && query.status === "pending"; i++) {
        query.step(budget);
    }
    expect(query.status).not.toBe("pending");
    return query;
}

for (const kind of ["grid", "mesh"]) {
    test(`${kind} query spends only its requested budget and resumes`, () => {
        const g = graph(kind);
        let calls = 0;
        const neighbors = g.getNeighbors.bind(g);
        g.getNeighbors = (node: number) => {
            calls++;
            return neighbors(node);
        };
        const q = g.createPathQuery(0, 8);
        expect([q.status, q.expanded, calls, q.path, q.cost]).toEqual([
            "pending",
            0,
            0,
            [],
            Infinity,
        ]);
        expect(q.step(0)).toBe("pending");
        expect(calls).toBe(0);
        for (const budget of [1, 2, 1, 4]) {
            const before = calls;
            q.step(budget);
            expect(calls - before).toBeLessThanOrEqual(budget);
            expect(q.expanded).toBe(calls);
        }
        expect(q.status).toBe("found");
        expect(q.cost).toBe(8);
        expect(q.path).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
        expect(calls).toBe(8);
        q.step(500);
        q.cancel();
        expect([q.status, calls]).toEqual(["found", 8]);
    });

    test(`${kind} validates budgets atomically on pending and terminal queries`, () => {
        const g = graph(kind);
        const q = g.createPathQuery(0, 8);
        q.step(1);
        for (const terminal of [false, true]) {
            if (terminal) finish(q);
            const before = [q.status, q.expanded, q.cost, q.path];
            for (
                const invalid of [
                    -1,
                    0.5,
                    NaN,
                    Infinity,
                    Number.MAX_SAFE_INTEGER + 1,
                ]
            ) {
                expect(() => q.step(invalid)).toThrow(RangeError);
                expect([q.status, q.expanded, q.cost, q.path]).toEqual(before);
            }
        }
        expect(q.step(Number.MAX_SAFE_INTEGER)).toBe("found");
    });

    test(`${kind} settles invalid and local queries without expanding`, () => {
        const g = graph(kind);
        g.getNeighbors = () => {
            throw new Error("must not expand");
        };
        const local = g.createPathQuery(2, 2);
        expect([local.status, local.path, local.cost, local.expanded]).toEqual([
            "found",
            [2],
            0,
            0,
        ]);
        for (const bad of [-1, 9, 0.25, NaN, Infinity]) {
            for (const [a, b] of [[bad, 0], [0, bad], [bad, bad]]) {
                const q = g.createPathQuery(a, b);
                expect([q.status, q.path, q.cost, q.expanded]).toEqual([
                    "unreachable",
                    [],
                    Infinity,
                    0,
                ]);
                expect(q.step(1)).toBe("unreachable");
                q.cancel();
                expect(q.status).toBe("unreachable");
            }
        }
        const empty = graph(kind, 0).createPathQuery(0, 0);
        expect(empty.status).toBe("unreachable");
    });

    test(`${kind} independent interleaved queries and cancelled work stay isolated`, () => {
        const g = graph(kind);
        const left = g.createPathQuery(0, 8), right = g.createPathQuery(8, 0);
        left.step(2);
        right.step(1);
        left.cancel();
        left.cancel();
        const count = left.expanded;
        expect(left.step(50)).toBe("cancelled");
        expect([left.path, left.cost, left.expanded]).toEqual([
            [],
            Infinity,
            count,
        ]);
        finish(right);
        const path = right.path;
        path[0] = 999;
        path.push(888);
        expect(right.path).toEqual([8, 7, 6, 5, 4, 3, 2, 1, 0]);
        expect(finish(g.createPathQuery(0, 8)).path).toEqual([
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
        ]);
    });

    test(`${kind} exhaustion returns no partial route`, () => {
        const g = kind === "grid"
            ? new NavGrid(4, 1, (a, b) => Math.max(a, b) < 2)
            : graph("mesh", 2);
        if (g instanceof NavMesh) g.addRect(new Vec2(5, 0), new Vec2(1, 1));
        const q = (g as any).createPathQuery(0, kind === "grid" ? 3 : 2);
        q.step(1);
        expect([q.status, q.path, q.cost]).toEqual(["pending", [], Infinity]);
        finish(q);
        expect([q.status, q.path, q.cost, q.expanded]).toEqual([
            "unreachable",
            [],
            Infinity,
            2,
        ]);
    });

    test(`${kind} callback reentry, cancellation and exceptions respect terminal state`, () => {
        const g = graph(kind);
        const original = g.getNeighbors.bind(g);
        let q: any;
        g.getNeighbors = (node: number) => {
            const count = q.expanded;
            expect(q.step(100)).toBe("pending");
            expect(q.expanded).toBe(count);
            q.cancel();
            return original(node);
        };
        q = g.createPathQuery(0, 8);
        expect(q.step(100)).toBe("cancelled");
        expect(q.expanded).toBe(1);
        expect(q.path).toEqual([]);
        const error = new Error("caller failure");
        g.getNeighbors = () => {
            throw error;
        };
        q = g.createPathQuery(0, 8);
        let caught: unknown;
        try {
            q.step(1);
        } catch (e) {
            caught = e;
        }
        expect(caught).toBe(error);
        expect([q.status, q.expanded, q.path, q.cost]).toEqual([
            "cancelled",
            1,
            [],
            Infinity,
        ]);
        expect(q.step(100)).toBe("cancelled");
        g.getNeighbors = original;
        for (const hook of ["getCost"]) {
            const callback = g[hook].bind(g);
            g[hook] = () => {
                throw error;
            };
            q = g.createPathQuery(0, 8);
            caught = undefined;
            try {
                q.step(1);
            } catch (e) {
                caught = e;
            }
            expect(caught).toBe(error);
            expect([q.status, q.path, q.cost]).toEqual([
                "cancelled",
                [],
                Infinity,
            ]);
            expect(q.step(100)).toBe("cancelled");
            g[hook] = callback;
        }
        let workAfterCancellation = 0;
        let cancelled = false;
        g.getCost = () => {
            q.cancel();
            cancelled = true;
            return 1;
        };
        g.getHeuristic = () => {
            if (cancelled) workAfterCancellation++;
            return 0;
        };
        q = g.createPathQuery(0, 8);
        expect(q.step(100)).toBe("cancelled");
        expect(q.step(100)).toBe("cancelled");
        expect(workAfterCancellation).toBe(0);
    });

    for (
        const type of kind === "mesh"
            ? ["centroids", "edges"]
            : ["centroids"]
    ) {
        test(`${kind} ${type} waypoint queries capture inputs and detach results`, () => {
            const g = graph(kind, 4);
            const start = new Vec2(0.2, 0.3), goal = new Vec2(3.7, 0.6);
            const opt = { type };
            const expected = g.getWaypointPath(start, goal, opt).map((
                v: Vec2,
            ) => v.clone());
            const q = g.createWaypointQuery(start, goal, opt);
            start.x = 100;
            goal.y = 200;
            opt.type = type === "edges" ? "centroids" : "edges";
            expect(q.path).toEqual([]);
            finish(q);
            expect(q.cost).toBe(3);
            expect(q.path).toEqual(expected);
            const result = q.path;
            for (const v of result) {
                v.x = -99;
                v.y = -88;
            }
            result.length = 0;
            expect(q.path).toEqual(expected);
            expect(
                g.getWaypointPath(new Vec2(0.2, 0.3), new Vec2(3.7, 0.6), {
                    type,
                }),
            ).toEqual(expected);
            const same = g.createWaypointQuery(
                new Vec2(0.2, 0.3),
                new Vec2(0.8, 0.6),
                { type },
            );
            expect([same.status, same.cost, same.expanded]).toEqual([
                "found",
                0,
                0,
            ]);
            expect(same.path).toEqual([new Vec2(0.2, 0.3), new Vec2(0.8, 0.6)]);
            for (const outside of [new Vec2(-1, 0), new Vec2(5, 0)]) {
                expect(
                    g.createWaypointQuery(outside, new Vec2(0.5, 0.5), { type })
                        .status,
                ).toBe("unreachable");
                expect(
                    g.createWaypointQuery(new Vec2(0.5, 0.5), outside, { type })
                        .status,
                ).toBe("unreachable");
            }
        });
    }
}

async function browserModule(page: any) {
    const module = await build({
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
    await page.addScriptTag({ content: module.outputFiles[0].text });
}

for (const kind of ["grid", "mesh"]) {
    test(`${kind} component queries capture inputs and obey update budgets`, async ({ page }) => {
        await browserModule(page);
        const r = await page.evaluate(kind => {
            const k = navigationComponents.kaplay({ global: false });
            const g = kind === "grid"
                ? new k.NavGrid(8, 1, () => true)
                : new k.NavMesh();
            if (kind === "mesh") {
                for (let i = 0; i < 8; i++) {
                    g.addRect(k.vec2(i, 0), k.vec2(1, 1));
                }
            }
            const parent = k.add([
                navigationComponents.pathfinderMap({ graph: g }),
            ]);
            const opts = { searchBudget: 2, navigationOpt: { type: "edges" } };
            const obj = parent.add([k.pos(0.2, 0.3), k.pathfinder(opts)]);
            const target = k.vec2(7.8, 0.7);
            const expected = g.getWaypointPath(obj.pos, target, {
                type: "edges",
            });
            const q = obj.requestNavigationTo(target);
            const initial = [q.status, q.expanded, obj.navigationQuery === q];
            obj.pos.x = 2;
            target.x = 1;
            opts.navigationOpt.type = "centroids";
            const states = [];
            for (let i = 0; i < 4; i++) {
                obj.update();
                states.push(q.expanded);
            }
            const final = [q.status, q.cost, q.path[0], q.path.at(-1)];
            k.quit();
            return { initial, states, final, expected, path: q.path };
        }, kind);
        expect(r.path).toEqual(r.expected);
        expect(r.initial).toEqual(["pending", 0, true]);
        expect(r.states).toEqual([2, 4, 6, 7]);
        expect(r.final).toEqual(["found", 7, { x: 0.2, y: 0.3 }, {
            x: 7.8,
            y: 0.7,
        }]);
    });
}

test("component replacement and effective graph changes cancel only pending owned work", async ({ page }) => {
    await browserModule(page);
    const r = await page.evaluate(() => {
        const k = navigationComponents.kaplay({ global: false });
        const a = new k.NavGrid(100, 1, () => true),
            b = new k.NavGrid(100, 1, () => true);
        const parent = k.add([
            navigationComponents.pathfinderMap({ graph: a }),
        ]);
        const obj = parent.add([
            k.pos(0.2, 0.3),
            k.pathfinder({ searchBudget: 1 }),
        ]);
        const independent = k.add([
            k.pos(0.2, 0.3),
            k.pathfinder({ graph: a, searchBudget: 1 }),
        ]);
        const old = obj.requestNavigationTo(k.vec2(99.5, 0.5));
        const other = independent.requestNavigationTo(k.vec2(99.5, 0.5));
        obj.update();
        const next = obj.requestNavigationTo(k.vec2(50.5, 0.5));
        parent.graph = b;
        obj.update();
        const inherited = [
            old.status,
            next.status,
            next.expanded,
            other.status,
        ];
        const explicit = k.add([k.pos(0.2, 0.3), k.pathfinder({ graph: a })]);
        const q = explicit.requestNavigationTo(k.vec2(99.5, 0.5));
        explicit.graph = a;
        const same = q.status;
        explicit.graph = b;
        const changed = q.status;
        independent.update();
        const count = other.expanded;
        k.quit();
        return { inherited, same, changed, count };
    });
    expect(r).toEqual({
        inherited: ["cancelled", "cancelled", 0, "pending"],
        same: "pending",
        changed: "cancelled",
        count: 1,
    });
});

for (const action of ["unuse", "replace", "destroy", "clear-and-destroy"]) {
    test(`component ${action} stops retained requests and methods`, async ({ page }) => {
        await browserModule(page);
        const r = await page.evaluate(action => {
            const k = navigationComponents.kaplay({ global: false });
            const g = new k.NavGrid(100, 1, () => true);
            const obj = k.add([
                k.pos(0.2, 0.3),
                k.pathfinder({ graph: g, searchBudget: 1 }),
            ]);
            const retained = obj.requestNavigationTo.bind(obj);
            const q = retained(k.vec2(99.5, 0.5));
            obj.update();
            if (action === "unuse") obj.unuse("pathfinder");
            if (action === "replace") obj.use(k.pathfinder({ graph: g }));
            if (action === "destroy") obj.destroy();
            if (action === "clear-and-destroy") {
                obj.clearEvents();
                obj.destroy();
            }
            const cancelledAtDisposal = [q.status, q.expanded];
            let expansionsAfterDisposal = 0;
            const neighbors = g.getNeighbors.bind(g);
            g.getNeighbors = (node: number) => {
                expansionsAfterDisposal++;
                return neighbors(node);
            };
            let returned: any;
            try {
                returned = retained(k.vec2(2.5, 0.5));
            } catch {
                // A disposed instance may reject the request instead of returning a handle.
            }
            obj.update();
            const state = [
                ...cancelledAtDisposal,
                returned?.status !== "pending",
                expansionsAfterDisposal,
            ];
            q.step(100);
            const after = [q.status, q.expanded];
            k.quit();
            return { state, after };
        }, action);
        expect(r).toEqual({
            state: ["cancelled", 1, true, 0],
            after: ["cancelled", 1],
        });
    });
}

test("component defaults, zero budget, pause and custom graph compatibility", async ({ page }) => {
    await browserModule(page);
    const r = await page.evaluate(() => {
        const k = navigationComponents.kaplay({ global: false });
        const g = new k.NavGrid(200, 1, () => true);
        const obj = k.add([k.pos(0.2, 0.3), k.pathfinder({ graph: g })]);
        const q = obj.requestNavigationTo(k.vec2(199.5, 0.5));
        obj.update();
        const defaultCount = q.expanded;
        const zero = k.add([
            k.pos(0.2, 0.3),
            k.pathfinder({ graph: g, searchBudget: 0 }),
        ]);
        const z = zero.requestNavigationTo(k.vec2(199.5, 0.5));
        zero.update();
        const zeroCount = z.expanded;
        z.step(1);
        const manual = z.expanded;
        obj.paused = true;
        obj.update();
        const pausedCount = q.expanded;
        obj.paused = false;
        obj.update();
        const resumedCount = q.expanded;
        const errors = [-1, 0.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]
            .map(value => {
                try {
                    k.pathfinder({ graph: g, searchBudget: value });
                    return false;
                } catch (e) {
                    return e instanceof RangeError;
                }
            });
        const legacy = {
            nodes: [0],
            getNeighbors: () => [],
            getCost: () => 0,
            getHeuristic: () => 0,
            getPath: () => [0],
            getWaypointPath: (a: any, b: any) => [a, b],
        };
        const custom = k.add([k.pos(0, 0), k.pathfinder({ graph: legacy })]);
        const none = k.add([k.pos(0, 0), k.pathfinder({})]);
        const compatibility = [
            custom.requestNavigationTo(k.vec2(1, 1)) === undefined,
            none.requestNavigationTo(k.vec2(1, 1)) === undefined,
            custom.navigateTo(k.vec2(1, 1)).length,
            none.navigateTo(k.vec2(1, 1)) === undefined,
        ];
        k.quit();
        return {
            defaultCount,
            zeroCount,
            manual,
            pausedCount,
            resumedCount,
            errors,
            compatibility,
        };
    });
    expect(r).toEqual({
        defaultCount: 64,
        zeroCount: 0,
        manual: 1,
        pausedCount: 64,
        resumedCount: 128,
        errors: [true, true, true, true, true],
        compatibility: [true, true, 2, true],
    });
});

test("public query types and legacy Graph implementations remain usable", () => {
    const folder = mkdtempSync(join(tmpdir(), "navigation-types-"));
    try {
        const declaration = resolve("dist/doc.d.ts").replaceAll("\\", "/");
        const source =
            `import type { PathQuery, Graph, NavGrid, NavMesh, Vec2, PathfinderComp } from ${
                JSON.stringify(declaration)
            };
            declare const grid: NavGrid, mesh: NavMesh, point: Vec2, comp: PathfinderComp;
            const nodes: PathQuery<number> = grid.createPathQuery(0, 1);
            const gridPoints: PathQuery<Vec2> = grid.createWaypointQuery(point, point, {});
            const waypoints: PathQuery<Vec2> = mesh.createWaypointQuery(point, point, { type: "edges" });
            const status: "pending" | "found" | "unreachable" | "cancelled" = nodes.step(1);
            const current: PathQuery<Vec2> | undefined = comp.requestNavigationTo(point);
            const latest: PathQuery<Vec2> | undefined = comp.navigationQuery;
            const old: Graph = { nodes: [], getNeighbors: n => [], getCost: (a,b) => 1,
                getHeuristic: (a,b) => 0, getPath: (a,b) => [], getWaypointPath: (a,b) => [] };
            // @ts-expect-error query state is read-only
            nodes.status = "found";
            // @ts-expect-error accounting is read-only
            nodes.expanded = 0;
            // @ts-expect-error the result property is read-only
            nodes.path = [];
            // @ts-expect-error the result cost is read-only
            nodes.cost = 0;
            // @ts-expect-error the latest component query is read-only
            comp.navigationQuery = undefined;`;
        const file = join(folder, "consumer.ts");
        writeFileSync(file, source);
        execFileSync(process.execPath, [
            "node_modules/typescript/bin/tsc",
            "--strict",
            "--skipLibCheck",
            "--noEmit",
            "--target",
            "esnext",
            "--moduleResolution",
            "bundler",
            "--module",
            "esnext",
            file,
        ], { stdio: "inherit" });
    } finally {
        rmSync(folder, { recursive: true, force: true });
    }
});

test("map requests share a budget fairly across updates and skip settled work", async ({ page }) => {
    await browserModule(page);
    const r = await page.evaluate(() => {
        const k = navigationComponents.kaplay({ global: false });
        const g = new k.NavGrid(10, 1, () => true);
        const owner = k.add([
            navigationComponents.pathfinderMap({ graph: g, searchBudget: 2 }),
        ]);
        const a = owner.requestNavigation(k.vec2(0.2, 0.3), k.vec2(9.8, 0.7));
        const b = owner.requestNavigation(k.vec2(9.8, 0.7), k.vec2(0.2, 0.3));
        const c = owner.requestNavigation(k.vec2(0.2, 0.3), k.vec2(1.8, 0.7));
        const states = [];
        for (let i = 0; i < 3; i++) {
            owner.update();
            states.push([a.expanded, b.expanded, c.expanded]);
        }
        b.cancel();
        owner.update();
        const after = [a.expanded, b.expanded, c.status, c.cost];
        const outside = owner.requestNavigation(k.vec2(-1, 0), k.vec2(0, 0));
        owner.graph = new k.NavGrid(10, 1, () => true);
        const changed = [a.status, b.status, c.status, outside.status];
        k.quit();
        return { states, after, changed };
    });
    expect(r).toEqual({
        states: [[1, 1, 0], [2, 1, 1], [3, 2, 1]],
        after: [5, 2, "found", 1],
        changed: ["cancelled", "cancelled", "found", "unreachable"],
    });
});

for (const action of ["unuse", "replace", "destroy", "clear-and-destroy"]) {
    test(`map ${action} cancels its whole queue without reviving retained methods`, async ({ page }) => {
        await browserModule(page);
        const r = await page.evaluate(action => {
            const k = navigationComponents.kaplay({ global: false });
            const graph = new k.NavGrid(100, 1, () => true);
            const owner = k.add([
                navigationComponents.pathfinderMap({ graph, searchBudget: 1 }),
            ]);
            const request = owner.requestNavigation.bind(owner);
            const a = request(k.vec2(0.2, 0.3), k.vec2(99.5, 0.5));
            const b = request(k.vec2(99.5, 0.5), k.vec2(0.2, 0.3));
            owner.update();
            if (action === "unuse") owner.unuse("pathfinderMap");
            if (action === "replace") {
                owner.use(navigationComponents.pathfinderMap({ graph }));
            }
            if (action === "destroy") owner.destroy();
            if (action === "clear-and-destroy") {
                owner.clearEvents();
                owner.destroy();
            }
            const cancelledAtDisposal = [
                a.status,
                b.status,
                a.expanded,
                b.expanded,
            ];
            let expansionsAfterDisposal = 0;
            const neighbors = graph.getNeighbors.bind(graph);
            graph.getNeighbors = (node: number) => {
                expansionsAfterDisposal++;
                return neighbors(node);
            };
            let returned: any;
            try {
                returned = request(k.vec2(0, 0), k.vec2(1, 0));
            } catch {
                // Rejection and a terminal result are both valid disposal policies.
            }
            owner.update();
            const state = [
                ...cancelledAtDisposal,
                returned?.status !== "pending",
                expansionsAfterDisposal,
            ];
            k.quit();
            return state;
        }, action);
        expect(r).toEqual(["cancelled", "cancelled", 1, 0, true, 0]);
    });
}

test("map and child budgets are independent and map pause, zero and defaults work", async ({ page }) => {
    await browserModule(page);
    const r = await page.evaluate(() => {
        const k = navigationComponents.kaplay({ global: false });
        const g = new k.NavGrid(200, 1, () => true);
        const map = k.add([navigationComponents.pathfinderMap({ graph: g })]);
        const a = map.requestNavigation(k.vec2(0.2, 0.3), k.vec2(199.5, 0.5));
        const b = map.requestNavigation(k.vec2(199.5, 0.5), k.vec2(0.2, 0.3));
        const child = map.add([
            k.pos(0.2, 0.3),
            k.pathfinder({ searchBudget: 1 }),
        ]);
        const c = child.requestNavigationTo(k.vec2(199.5, 0.5));
        map.update();
        const first = [a.expanded, b.expanded, c.expanded];
        map.paused = true;
        map.update();
        const paused = [a.expanded, b.expanded, c.expanded];
        map.paused = false;
        map.update();
        const resumed = [a.expanded, b.expanded, c.expanded];
        const zero = k.add([
            navigationComponents.pathfinderMap({ graph: g, searchBudget: 0 }),
        ]);
        const z = zero.requestNavigation(k.vec2(0.2, 0.3), k.vec2(199.5, 0.5));
        zero.update();
        const noWork = z.expanded;
        const invalid = [-1, 0.25, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]
            .map(searchBudget => {
                try {
                    navigationComponents.pathfinderMap({
                        graph: g,
                        searchBudget,
                    });
                    return false;
                } catch (e) {
                    return e instanceof RangeError;
                }
            });
        const missing = k.add([navigationComponents.pathfinderMap({})]);
        const absent =
            missing.requestNavigation(k.vec2(0, 0), k.vec2(1, 1)) === undefined;
        k.quit();
        return { first, paused, resumed, noWork, invalid, absent };
    });
    expect(r).toEqual({
        first: [32, 32, 1],
        paused: [32, 32, 1],
        resumed: [64, 64, 2],
        noWork: 0,
        invalid: [true, true, true, true, true],
        absent: true,
    });
});

test("map mesh requests capture endpoints and both waypoint modes", async ({ page }) => {
    await browserModule(page);
    const results = await page.evaluate(() => {
        const k = navigationComponents.kaplay({ global: false });
        const graph = new k.NavMesh();
        for (let x = 0; x < 40; x += 10) {
            graph.addRect(k.vec2(x, 0), k.vec2(10, 10));
        }
        const results = [];
        for (const type of ["centroids", "edges"]) {
            const owner = k.add([
                navigationComponents.pathfinderMap({ graph, searchBudget: 1 }),
            ]);
            const from = k.vec2(2, 3), to = k.vec2(38, 7), options = { type };
            const expected = graph.getWaypointPath(from, to, options);
            const query = owner.requestNavigation(from, to, options);
            from.x = -100;
            to.x = 1000;
            options.type = type === "edges" ? "centroids" : "edges";
            for (let i = 0; i < 10 && query.status === "pending"; i++) {
                owner.update();
            }
            results.push({ status: query.status, path: query.path, expected });
            owner.destroy();
        }
        k.quit();
        return results;
    });
    for (const r of results) {
        expect(r.status).toBe("found");
        expect(r.path).toEqual(r.expected);
    }
});

test("map graph changes and owner destruction cancel work inside callbacks", async ({ page }) => {
    await browserModule(page);
    const results = await page.evaluate(() => {
        const k = navigationComponents.kaplay({ global: false });
        const results = [];
        for (const action of ["graph", "destroy"]) {
            const graph = new k.NavGrid(9, 1, () => true);
            const owner = k.add([
                navigationComponents.pathfinderMap({ graph, searchBudget: 2 }),
            ]);
            let a: any, b: any;
            const neighbors = graph.getNeighbors.bind(graph);
            let calls = 0;
            let during: string[] = [];
            graph.getNeighbors = (node: number) => {
                calls++;
                const result = neighbors(node);
                if (action === "graph") {
                    owner.graph = new k.NavGrid(9, 1, () => true);
                }
                else owner.destroy();
                during = [a.status, b.status];
                return result;
            };
            a = owner.requestNavigation(
                k.vec2(0.2, 0.3),
                k.vec2(8.8, 0.7),
            );
            b = owner.requestNavigation(
                k.vec2(8.8, 0.7),
                k.vec2(0.2, 0.3),
            );
            owner.update();
            a.step(100);
            b.step(100);
            results.push({ during, after: [a.status, b.status], calls });
            if (action === "graph") owner.destroy();
        }
        k.quit();
        return results;
    });
    expect(results).toEqual(
        Array(2).fill({
            during: ["cancelled", "cancelled"],
            after: ["cancelled", "cancelled"],
            calls: 1,
        }),
    );
});

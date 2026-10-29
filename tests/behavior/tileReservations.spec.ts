import { expect, test } from "@playwright/test";
import { checkPublicTypes } from "./publicTypes";

test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: 0 });
    await page.clock.pauseAt(1000000);
    await page.addScriptTag({ path: "dist/kaplay.js" });
    await page.evaluate(() => {
        const k = kaplay();
        const level = k.addLevel(["....", "....", "...."], {
            tileWidth: 16,
            tileHeight: 24,
            tiles: { ".": () => [] },
        });
        if (k.tileReservations) level.use(k.tileReservations());
        const a = level.spawn([k.pos()], k.vec2(0, 0));
        const b = level.spawn([k.pos()], k.vec2(1, 0));
        Object.assign(window, { k, level, a, b });
    });
});

test("bookings occupy authored ticks and include the final held tick", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a } = window as any;
        const handle = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0), k.vec2(1, 0)],
            startTick: 2,
            holdUntil: 5,
        });
        return {
            active: handle.active,
            clock: level.reservationTick,
            occupancy: [
                level.reservationOwner(k.vec2(0, 0), 1) === null,
                level.reservationOwner(k.vec2(0, 0), 2) === a,
                level.reservationOwner(k.vec2(0, 0), 3) === null,
                level.reservationOwner(k.vec2(1, 0), 3) === a,
                level.reservationOwner(k.vec2(1, 0), 5) === a,
                level.reservationOwner(k.vec2(1, 0), 6) === null,
            ],
            pos: [a.pos.x, a.pos.y],
        };
    });
    expect(result).toEqual({
        active: true,
        clock: 0,
        occupancy: [true, true, true, true, true, true],
        pos: [0, 0],
    });
});

for (const conflict of ["vertex", "swap", "wait", "held destination"]) {
    test(`rejects a ${conflict} conflict while preserving the first booking`, async ({ page }) => {
        const result = await page.evaluate(conflict => {
            const { k, level, a, b } = window as any;
            const first = level.reserveRoute(a, {
                tiles: [k.vec2(0, 0), k.vec2(1, 0)],
                startTick: 0,
                holdUntil: 4,
            });
            const plans = {
                vertex: { tiles: [k.vec2(2, 0), k.vec2(1, 0)], startTick: 0 },
                swap: { tiles: [k.vec2(1, 0), k.vec2(0, 0)], startTick: 0 },
                wait: { tiles: [k.vec2(1, 0), k.vec2(1, 0)], startTick: 0 },
                "held destination": { tiles: [k.vec2(1, 0)], startTick: 4 },
            };
            return {
                rejected: level.reserveRoute(b, plans[conflict]) === null,
                active: first.active,
                owner: level.reservationOwner(k.vec2(1, 0), 4) === a,
                prefixClear: level.reservationOwner(k.vec2(2, 0), 0) === null,
            };
        }, conflict);
        expect(result).toEqual({
            rejected: true,
            active: true,
            owner: true,
            prefixClear: true,
        });
    });
}

test("waiting, revisiting a tile, and disjoint times are accepted", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const first = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0), k.vec2(0, 0), k.vec2(1, 0), k.vec2(0, 0)],
            startTick: 0,
        });
        const second = level.reserveRoute(b, {
            tiles: [k.vec2(0, 0), k.vec2(1, 0)],
            startTick: 4,
        });
        return {
            first: first.active,
            second: second.active,
            waiting: level.reservationOwner(k.vec2(0, 0), 1) === a,
            final: level.reservationOwner(k.vec2(0, 0), 3) === a,
            later: level.reservationOwner(k.vec2(0, 0), 4) === b,
            afterArrival: level.reservationOwner(k.vec2(1, 0), 6),
        };
    });
    expect(result).toEqual({
        first: true,
        second: true,
        waiting: true,
        final: true,
        later: true,
        afterArrival: null,
    });
});

test("rebooking ignores its own occupancy and removes the entire previous booking", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const old = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0), k.vec2(1, 0)],
            startTick: 0,
            holdUntil: 8,
        });
        const newer = level.reserveRoute(a, {
            tiles: [k.vec2(1, 0), k.vec2(0, 0)],
            startTick: 0,
        });
        old.cancel();
        old.cancel();
        const other = level.reserveRoute(b, {
            tiles: [k.vec2(1, 0)],
            startTick: 2,
        });
        return {
            old: old.active,
            newer: newer.active,
            other: other.active,
            source: level.reservationOwner(k.vec2(1, 0), 0) === a,
            destination: level.reservationOwner(k.vec2(0, 0), 1) === a,
            cleared: level.reservationOwner(k.vec2(1, 0), 8) === null,
        };
    });
    expect(result).toEqual({
        old: false,
        newer: true,
        other: true,
        source: true,
        destination: true,
        cleared: true,
    });
});

for (const kind of ["conflict", "invalid"]) {
    test(`a ${kind} replacement leaves the old booking and handle intact`, async ({ page }) => {
        const result = await page.evaluate(kind => {
            const { k, level, a, b } = window as any;
            const original = level.reserveRoute(a, {
                tiles: [k.vec2(0, 0)],
                startTick: 0,
                holdUntil: 8,
            });
            level.reserveRoute(b, {
                tiles: [k.vec2(1, 0)],
                startTick: 0,
                holdUntil: 8,
            });
            const result = level.reserveRoute(a, {
                tiles: [k.vec2(kind === "conflict" ? 1 : -1, 0)],
                startTick: 0,
            });
            const before = [
                result === null,
                original.active,
                level.reservationOwner(k.vec2(0, 0), 8) === a,
            ];
            original.cancel();
            return {
                before,
                active: original.active,
                cleared: level.reservationOwner(k.vec2(0, 0), 8) === null,
                other: level.reservationOwner(k.vec2(1, 0), 8) === b,
            };
        }, kind);
        expect(result).toEqual({
            before: [true, true, true],
            active: false,
            cleared: true,
            other: true,
        });
    });
}

test("accepted plan coordinates and arrays are snapshots", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a } = window as any;
        const first = k.vec2(0, 0);
        const last = k.vec2(1, 0);
        const plan = { tiles: [first, last], startTick: 2, holdUntil: 6 };
        const handle = level.reserveRoute(a, plan);
        first.x = 3;
        last.y = 2;
        plan.tiles.reverse();
        plan.tiles.length = 0;
        plan.startTick = 9;
        plan.holdUntil = 20;
        return {
            active: handle.active,
            source: level.reservationOwner(k.vec2(0, 0), 2) === a,
            destination: level.reservationOwner(k.vec2(1, 0), 6) === a,
            after: level.reservationOwner(k.vec2(1, 0), 7) === null,
        };
    });
    expect(result).toEqual({
        active: true,
        source: true,
        destination: true,
        after: true,
    });
});

test("advancing expires past slots and only deactivates past the final tick", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const handle = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0), k.vec2(1, 0)],
            startTick: 0,
            holdUntil: 3,
        });
        level.advanceReservations(3);
        const atEnd = [
            handle.active,
            level.reservationOwner(k.vec2(0, 0), 0) === null,
            level.reservationOwner(k.vec2(1, 0), 3) === a,
        ];
        level.advanceReservations(3);
        level.advanceReservations(4);
        const newHandle = level.reserveRoute(b, {
            tiles: [k.vec2(1, 0)],
            startTick: 4,
        });
        handle.cancel();
        return {
            atEnd,
            old: handle.active,
            clock: level.reservationTick,
            newActive: newHandle.active,
            owner: level.reservationOwner(k.vec2(1, 0), 4) === b,
        };
    });
    expect(result).toEqual({
        atEnd: [true, true, true],
        old: false,
        clock: 4,
        newActive: true,
        owner: true,
    });
});

test("safe-integer boundary ticks and long holds use the full interval", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const end = Number.MAX_SAFE_INTEGER;
        const handle = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0)],
            startTick: 0,
            holdUntil: end,
        });
        const conflict = level.reserveRoute(b, {
            tiles: [k.vec2(0, 0)],
            startTick: end,
        });
        const overflow = level.reserveRoute(b, {
            tiles: [k.vec2(1, 0), k.vec2(2, 0)],
            startTick: end,
        });
        const exact = level.reserveRoute(b, {
            tiles: [k.vec2(1, 0), k.vec2(2, 0)],
            startTick: end - 1,
        });
        const exactBoundary = [
            exact?.active === true,
            level.reservationOwner(k.vec2(1, 0), end - 1) === b,
            level.reservationOwner(k.vec2(2, 0), end) === b,
        ];
        level.advanceReservations(end);
        const atEnd = [
            handle.active,
            level.reservationOwner(k.vec2(0, 0), end) === a,
        ];
        handle.cancel();
        const accepted = level.reserveRoute(b, {
            tiles: [k.vec2(0, 0)],
            startTick: end,
        });
        return {
            rejected: [conflict === null, overflow === null],
            exactBoundary,
            atEnd,
            accepted: accepted.active,
        };
    });
    expect(result).toEqual({
        rejected: [true, true],
        exactBoundary: [true, true, true],
        atEnd: [true, true],
        accepted: true,
    });
});

for (
    const kind of [
        "empty",
        "negative coordinate",
        "negative y coordinate",
        "right bound",
        "bottom bound",
        "fractional coordinate",
        "diagonal",
        "jump",
        "negative tick",
        "fractional tick",
        "unsafe tick",
        "past start",
        "early hold",
        "invalid hold",
        "fractional hold",
        "unsafe hold",
    ]
) {
    test(`rejects a plan with ${kind}`, async ({ page }) => {
        const result = await page.evaluate(kind => {
            const { k, level, a } = window as any;
            level.advanceReservations(2);
            const plan = {
                tiles: [k.vec2(0, 0), k.vec2(1, 0)],
                startTick: 2,
                holdUntil: 3,
            };
            if (kind === "empty") plan.tiles = [];
            if (kind === "negative coordinate") plan.tiles[0].x = -1;
            if (kind === "negative y coordinate") plan.tiles = [k.vec2(0, -1)];
            if (kind === "right bound") plan.tiles = [k.vec2(4, 0)];
            if (kind === "bottom bound") plan.tiles = [k.vec2(0, 3)];
            if (kind === "fractional coordinate") plan.tiles[0].x = 0.5;
            if (kind === "diagonal") plan.tiles[1] = k.vec2(1, 1);
            if (kind === "jump") plan.tiles[1].x = 2;
            if (kind === "negative tick") plan.startTick = -1;
            if (kind === "fractional tick") plan.startTick = 2.5;
            if (kind === "unsafe tick") {
                plan.startTick = Number.MAX_SAFE_INTEGER + 1;
            }
            if (kind === "past start") plan.startTick = 1;
            if (kind === "early hold") plan.holdUntil = 2;
            if (kind === "invalid hold") plan.holdUntil = NaN;
            if (kind === "fractional hold") plan.holdUntil = 3.5;
            if (kind === "unsafe hold") {
                plan.holdUntil = Number.MAX_SAFE_INTEGER + 1;
            }
            const fractionalYRejected = kind !== "fractional coordinate"
                || level.reserveRoute(a, {
                        tiles: [k.vec2(0, 0.5)],
                        startTick: 2,
                    }) === null;
            return {
                rejected: level.reserveRoute(a, plan) === null,
                fractionalYRejected,
                empty: level.reservationOwner(k.vec2(0, 0), 2) === null,
                clock: level.reservationTick,
            };
        }, kind);
        expect(result).toEqual({
            rejected: true,
            fractionalYRejected: true,
            empty: true,
            clock: 2,
        });
    });
}

test("corner coordinates, singleton routes, and exact arrival holds are valid", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const aPlan = level.reserveRoute(a, {
            tiles: [k.vec2(3, 2)],
            startTick: 0,
        });
        const bPlan = level.reserveRoute(b, {
            tiles: [k.vec2(0, 0), k.vec2(0, 1)],
            startTick: 0,
            holdUntil: 1,
        });
        return [
            aPlan.active,
            bPlan.active,
            level.reservationOwner(k.vec2(3, 2), 0) === a,
            level.reservationOwner(k.vec2(0, 1), 1) === b,
        ];
    });
    expect(result).toEqual([true, true, true, true]);
});

test("invalid queries are empty and invalid clock advances are atomic", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a } = window as any;
        const handle = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0)],
            startTick: 2,
            holdUntil: 9,
        });
        level.advanceReservations(2);
        const badTicks = [
            -1,
            1,
            2.5,
            NaN,
            Infinity,
            Number.MAX_SAFE_INTEGER + 1,
        ];
        const rejected = badTicks.map(tick => {
            try {
                level.advanceReservations(tick);
                return false;
            } catch (e) {
                return e instanceof RangeError;
            }
        });
        const emptyTicks = badTicks.map(tick =>
            level.reservationOwner(k.vec2(0, 0), tick) === null
        );
        const emptyTiles = [
            k.vec2(-1, 0),
            k.vec2(4, 0),
            k.vec2(0, 3),
            k.vec2(0.5, 0),
            k.vec2(NaN, 0),
        ].map(tile => level.reservationOwner(tile, 2) === null);
        return {
            rejected,
            emptyTicks,
            emptyTiles,
            active: handle.active,
            clock: level.reservationTick,
            preserved: level.reservationOwner(k.vec2(0, 0), 9) === a,
        };
    });
    expect(result).toEqual({
        rejected: Array(6).fill(true),
        emptyTicks: Array(6).fill(true),
        emptyTiles: Array(5).fill(true),
        active: true,
        clock: 2,
        preserved: true,
    });
});

test("owners must be live direct children of the booking level", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const handles = [a, b].map((owner, x) =>
            level.reserveRoute(owner, {
                tiles: [k.vec2(x, 0)],
                startTick: 0,
                holdUntil: 9,
            })
        );
        const outsider = k.add([]);
        const grandchild = a.add([]);
        const dead = level.add([]);
        dead.destroy();
        const plan = { tiles: [k.vec2(2, 0)], startTick: 0 };
        return [outsider, grandchild, dead, null].map(owner => {
            const rejected = level.reserveRoute(owner, plan) === null;
            return {
                rejected,
                active: handles.map(handle => handle.active),
                preserved: [a, b].map((bookedOwner, x) =>
                    level.reservationOwner(k.vec2(x, 0), 9) === bookedOwner
                ),
                empty: level.reservationOwner(k.vec2(2, 0), 0) === null,
            };
        });
    });
    expect(result).toEqual(
        Array(4).fill({
            rejected: true,
            active: [true, true],
            preserved: [true, true],
            empty: true,
        }),
    );
});

test("destroying an owner releases only that owner's current booking", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const old = level.reserveRoute(a, {
            tiles: [k.vec2(2, 0)],
            startTick: 0,
        });
        const current = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0)],
            startTick: 0,
            holdUntil: 4,
        });
        const other = level.reserveRoute(b, {
            tiles: [k.vec2(1, 0)],
            startTick: 0,
            holdUntil: 4,
        });
        a.destroy();
        old.cancel();
        current.cancel();
        return {
            inactive: [!old.active, !current.active],
            other: other.active,
            empty: level.reservationOwner(k.vec2(0, 0), 4) === null,
            owner: level.reservationOwner(k.vec2(1, 0), 4) === b,
        };
    });
    expect(result).toEqual({
        inactive: [true, true],
        other: true,
        empty: true,
        owner: true,
    });
});

for (const operation of ["remove", "replace", "destroy"]) {
    test(`${operation} releases the level's bookings without stale-handle interference`, async ({ page }) => {
        const result = await page.evaluate(operation => {
            const { k, level, a, b } = window as any;
            const old = level.reserveRoute(a, {
                tiles: [k.vec2(0, 0)],
                startTick: 0,
                holdUntil: 8,
            });
            const other = level.reserveRoute(b, {
                tiles: [k.vec2(1, 0)],
                startTick: 0,
                holdUntil: 8,
            });
            const replacement = k.tileReservations();
            if (operation === "remove") level.unuse(replacement.id);
            if (operation === "replace") level.use(replacement);
            if (operation === "destroy") level.destroy();
            let fresh = null;
            if (operation === "remove") level.use(replacement);
            if (operation !== "destroy") {
                fresh = level.reserveRoute(a, {
                    tiles: [k.vec2(0, 0)],
                    startTick: 0,
                });
            }
            old.cancel();
            other.cancel();
            return {
                inactive: [!old.active, !other.active],
                fresh: fresh ? fresh.active : null,
                owner: fresh
                    ? level.reservationOwner(k.vec2(0, 0), 0) === a
                    : null,
            };
        }, operation);
        expect(result).toEqual({
            inactive: [true, true],
            fresh: operation === "destroy" ? null : true,
            owner: operation === "destroy" ? null : true,
        });
    });
}

test("independent levels keep clocks and identical tile bookings separate", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a } = window as any;
        const otherLevel = k.addLevel(["...."], {
            tileWidth: 16,
            tileHeight: 16,
            tiles: { ".": () => [] },
        });
        otherLevel.use(k.tileReservations());
        const other = otherLevel.add([]);
        const one = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0)],
            startTick: 0,
        });
        const two = otherLevel.reserveRoute(other, {
            tiles: [k.vec2(0, 0)],
            startTick: 0,
        });
        level.advanceReservations(1);
        one.cancel();
        return {
            one: one.active,
            two: two.active,
            clock: otherLevel.reservationTick,
            owner: otherLevel.reservationOwner(k.vec2(0, 0), 0) === other,
        };
    });
    expect(result).toEqual({ one: false, two: true, clock: 0, owner: true });
});

test("bookings preserve spatial occupancy and pathfinding results", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const before = level.getTilePath(k.vec2(0, 0), k.vec2(3, 2)).map(
            p => [p.x, p.y],
        );
        const occupants = level.getAt(k.vec2(0, 0)).slice();
        level.reserveRoute(a, {
            tiles: [k.vec2(2, 2)],
            startTick: 0,
            holdUntil: 100,
        });
        level.reserveRoute(b, {
            tiles: [k.vec2(1, 1), k.vec2(1, 2)],
            startTick: 0,
        });
        const after = level.getTilePath(k.vec2(0, 0), k.vec2(3, 2)).map(
            p => [p.x, p.y],
        );
        return {
            before,
            after,
            same: level.getAt(k.vec2(0, 0)).length === occupants.length
                && level.getAt(k.vec2(0, 0)).every((obj, i) =>
                    obj === occupants[i]
                ),
            pos: [a.pos.x, a.pos.y, b.pos.x, b.pos.y],
        };
    });
    expect(result.after).toEqual(result.before);
    expect(result.same).toBe(true);
    expect(result.pos).toEqual([0, 0, 16, 0]);
});

test("malformed plan values are rejected without replacing a booking", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a } = window as any;
        const original = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0)],
            startTick: 0,
        });
        const bad = [
            null,
            {},
            { tiles: null, startTick: 0 },
            { tiles: [], startTick: 0 },
            { tiles: [null], startTick: 0 },
            { tiles: [k.vec2(0, 0)], startTick: NaN },
            { tiles: [k.vec2(0, 0)], startTick: 0, holdUntil: null },
        ];
        return {
            rejected: bad.map(plan => level.reserveRoute(a, plan) === null),
            active: original.active,
            owner: level.reservationOwner(k.vec2(0, 0), 0) === a,
            invalidQuery: level.reservationOwner(null, 0) === null,
        };
    });
    expect(result).toEqual({
        rejected: Array(7).fill(true),
        active: true,
        owner: true,
        invalidQuery: true,
    });
});

test("public declarations support typed definitions and results", () => {
    checkPublicTypes(`
const level = k.addLevel([".."], { tileWidth: 16, tileHeight: 16, tiles: { ".": () => [] } });
const reservations = k.tileReservations();
level.use(reservations);
const attached = level as typeof level & typeof reservations;
const owner = level.add([k.pos()]);
const tiles: readonly ReturnType<typeof k.vec2>[] = [k.vec2(0, 0)];
const handle = attached.reserveRoute(owner, { tiles, startTick: 0, holdUntil: 3 });
if (handle) { const active: boolean = handle.active; handle.cancel(); }
const found = attached.reservationOwner(k.vec2(0, 0), 0);
if (found) { const exists: boolean = found.exists(); }
attached.advanceReservations(1);
const edits = [{ owner, plan: { tiles, startTick: 1 } }, { owner, plan: null }] as const;
const batch = attached.reserveRoutes(edits);
if (batch) {
    for (const item of batch) if (item) {
        const active: boolean = item.active;
        item.cancel();
        // @ts-expect-error batch handles are read-only
        item.active = true;
        // @ts-expect-error batch handle activity is boolean
        const invalid: string = item.active;
    }
}
// @ts-expect-error group owners must be game objects
attached.reserveRoutes([{ owner: {}, plan: null }]);
// @ts-expect-error an entry requires its plan, including explicit null for release
attached.reserveRoutes([{ owner }]);
// @ts-expect-error a group plan still requires its tiles
attached.reserveRoutes([{ owner, plan: { startTick: 1 } }]);
// @ts-expect-error group start ticks are numeric
attached.reserveRoutes([{ owner, plan: { tiles, startTick: "now" } }]);
const tick: number = attached.reservationTick;
// @ts-expect-error the clock is numeric
const invalidClock: string = attached.reservationTick;
// @ts-expect-error the clock is read-only
attached.reservationTick = 2;
if (handle) {
    // @ts-expect-error handle activity is read-only
    handle.active = false;
    // @ts-expect-error handle activity is boolean
    const invalidActive: string = handle.active;
}
// @ts-expect-error an owner must be a game object
attached.reserveRoute({}, { tiles, startTick: 0 });
// @ts-expect-error a plan must contain a route
attached.reserveRoute(owner, { startTick: 0 });
// @ts-expect-error route coordinates must be vectors
attached.reserveRoute(owner, { tiles: ["0,0"], startTick: 0 });
// @ts-expect-error start ticks are numbers
attached.reserveRoute(owner, { tiles, startTick: "now" });
// @ts-expect-error hold ticks are numbers
attached.reserveRoute(owner, { tiles, startTick: 0, holdUntil: "later" });
// @ts-expect-error query coordinates must be vectors
attached.reservationOwner("0,0", 0);
// @ts-expect-error query ticks are numbers
attached.reservationOwner(k.vec2(0, 0), "now");
// @ts-expect-error advance ticks are numbers
attached.advanceReservations("later");
if (found) {
    // @ts-expect-error an owner result is a game object, not a number
    const invalidOwner: number = found;
}
`);
});

test("owner cleanup survives removal of the component that requested a booking", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a } = window as any;
        let handle;
        a.use({
            id: "planner",
            add() {
                handle = level.reserveRoute(this, {
                    tiles: [k.vec2(0, 0)],
                    startTick: 0,
                    holdUntil: 5,
                });
            },
        });
        a.unuse("planner");
        const before = handle.active;
        a.destroy();
        return {
            before,
            after: handle.active,
            empty: level.reservationOwner(k.vec2(0, 0), 5) === null,
        };
    });
    expect(result).toEqual({ before: true, after: false, empty: true });
});

test("empty levels have no bookable coordinates", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k } = window as any;
        const empty = k.addLevel([], {
            tileWidth: 16,
            tileHeight: 16,
            tiles: {},
        });
        empty.use(k.tileReservations());
        const owner = empty.add([]);
        return {
            rejected: empty.reserveRoute(owner, {
                tiles: [k.vec2(0, 0)],
                startTick: 0,
            }) === null,
            empty: empty.reservationOwner(k.vec2(0, 0), 0) === null,
        };
    });
    expect(result).toEqual({ rejected: true, empty: true });
});

for (const operation of ["cancel", "replacement", "destruction"]) {
    test(`${operation} releases movement conflicts as well as tile occupancy`, async ({ page }) => {
        const result = await page.evaluate(operation => {
            const { k, level, a, b } = window as any;
            const old = level.reserveRoute(a, {
                tiles: [k.vec2(0, 0), k.vec2(1, 0)],
                startTick: 2,
            });
            if (operation === "cancel") old.cancel();
            else if (operation === "destruction") a.destroy();
            else level.reserveRoute(a, { tiles: [k.vec2(3, 2)], startTick: 2 });
            const other = level.reserveRoute(b, {
                tiles: [k.vec2(1, 0), k.vec2(0, 0)],
                startTick: 2,
            });
            old.cancel();
            return {
                old: old.active,
                accepted: other !== null,
                active: other?.active,
                source: level.reservationOwner(k.vec2(1, 0), 2) === b,
                destination: level.reservationOwner(k.vec2(0, 0), 3) === b,
            };
        }, operation);
        expect(result).toEqual({
            old: false,
            accepted: true,
            active: true,
            source: true,
            destination: true,
        });
    });
}

test("invalid interior route steps preserve the owner's existing booking", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a } = window as any;
        const old = level.reserveRoute(a, {
            tiles: [k.vec2(3, 2)],
            startTick: 0,
            holdUntil: 10,
        });
        const routes = [
            [[0, 0], [2, 0], [2, 1], [3, 1]],
            [[0, 1], [0, 2], [0, 3], [1, 3], [1, 2]],
        ];
        const rejected = routes.map(route =>
            level.reserveRoute(a, {
                tiles: route.map(([x, y]) => k.vec2(x, y)),
                startTick: 2,
            }) === null
        );
        return {
            rejected,
            active: old.active,
            preserved: level.reservationOwner(k.vec2(3, 2), 10) === a,
        };
    });
    expect(result).toEqual({
        rejected: [true, true],
        active: true,
        preserved: true,
    });
});

test("later movement steps conflict at absolute ticks and allow a later traversal", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const first = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0), k.vec2(1, 0), k.vec2(2, 0)],
            startTick: 5,
        });
        const reverse = [k.vec2(2, 0), k.vec2(1, 0)];
        const collision = level.reserveRoute(b, {
            tiles: reverse,
            startTick: 6,
        });
        const later = level.reserveRoute(b, { tiles: reverse, startTick: 8 });
        return {
            rejected: collision === null,
            first: first.active,
            later: later?.active,
            arrival: level.reservationOwner(k.vec2(2, 0), 7) === a,
            departure: level.reservationOwner(k.vec2(2, 0), 8) === b,
        };
    });
    expect(result).toEqual({
        rejected: true,
        first: true,
        later: true,
        arrival: true,
        departure: true,
    });
});

test("a destination hold cannot reach into an already booked future tick", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const tile = k.vec2(2, 1);
        const future = level.reserveRoute(b, { tiles: [tile], startTick: 5 });
        const early = level.reserveRoute(a, {
            tiles: [tile],
            startTick: 2,
            holdUntil: 4,
        });
        const conflict = level.reserveRoute(a, {
            tiles: [tile],
            startTick: 2,
            holdUntil: 5,
        });
        return {
            rejected: conflict === null,
            early: early.active,
            future: future.active,
            before: level.reservationOwner(tile, 4) === a,
            at: level.reservationOwner(tile, 5) === b,
        };
    });
    expect(result).toEqual({
        rejected: true,
        early: true,
        future: true,
        before: true,
        at: true,
    });
});

test("independent levels allow opposite movements at the same ticks", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a } = window as any;
        const otherLevel = k.addLevel([".."], {
            tileWidth: 16,
            tileHeight: 16,
            tiles: { ".": () => [] },
        });
        otherLevel.use(k.tileReservations());
        const otherOwner = otherLevel.spawn([k.pos()], k.vec2(1, 0));
        const first = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0), k.vec2(1, 0)],
            startTick: 2,
        });
        const second = otherLevel.reserveRoute(otherOwner, {
            tiles: [k.vec2(1, 0), k.vec2(0, 0)],
            startTick: 2,
        });
        return {
            first: first?.active,
            second: second?.active,
            left: level.reservationOwner(k.vec2(1, 0), 3) === a,
            right: otherLevel.reservationOwner(k.vec2(0, 0), 3) === otherOwner,
        };
    });
    expect(result).toEqual({
        first: true,
        second: true,
        left: true,
        right: true,
    });
});

test("a late route conflict leaves no partial occupancy", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k } = window as any;
        return ["vertex", "swap"].map(conflict => {
            const level = k.addLevel(["....", "....", "...."], {
                tileWidth: 16,
                tileHeight: 16,
                tiles: { ".": () => [] },
            });
            level.use(k.tileReservations());
            const owner = level.add([]);
            const blocker = level.add([]);
            const other = level.add([]);
            const old = level.reserveRoute(owner, {
                tiles: [k.vec2(3, 2)],
                startTick: 0,
                holdUntil: 9,
            });
            const blocking = level.reserveRoute(
                blocker,
                conflict === "vertex"
                    ? { tiles: [k.vec2(2, 0)], startTick: 2 }
                    : { tiles: [k.vec2(2, 0), k.vec2(1, 0)], startTick: 1 },
            );
            const rejected = level.reserveRoute(owner, {
                tiles: [k.vec2(0, 0), k.vec2(1, 0), k.vec2(2, 0)],
                startTick: 0,
            }) === null;
            const prefixEmpty = [
                level.reservationOwner(k.vec2(0, 0), 0) === null,
                level.reservationOwner(k.vec2(1, 0), 1) === null,
            ];
            const reverse = level.reserveRoute(other, {
                tiles: [k.vec2(1, 0), k.vec2(0, 0)],
                startTick: 0,
            });
            return {
                rejected,
                prefixEmpty,
                old: old.active,
                preserved: level.reservationOwner(k.vec2(3, 2), 9) === owner,
                blocker: blocking.active,
                prefixReusable: reverse?.active === true,
            };
        });
    });
    expect(result).toEqual(
        Array(2).fill({
            rejected: true,
            prefixEmpty: [true, true],
            old: true,
            preserved: true,
            blocker: true,
            prefixReusable: true,
        }),
    );
});

test("releasing one booking preserves other owners at disjoint times", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const probe = level.add([]);
        return ["cancel", "replace", "expire", "destroy"].map(operation => {
            level.use(k.tileReservations());
            const tile = k.vec2(1, 1);
            const early = level.reserveRoute(a, {
                tiles: [tile],
                startTick: 0,
            });
            const later = level.reserveRoute(b, {
                tiles: [tile],
                startTick: 5,
                holdUntil: 6,
            });
            if (operation === "cancel") early.cancel();
            else if (operation === "replace") {
                level.reserveRoute(a, { tiles: [k.vec2(0, 0)], startTick: 0 });
            }
            else if (operation === "expire") level.advanceReservations(1);
            else a.destroy();
            early.cancel();
            return {
                early: early.active,
                later: later.active,
                owner: level.reservationOwner(tile, 5) === b,
                conflict:
                    level.reserveRoute(probe, { tiles: [tile], startTick: 5 })
                        === null,
            };
        });
    });
    expect(result).toEqual(
        Array(4).fill({
            early: false,
            later: true,
            owner: true,
            conflict: true,
        }),
    );
});

test("revisit gaps remain available to another owner", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const route = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0), k.vec2(1, 0), k.vec2(0, 0)],
            startTick: 3,
        });
        const gap = level.reservationOwner(k.vec2(0, 0), 4) === null;
        const between = level.reserveRoute(b, {
            tiles: [k.vec2(0, 0)],
            startTick: 4,
        });
        return {
            gap,
            accepted: between?.active === true,
            route: route.active,
            owners: [
                level.reservationOwner(k.vec2(0, 0), 3) === a,
                level.reservationOwner(k.vec2(0, 0), 4) === b,
                level.reservationOwner(k.vec2(0, 0), 5) === a,
            ],
        };
    });
    expect(result).toEqual({
        gap: true,
        accepted: true,
        route: true,
        owners: [true, true, true],
    });
});

test("advancing into a route preserves its remaining movement conflicts", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const first = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0), k.vec2(1, 0), k.vec2(2, 0), k.vec2(3, 0)],
            startTick: 4,
        });
        level.advanceReservations(5);
        level.advanceReservations(5);
        const rejected = level.reserveRoute(b, {
            tiles: [k.vec2(2, 0), k.vec2(1, 0)],
            startTick: 5,
        }) === null;
        const later = level.reserveRoute(b, {
            tiles: [k.vec2(2, 0), k.vec2(1, 0)],
            startTick: 8,
        });
        return {
            rejected,
            first: first.active,
            later: later?.active,
            occupancy: [
                level.reservationOwner(k.vec2(0, 0), 4) === null,
                level.reservationOwner(k.vec2(1, 0), 5) === a,
                level.reservationOwner(k.vec2(2, 0), 6) === a,
                level.reservationOwner(k.vec2(3, 0), 7) === a,
            ],
        };
    });
    expect(result).toEqual({
        rejected: true,
        first: true,
        later: true,
        occupancy: [true, true, true, true],
    });
});

for (const reversed of [false, true]) {
    test(`group replacements exchange occupied routes, reversed=${reversed}`, async ({ page }) => {
        const result = await page.evaluate(reversed => {
            const { k, level, a, b } = window as any;
            const c = level.spawn([k.pos()], k.vec2(2, 0));
            const owners = [a, b, c];
            const old = owners.map((owner, x) =>
                level.reserveRoute(owner, {
                    tiles: [k.vec2(x, 0)],
                    startTick: 0,
                    holdUntil: 8,
                })
            );
            const entries = owners.map((owner, x) => ({
                owner,
                plan: {
                    tiles: [k.vec2((x + 1) % 3, 0)],
                    startTick: 3,
                    holdUntil: 8,
                },
            }));
            if (reversed) entries.reverse();
            const group = level.reserveRoutes(entries);
            const occupancy = owners.map((owner, x) =>
                level.reservationOwner(k.vec2((x + 1) % 3, 0), 5) === owner
            );
            const prefixRemoved = owners.every((_, x) =>
                level.reservationOwner(k.vec2(x, 0), 0) === null
            );
            old.forEach(handle => handle.cancel());
            const active = group?.map(handle => handle.active);
            group?.[0].cancel();
            const ordered = entries.map((entry, i) =>
                level.reservationOwner(entry.plan.tiles[0], 5)
                    === (i === 0 ? null : entry.owner)
            );
            return {
                occupancy,
                prefixRemoved,
                old: old.map(handle => handle.active),
                active,
                ordered,
            };
        }, reversed);
        expect(result).toEqual({
            occupancy: [true, true, true],
            prefixRemoved: true,
            old: [false, false, false],
            active: [true, true, true],
            ordered: [true, true, true],
        });
    });
}

test("group releases remove old movement conflicts and preserve result positions", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const c = level.spawn([k.pos()], k.vec2(3, 2));
        const old = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0), k.vec2(1, 0)],
            startTick: 0,
        });
        const result = level.reserveRoutes(Object.freeze([
            Object.freeze({ owner: c, plan: null }),
            Object.freeze({
                owner: b,
                plan: Object.freeze({
                    tiles: Object.freeze([k.vec2(1, 0), k.vec2(0, 0)]),
                    startTick: 0,
                }),
            }),
            Object.freeze({ owner: a, plan: null }),
        ]));
        const before = result?.map(item => item === null ? null : item.active);
        old.cancel();
        const owner = level.reservationOwner(k.vec2(0, 0), 1) === b;
        const empty = level.reserveRoutes([]);
        const preserved = result?.[1].active;
        return { before, old: old.active, owner, empty, preserved };
    });
    expect(result).toEqual({
        before: [null, true, null],
        old: false,
        owner: true,
        empty: [],
        preserved: true,
    });
});

for (const kind of ["vertex", "opposing edge", "destination hold"]) {
    test(`new group members cannot have a ${kind} conflict`, async ({ page }) => {
        const result = await page.evaluate(kind => {
            const { k, level, a, b } = window as any;
            const old = [a, b].map((owner, x) =>
                level.reserveRoute(owner, {
                    tiles: [k.vec2(x, 2)],
                    startTick: 0,
                    holdUntil: 9,
                })
            );
            const first = {
                tiles: [k.vec2(0, 0), k.vec2(1, 0)],
                startTick: 2,
                holdUntil: 7,
            };
            const second = kind === "vertex"
                ? { tiles: [k.vec2(2, 0), k.vec2(1, 0)], startTick: 2 }
                : kind === "opposing edge"
                ? { tiles: [k.vec2(1, 0), k.vec2(0, 0)], startTick: 2 }
                : { tiles: [k.vec2(1, 0)], startTick: 7 };
            const rejected = level.reserveRoutes([{ owner: a, plan: first }, {
                owner: b,
                plan: second,
            }]) === null;
            return {
                rejected,
                active: old.map(handle => handle.active),
                preserved: [a, b].map((owner, x) =>
                    level.reservationOwner(k.vec2(x, 2), 5) === owner
                ),
                clear: level.reservationOwner(k.vec2(0, 0), 2) === null,
            };
        }, kind);
        expect(result).toEqual({
            rejected: true,
            active: [true, true],
            preserved: [true, true],
            clear: true,
        });
    });
}

for (const kind of ["vertex", "opposing edge"]) {
    test(`group validation retains unchanged owners' ${kind} conflicts`, async ({ page }) => {
        const result = await page.evaluate(kind => {
            const { k, level, a, b } = window as any;
            const c = level.spawn([k.pos()], k.vec2(3, 2));
            const old = [a, b].map((owner, x) =>
                level.reserveRoute(owner, {
                    tiles: [k.vec2(x, 2)],
                    startTick: 0,
                    holdUntil: 9,
                })
            );
            const outsider = level.reserveRoute(c, {
                tiles: [k.vec2(1, 0), k.vec2(0, 0)],
                startTick: 3,
            });
            const plan = kind === "vertex"
                ? { tiles: [k.vec2(2, 0), k.vec2(1, 0)], startTick: 2 }
                : { tiles: [k.vec2(0, 0), k.vec2(1, 0)], startTick: 3 };
            const result = level.reserveRoutes([{ owner: a, plan: null }, {
                owner: b,
                plan,
            }]);
            return {
                rejected: result === null,
                active: [...old, outsider].map(handle => handle.active),
                preserved: [a, b].map((owner, x) =>
                    level.reservationOwner(k.vec2(x, 2), 5) === owner
                ),
            };
        }, kind);
        expect(result).toEqual({
            rejected: true,
            active: [true, true, true],
            preserved: [true, true],
        });
    });
}

test("invalid group entries preserve every incumbent including release-only owners", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const old = [a, b].map((owner, x) =>
            level.reserveRoute(owner, {
                tiles: [k.vec2(x, 0)],
                startTick: 0,
                holdUntil: 9,
            })
        );
        const valid = {
            owner: a,
            plan: { tiles: [k.vec2(3, 0)], startTick: 1 },
        };
        const outsider = k.add([k.pos()]);
        const cases = {
            "duplicate replacement": [valid, valid],
            "duplicate release": [{ owner: a, plan: null }, {
                owner: a,
                plan: null,
            }],
            "mixed duplicate": [valid, { owner: a, plan: null }],
            "invalid release owner": [valid, { owner: outsider, plan: null }],
            "missing plan": [{ owner: a, plan: null }, { owner: b }],
            "null entry": [valid, null],
            "diagonal route": [valid, {
                owner: b,
                plan: { tiles: [k.vec2(0, 1), k.vec2(1, 2)], startTick: 1 },
            }],
            "overflowing arrival": [{ owner: a, plan: null }, {
                owner: b,
                plan: {
                    tiles: [k.vec2(2, 2), k.vec2(3, 2)],
                    startTick: Number.MAX_SAFE_INTEGER,
                },
            }],
        };
        return Object.fromEntries(
            Object.entries(cases).map(([name, entries]) => {
                const rejected = level.reserveRoutes(entries) === null;
                return [name, {
                    rejected,
                    active: old.map(handle => handle.active),
                    owners: [a, b].map((owner, x) =>
                        level.reservationOwner(k.vec2(x, 0), 5) === owner
                    ),
                    clear: level.reservationOwner(k.vec2(3, 0), 1) === null,
                }];
            }),
        );
    });
    expect(Object.keys(result)).toHaveLength(8);
    for (const [name, state] of Object.entries(result)) {
        expect(state, name).toEqual({
            rejected: true,
            active: [true, true],
            owners: [true, true],
            clear: true,
        });
    }
});

test("a rejected group leaves no staged tile or movement occupancy", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const c = level.spawn([k.pos()], k.vec2(3, 0));
        const outsider = level.reserveRoute(c, {
            tiles: [k.vec2(2, 0)],
            startTick: 1,
        });
        const rejected = level.reserveRoutes([
            {
                owner: a,
                plan: { tiles: [k.vec2(0, 0), k.vec2(1, 0)], startTick: 0 },
            },
            {
                owner: b,
                plan: { tiles: [k.vec2(2, 1), k.vec2(2, 0)], startTick: 0 },
            },
        ]) === null;
        const clear = [
            level.reservationOwner(k.vec2(0, 0), 0),
            level.reservationOwner(k.vec2(1, 0), 1),
        ].every(owner => owner === null);
        const reverse = level.reserveRoute(b, {
            tiles: [k.vec2(1, 0), k.vec2(0, 0)],
            startTick: 0,
        });
        return {
            rejected,
            clear,
            reverse: reverse?.active,
            outsider: outsider.active,
        };
    });
    expect(result).toEqual({
        rejected: true,
        clear: true,
        reverse: true,
        outsider: true,
    });
});

test("group snapshots and handles remain independent across subsequent operations", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const sharedTiles = [k.vec2(0, 0), k.vec2(1, 0)];
        const entries = [
            {
                owner: a,
                plan: { tiles: sharedTiles, startTick: 1, holdUntil: 3 },
            },
            {
                owner: b,
                plan: { tiles: sharedTiles, startTick: 5, holdUntil: 8 },
            },
        ];
        const group = level.reserveRoutes(entries);
        sharedTiles[0].x = 3;
        entries[1].plan.startTick = 100;
        entries[0].owner = b;
        entries.pop();
        const snapshots = [
            level.reservationOwner(k.vec2(0, 0), 1) === a,
            level.reservationOwner(k.vec2(0, 0), 5) === b,
        ];
        level.advanceReservations(4);
        const expired = group.map(handle => handle.active);
        const replacement = level.reserveRoute(b, {
            tiles: [k.vec2(2, 0)],
            startTick: 5,
        });
        group[1].cancel();
        group[0].cancel();
        const protectedReplacement = replacement.active
            && level.reservationOwner(k.vec2(2, 0), 5) === b;
        level.unuse("tileReservations");
        level.use(k.tileReservations());
        const fresh = level.reserveRoutes([{
            owner: a,
            plan: { tiles: [k.vec2(2, 0)], startTick: 5 },
        }]);
        replacement.cancel();
        return {
            snapshots,
            expired,
            protectedReplacement,
            old: replacement.active,
            fresh: fresh[0].active,
        };
    });
    expect(result).toEqual({
        snapshots: [true, true],
        expired: [false, true],
        protectedReplacement: true,
        old: false,
        fresh: true,
    });
});

test("group owner cleanup survives planner removal and level destruction", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        let group;
        a.use({
            id: "planner",
            add() {
                group = level.reserveRoutes(
                    [a, b].map((owner, x) => ({
                        owner,
                        plan: {
                            tiles: [k.vec2(x, 0)],
                            startTick: 0,
                            holdUntil: 10,
                        },
                    })),
                );
            },
        });
        a.unuse("planner");
        const before = group.map(handle => handle.active);
        b.destroy();
        const oneDestroyed = group.map(handle => handle.active);
        const freed = level.reservationOwner(k.vec2(1, 0), 4) === null;
        level.destroy();
        return {
            before,
            oneDestroyed,
            freed,
            after: group.map(handle => handle.active),
        };
    });
    expect(result).toEqual({
        before: [true, true],
        oneDestroyed: [true, false],
        freed: true,
        after: [false, false],
    });
});

test("group routes retain inclusive sparse holds and exact safe arrival boundaries", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const end = Number.MAX_SAFE_INTEGER;
        const group = level.reserveRoutes([
            {
                owner: a,
                plan: { tiles: [k.vec2(0, 0)], startTick: 0, holdUntil: end },
            },
            {
                owner: b,
                plan: {
                    tiles: [k.vec2(1, 0), k.vec2(2, 0)],
                    startTick: end - 1,
                },
            },
        ]);
        level.advanceReservations(end);
        const occupied = [
            level.reservationOwner(k.vec2(0, 0), end) === a,
            level.reservationOwner(k.vec2(2, 0), end) === b,
        ];
        const stillActive = group.map(handle => handle.active);
        const pastRejected = level.reserveRoutes([{ owner: a, plan: null }, {
            owner: b,
            plan: { tiles: [k.vec2(3, 0)], startTick: end - 1 },
        }]) === null;
        const result = level.reserveRoutes([{
            owner: b,
            plan: { tiles: [k.vec2(0, 0)], startTick: end },
        }, { owner: a, plan: null }]);
        return {
            occupied,
            stillActive,
            pastRejected,
            old: group.map(handle => handle.active),
            active: result?.map(handle =>
                handle === null ? null : handle.active
            ),
        };
    });
    expect(result).toEqual({
        occupied: [true, true],
        stillActive: [true, true],
        pastRejected: true,
        old: [false, false],
        active: [true, null],
    });
});

test("owner cleanup survives a scene change with a persistent level", async ({ page }) => {
    await page.clock.resume();
    const result = await page.evaluate(() =>
        new Promise(resolve => {
            const { k, level, a, b } = window as any;
            level.use(k.stay());
            const handles = level.reserveRoutes([
                {
                    owner: a,
                    plan: { tiles: [k.vec2(0, 0)], startTick: 0, holdUntil: 9 },
                },
                {
                    owner: b,
                    plan: { tiles: [k.vec2(2, 0)], startTick: 0, holdUntil: 9 },
                },
            ]);
            k.scene("after-reservations", () => {
                const survives = level.exists() && a.exists() && b.exists()
                    && handles.every(handle => handle.active)
                    && level.reservationOwner(k.vec2(0, 0), 2) === a;
                a.destroy();
                const released = handles[0].active === false
                    && level.reservationOwner(k.vec2(0, 0), 2) === null;
                const unaffected = handles[1].active === true
                    && level.reservationOwner(k.vec2(2, 0), 2) === b;
                level.destroy();
                resolve({
                    survives,
                    released,
                    unaffected,
                    levelCleanup: handles[1].active === false,
                });
            });
            k.go("after-reservations");
        })
    );
    expect(result).toEqual({
        survives: true,
        released: true,
        unaffected: true,
        levelCleanup: true,
    });
});

test("owner destruction releases bookings after public event handlers are cleared", async ({ page }) => {
    const result = await page.evaluate(() => {
        const { k, level, a, b } = window as any;
        const single = level.reserveRoute(a, {
            tiles: [k.vec2(0, 0), k.vec2(1, 0)],
            startTick: 2,
            holdUntil: 8,
        });
        const group = level.reserveRoutes([{
            owner: b,
            plan: {
                tiles: [k.vec2(0, 1), k.vec2(1, 1)],
                startTick: 2,
                holdUntil: 8,
            },
        }]);
        a.clearEvents();
        b.clearEvents();
        const stillBooked = single.active && group[0].active
            && level.reservationOwner(k.vec2(1, 0), 5) === a
            && level.reservationOwner(k.vec2(1, 1), 5) === b;
        a.destroy();
        const singleReleased = !single.active
            && level.reservationOwner(k.vec2(1, 0), 5) === null;
        const unrelatedPreserved = group[0].active
            && level.reservationOwner(k.vec2(1, 1), 5) === b;
        b.destroy();
        const groupReleased = !group[0].active
            && level.reservationOwner(k.vec2(1, 1), 5) === null;
        return {
            stillBooked,
            singleReleased,
            unrelatedPreserved,
            groupReleased,
        };
    });
    expect(result).toEqual({
        stillBooked: true,
        singleReleased: true,
        unrelatedPreserved: true,
        groupReleased: true,
    });
});

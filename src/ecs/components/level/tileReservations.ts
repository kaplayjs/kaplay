import { onDestroy } from "../../../api/eventHandlers";
import type { KEventController } from "../../../events/events";
import type { Vec2 } from "../../../math/Vec2";
import type { Comp, GameObj } from "../../../types";
import type { LevelComp } from "./level";

export interface RoutePlan {
    readonly tiles: readonly Vec2[];
    readonly startTick: number;
    readonly holdUntil?: number;
}

export interface RouteReservation {
    readonly active: boolean;
    cancel(): void;
}

export interface RouteReservationRequest {
    readonly owner: GameObj;
    readonly plan: RoutePlan | null;
}

/**
 * Owned tile bookings on an explicitly advanced simulation clock.
 * @group Components
 * @subgroup Component Types
 */
export interface TileReservationsComp extends Comp {
    readonly reservationTick: number;
    reserveRoute(owner: GameObj, plan: RoutePlan): RouteReservation | null;
    reserveRoutes(
        requests: readonly RouteReservationRequest[],
    ): (RouteReservation | null)[] | null;
    reservationOwner(tile: Vec2, tick: number): GameObj | null;
    advanceReservations(tick: number): void;
}

type Visit = {
    tile: string;
    start: number;
    end: number;
    booking: Booking;
};

type Traversal = {
    key: string;
    opposite: string;
    tick: number;
};

type Booking = {
    owner: GameObj;
    active: boolean;
    end: number;
    visits: Visit[];
    edges: Traversal[];
};

type RouteSnapshot = {
    tiles: string[];
    start: number;
    end: number;
};

type BookingIndex = {
    tiles: Map<string, Set<Visit>>;
    edges: Map<string, Set<Booking>>;
};

function createIndex(): BookingIndex {
    return { tiles: new Map(), edges: new Map() };
}

function conflicts(
    booking: Booking,
    index: BookingIndex,
    ignored?: ReadonlySet<GameObj>,
) {
    for (const visit of booking.visits) {
        for (const existing of index.tiles.get(visit.tile) ?? []) {
            if (
                !ignored?.has(existing.booking.owner)
                && existing.start <= visit.end
                && visit.start <= existing.end
            ) return true;
        }
    }
    for (const traversal of booking.edges) {
        for (const existing of index.edges.get(traversal.opposite) ?? []) {
            if (!ignored?.has(existing.owner)) return true;
        }
    }
    return false;
}

function indexBooking(booking: Booking, index: BookingIndex) {
    for (const visit of booking.visits) {
        let visits = index.tiles.get(visit.tile);
        if (!visits) {
            visits = new Set();
            index.tiles.set(visit.tile, visits);
        }
        visits.add(visit);
    }
    for (const traversal of booking.edges) {
        let users = index.edges.get(traversal.key);
        if (!users) {
            users = new Set();
            index.edges.set(traversal.key, users);
        }
        users.add(booking);
    }
}

function validTick(tick: number) {
    return Number.isSafeInteger(tick) && tick >= 0;
}

function validTile(tile: Vec2, level: GameObj<LevelComp>) {
    return tile != null && Number.isInteger(tile.x)
        && Number.isInteger(tile.y)
        && tile.x >= 0 && tile.x < level.numColumns()
        && tile.y >= 0 && tile.y < level.numRows();
}

function tileKey(tile: Vec2) {
    return `${tile.x},${tile.y}`;
}

function edgeKey(from: string, to: string, tick: number) {
    return `${from}>${to}@${tick}`;
}

function snapshotRoute(
    level: GameObj<LevelComp>,
    plan: RoutePlan,
    clock: number,
): RouteSnapshot | null {
    if (!plan || !Array.isArray(plan.tiles)) return null;
    const { startTick, tiles: route } = plan;
    if (!route.length || !validTick(startTick) || startTick < clock) {
        return null;
    }
    const duration = route.length - 1;
    if (duration > Number.MAX_SAFE_INTEGER - startTick) return null;
    const arrival = startTick + duration;
    const end = plan.holdUntil === undefined ? arrival : plan.holdUntil;
    if (!validTick(end) || end < arrival) return null;

    const tiles: string[] = [];
    for (let i = 0; i < route.length; i++) {
        const tile = route[i];
        if (!validTile(tile, level)) return null;
        if (i > 0) {
            const previous = route[i - 1];
            const distance = Math.abs(tile.x - previous.x)
                + Math.abs(tile.y - previous.y);
            if (distance > 1) return null;
        }
        tiles.push(tileKey(tile));
    }
    return { tiles, start: startTick, end };
}

function prepareBooking(owner: GameObj, route: RouteSnapshot): Booking {
    const booking: Booking = {
        owner,
        active: false,
        end: route.end,
        visits: [],
        edges: [],
    };
    for (let i = 0; i < route.tiles.length; i++) {
        const tile = route.tiles[i];
        const tick = route.start + i;
        booking.visits.push({
            tile,
            start: tick,
            end: i === route.tiles.length - 1 ? route.end : tick,
            booking,
        });
        if (i > 0 && route.tiles[i - 1] !== tile) {
            const from = route.tiles[i - 1];
            booking.edges.push({
                key: edgeKey(from, tile, tick - 1),
                opposite: edgeKey(tile, from, tick - 1),
                tick: tick - 1,
            });
        }
    }
    return booking;
}

/**
 * Reserve routes for objects in a level on an integer simulation clock.
 * Bookings reject shared occupancy and opposing edge crossings. They do not move objects.
 *
 * @example
 * level.use(tileReservations());
 * const booking = level.reserveRoute(actor, {
 *     tiles: [vec2(0, 0), vec2(1, 0)],
 *     startTick: 1,
 * });
 * level.advanceReservations(2);
 * booking?.cancel();
 */
export function tileReservations(): TileReservationsComp {
    let clock = 0;
    let disposed = false;
    let destruction: KEventController | undefined;
    const owners = new Map<GameObj, Booking>();
    const index = createIndex();

    function removeVisit(visit: Visit) {
        const visits = index.tiles.get(visit.tile);
        visits?.delete(visit);
        if (visits?.size === 0) index.tiles.delete(visit.tile);
    }

    function removeEdge(traversal: Traversal, booking: Booking) {
        const users = index.edges.get(traversal.key);
        users?.delete(booking);
        if (users?.size === 0) index.edges.delete(traversal.key);
    }

    function release(booking: Booking) {
        if (!booking.active) return;
        booking.active = false;
        if (owners.get(booking.owner) === booking) {
            owners.delete(booking.owner);
        }
        for (const visit of booking.visits) removeVisit(visit);
        for (const traversal of booking.edges) removeEdge(traversal, booking);
        booking.visits.length = 0;
        booking.edges.length = 0;
    }

    function reserveBatch(
        level: GameObj<LevelComp>,
        requests: readonly RouteReservationRequest[],
    ): (RouteReservation | null)[] | null {
        if (disposed || !Array.isArray(requests)) return null;
        const replacing = new Set<GameObj>();
        const bookings: (Booking | null)[] = [];
        for (const request of requests) {
            const owner = request?.owner;
            if (
                !owner || owner.parent !== level || !owner.exists()
                || replacing.has(owner)
            ) return null;
            replacing.add(owner);
            if (request.plan === null) {
                bookings.push(null);
                continue;
            }
            const route = snapshotRoute(level, request.plan, clock);
            if (!route) return null;
            bookings.push(prepareBooking(owner, route));
        }

        const proposed = createIndex();
        for (const booking of bookings) {
            if (!booking) continue;
            if (
                conflicts(booking, index, replacing)
                || conflicts(booking, proposed)
            ) return null;
            indexBooking(booking, proposed);
        }

        for (const owner of replacing) {
            const previous = owners.get(owner);
            if (previous) release(previous);
        }
        return bookings.map((booking) => {
            if (!booking) return null;
            booking.active = true;
            owners.set(booking.owner, booking);
            indexBooking(booking, index);
            return {
                get active() {
                    return booking.active;
                },
                cancel() {
                    release(booking);
                },
            };
        });
    }

    function expire(booking: Booking) {
        if (booking.end < clock) {
            release(booking);
            return;
        }
        booking.visits = booking.visits.filter((visit) => {
            if (visit.end >= clock) return true;
            removeVisit(visit);
            return false;
        });
        booking.edges = booking.edges.filter((traversal) => {
            if (traversal.tick >= clock) return true;
            removeEdge(traversal, booking);
            return false;
        });
    }

    return {
        id: "tileReservations",
        require: ["level"],
        add() {
            destruction = onDestroy((owner) => {
                const booking = owners.get(owner);
                if (booking) release(booking);
            });
        },
        get reservationTick() {
            return clock;
        },
        reserveRoute(this: GameObj<LevelComp>, owner, plan) {
            if (!plan) return null;
            return reserveBatch(this, [{ owner, plan }])?.[0] ?? null;
        },
        reserveRoutes(this: GameObj<LevelComp>, requests) {
            return reserveBatch(this, requests);
        },
        reservationOwner(this: GameObj<LevelComp>, tile, tick) {
            if (!validTile(tile, this) || !validTick(tick) || tick < clock) {
                return null;
            }
            for (const visit of index.tiles.get(tileKey(tile)) ?? []) {
                if (visit.start <= tick && tick <= visit.end) {
                    return visit.booking.owner;
                }
            }
            return null;
        },
        advanceReservations(tick) {
            if (!validTick(tick) || tick < clock) {
                throw new RangeError(
                    "Reservation time must be a nondecreasing safe integer",
                );
            }
            if (tick === clock) return;
            clock = tick;
            for (const booking of owners.values()) expire(booking);
        },
        destroy() {
            disposed = true;
            destruction?.cancel();
            for (const booking of owners.values()) release(booking);
        },
    };
}

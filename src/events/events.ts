import { EVENT_CANCEL_SYMBOL } from "../constants/general";
import type { GameObj } from "../types";

/**
 * @group Events
 */
export class Registry<T> extends Map<number, T> {
    private lastID: number = 0;
    push(v: T): number {
        const id = this.lastID;
        this.set(id, v);
        this.lastID++;
        return id;
    }
    pushd(v: T): () => void {
        const id = this.push(v);
        return () => this.delete(id);
    }
}

/**
 * A controller for all events in KAPLAY.
 *
 * @example
 * ```js
 * // Create a new event
 * const logHi = onUpdate(() => {
 *    debug.log("hi");
 * });
 *
 * // Pause the event
 * logHi.paused = true;
 *
 * // Cancel the event
 * logHi.cancel();
 *
 * ```
 *
 * @group Events
 */
export class KEventController {
    /** If the event is paused */
    paused: boolean = false;
    /** The game obj that attached this event */
    controller?: GameObj | null = null;
    /** Cancel the event */
    cancel: () => void;

    constructor(cancel: () => void) {
        this.cancel = cancel;
    }
    static join(events: KEventController[]): KEventController {
        const ev = new KEventController(() =>
            events.forEach((e) => e.cancel())
        );
        Object.defineProperty(ev, "paused", {
            get: () => events[0].paused,
            set: (p: boolean) => events.forEach((e) => e.paused = p),
        });
        Object.defineProperty(ev, "controller", {
            get: () => events[0].controller,
            set: (p: GameObj | null) => events.forEach((e) => e.controller = p),
        });
        ev.paused = !!events[0]?.paused;
        return ev;
    }
    static replace(oldEv: KEventController, newEv: KEventController) {
        oldEv.cancel = () => newEv.cancel();
        newEv.paused = oldEv.paused;
        Object.defineProperty(oldEv, "paused", {
            get: () => newEv.paused,
            set: (p: boolean) => newEv.paused = p,
        });
        Object.defineProperty(oldEv, "controller", {
            get: () => newEv.controller,
            set: (p: GameObj | null) => newEv.controller = p,
        });
        return oldEv;
    }
}

export class KEvent<Args extends any[] = any[]> {
    private cancellers: WeakMap<(...args: Args) => unknown, () => void> =
        new WeakMap();
    private handlers: Registry<(...args: Args) => unknown> = new Registry();

    add(action: (...args: Args) => unknown): KEventController {
        function handler(...args: Args) {
            if (ev.paused || ev.controller?.paused) return;
            return action(...args);
        }

        const cancel = this.handlers.pushd(handler);
        const ev = new KEventController(cancel);
        this.cancellers.set(handler, cancel);
        return ev;
    }
    addOnce(
        action: (...args: (Args | PromiseLike<Args>)[]) => void,
    ): KEventController {
        const ev = this.add((...args) => {
            ev.cancel();
            action(...args);
        });
        return ev;
    }
    next(): Promise<Args> {
        return new Promise((res) => this.addOnce(res));
    }
    trigger(...args: Args) {
        this.handlers.forEach((action) => {
            const result = action(...args);
            let cancel;

            if (
                result === EVENT_CANCEL_SYMBOL
                && (cancel = this.cancellers.get(action))
            ) {
                cancel();
            }
        });
    }
    numListeners(): number {
        return this.handlers.size;
    }
    clear() {
        this.handlers.clear();
    }
}

// TODO: only accept one argument?
export class KEventHandler<EventMap extends Record<string, any[]>> {
    private handlers: Partial<
        {
            [Name in keyof EventMap]: KEvent<EventMap[Name]>;
        }
    > = {};
    on<Name extends keyof EventMap>(
        name: Name,
        action: (...args: EventMap[Name]) => void,
    ): KEventController {
        if (!this.handlers[name]) {
            this.handlers[name] = new KEvent<EventMap[Name]>();
        }
        return this.handlers[name].add(action);
    }
    onOnce<Name extends keyof EventMap>(
        name: Name,
        action: (...args: EventMap[Name]) => void,
    ): KEventController {
        const ev = this.on(name, (...args) => {
            ev.cancel();
            action(...args);
        });
        return ev;
    }
    next<Name extends keyof EventMap>(name: Name): Promise<unknown> {
        return new Promise((res) => {
            // TODO: can only pass 1 val to resolve()
            this.onOnce(name, (...args: EventMap[Name]) => res(args[0]));
        });
    }
    trigger<Name extends keyof EventMap>(name: Name, ...args: EventMap[Name]) {
        if (this.handlers[name]) {
            this.handlers[name].trigger(...args);
        }
    }
    remove<Name extends keyof EventMap>(name: Name) {
        delete this.handlers[name];
    }
    clear() {
        this.handlers = {};
    }
    numListeners<Name extends keyof EventMap>(name: Name): number {
        return this.handlers[name]?.numListeners() ?? 0;
    }
}

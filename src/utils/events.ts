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
 * @group Events
 */
export class KEventController {
    /** If the event is paused */
    paused: boolean = false;
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
        ev.paused = false;
        return ev;
    }
    static replace(oldEv: KEventController, newEv: KEventController) {
        oldEv.cancel = () => newEv.cancel();
        newEv.paused = oldEv.paused;
        Object.defineProperty(oldEv, "paused", {
            get: () => newEv.paused,
            set: (p: boolean) => newEv.paused = p,
        });

        return oldEv;
    }
}

export class KEvent<Args extends any[] = any[]> {
    private handlers: Registry<(...args: Args) => void> = new Registry();

    add(action: (...args: Args) => void): KEventController {
        const cancel = this.handlers.pushd((...args: Args) => {
            if (ev.paused) return;
            action(...args);
        });
        const ev = new KEventController(cancel);
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
        this.handlers.forEach((action) => action(...args));
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
    registers: Partial<
        {
            [Name in keyof EventMap]: Registry<
                (...args: EventMap[Name]) => void
            >;
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

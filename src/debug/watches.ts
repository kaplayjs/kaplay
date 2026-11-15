import { prettyDebug } from "./prettyDebug";

export interface DebugWatchEntry {
    readonly kind: "property" | "quick";
    readonly name: string;
    readonly value: string;
    readonly error: boolean;
}

interface PropertyWatch {
    object: object;
    key: PropertyKey;
    name: string;
}

interface QuickWatch {
    entry: DebugWatchEntry;
    displayed: boolean;
}

function preview(
    read: () => unknown,
    readProperty: (object: object, key: PropertyKey) => unknown = Reflect.get,
): Pick<DebugWatchEntry, "value" | "error"> {
    try {
        return {
            value: prettyDebug(
                read(),
                false,
                new Set(),
                false,
                readProperty,
                true,
            ),
            error: false,
        };
    } catch {
        return { value: "<error>", error: true };
    }
}

export class DebugWatches {
    panel: { x: number; y: number; width: number; height: number } | null =
        null;
    scroll = 0;
    maxScroll = 0;
    private properties: PropertyWatch[] = [];
    private quick = new Map<string, QuickWatch>();
    private entries: DebugWatchEntry[] = [];
    private generation = 0;

    watch(object: object, key: PropertyKey, name = String(key)): void {
        const existing = this.properties.find(watch =>
            watch.object === object && watch.key === key
        );
        if (existing) {
            existing.name = name;
        }
        else {
            this.properties.push({ object, key, name });
        }
    }

    remove(object: object, key: PropertyKey): void {
        this.properties = this.properties.filter(watch =>
            watch.object !== object || watch.key !== key
        );
    }

    removeObject(object: object): void {
        this.properties = this.properties.filter(watch =>
            watch.object !== object
        );
    }

    quickWatch(value: unknown, name: string): void {
        this.quick.set(name, {
            entry: { kind: "quick", name, ...preview(() => value) },
            displayed: false,
        });
    }

    clear(): void {
        this.generation++;
        this.properties = [];
        this.quick.clear();
        this.entries = [];
        this.panel = null;
        this.scroll = 0;
        this.maxScroll = 0;
    }

    scrollAt(x: number, y: number, delta: number): void {
        const panel = this.panel;
        if (
            panel && x >= panel.x && x < panel.x + panel.width
            && y >= panel.y && y < panel.y + panel.height
        ) {
            this.scroll = Math.max(
                0,
                Math.min(this.maxScroll, this.scroll + delta),
            );
        }
    }

    get(): readonly DebugWatchEntry[] {
        return this.entries.map(entry => ({ ...entry }));
    }

    sample(paused: boolean): readonly DebugWatchEntry[] {
        const entries: DebugWatchEntry[] = [];
        const generation = this.generation;
        const reads = new WeakMap<
            object,
            Map<PropertyKey, { value: unknown } | { error: unknown }>
        >();
        const read = (object: object, key: PropertyKey): unknown => {
            if (generation !== this.generation) return undefined;
            key = typeof key === "symbol" ? key : String(key);
            let values = reads.get(object);
            if (!values) {
                values = new Map();
                reads.set(object, values);
            }
            let result = values.get(key);
            if (!result) {
                try {
                    result = { value: Reflect.get(object, key) };
                } catch (error) {
                    result = { error };
                }
                values.set(key, result);
            }
            if ("error" in result) throw result.error;
            return result.value;
        };
        for (const watch of this.properties.slice()) {
            if (!this.properties.includes(watch)) continue;
            const value = preview(() => read(watch.object, watch.key), read);
            if (generation !== this.generation) return this.entries;
            if (this.properties.includes(watch)) {
                entries.push({
                    kind: "property",
                    name: watch.name,
                    ...value,
                });
            }
        }
        for (const [name, watch] of this.quick) {
            if (watch.displayed && !paused) {
                this.quick.delete(name);
            }
            else {
                entries.push(watch.entry);
                watch.displayed = true;
            }
        }
        this.entries = entries;
        return entries;
    }
}

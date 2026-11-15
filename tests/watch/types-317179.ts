import kaplay from "../../src/kaplay";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
type NotAny<T> = 0 extends (1 & T) ? false : true;
const k = kaplay();
const symbol = Symbol("typed");
const object = { score: 1, 3: "third", [symbol]: true } as const;
const watched = k.debug.watch(object, "score");
k.debug.watch(object, 3, "number");
k.debug.watch(object, symbol, "symbol");
const removed = k.debug.removeWatch(object, "score");
const quick = k.debug.quickWatch({ n: [1, 2] }, "quick");
const cleared = k.debug.clearWatches();
const observations = k.debug.getWatches();
type Entry = typeof observations[number];
type WatchVoid = Assert<Equal<typeof watched, void>>;
type RemoveVoid = Assert<Equal<typeof removed, void>>;
type QuickVoid = Assert<Equal<typeof quick, void>>;
type ClearVoid = Assert<Equal<typeof cleared, void>>;
type EntryNotAny = Assert<NotAny<Entry>>;
type Name = Assert<Equal<Entry["name"], string>>;
type Value = Assert<Equal<Entry["value"], string>>;
type ErrorFlag = Assert<Equal<Entry["error"], boolean>>;
type Kind = Assert<Equal<Entry["kind"], "property" | "quick">>;

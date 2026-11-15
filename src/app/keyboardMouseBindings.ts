import type { Key, MouseButton } from "../types";
import type { KeyboardMouseChord } from "./inputBindings";

type Chord = {
    mouse: MouseButton;
    keys: ReadonlySet<Key>;
    codes: ReadonlySet<string>;
    specificity: number;
};

function values<T extends string>(value?: T | readonly T[]): T[] {
    if (value === undefined) return [];
    return typeof value === "string" ? [value] : [...value];
}

function normalize(chord: KeyboardMouseChord): Chord {
    const keys = new Set(values(chord.keyboard));
    const codes = new Set(values(chord.keyboardCode));
    if (keys.size + codes.size === 0) {
        throw new TypeError(
            "A keyboardMouse chord needs a keyboard key or code",
        );
    }
    return {
        mouse: chord.mouse,
        keys,
        codes,
        specificity: keys.size + codes.size,
    };
}

function matches<T>(required: ReadonlySet<T>, held: ReadonlySet<T>): boolean {
    for (const value of required) {
        if (!held.has(value)) return false;
    }
    return true;
}

/** Track keyboard modifiers and mouse-committed chords for one app instance. */
export function createKeyboardMouseBindings() {
    const bindings = new Map<string, Chord[]>();
    const active = new Map<string, Set<Chord>>();
    const keysDown = new Set<Key>();
    const codesDown = new Set<string>();
    const mouseDown = new Set<MouseButton>();

    function updateBinding(
        button: string,
        alternatives:
            | KeyboardMouseChord
            | readonly KeyboardMouseChord[]
            | undefined,
    ) {
        const choices = alternatives === undefined
            ? []
            : Array.isArray(alternatives)
            ? alternatives
            : [alternatives];
        const normalized = choices.map(normalize);
        if (normalized.length) bindings.set(button, normalized);
        else bindings.delete(button);
        active.delete(button);
    }

    function keyDown(key: Key, code: string) {
        keysDown.add(key);
        codesDown.add(code);
    }

    function keyUp(key: Key, code: string) {
        keysDown.delete(key);
        codesDown.delete(code);
        for (const [button, chords] of active) {
            for (const chord of chords) {
                if (
                    !matches(chord.keys, keysDown)
                    || !matches(chord.codes, codesDown)
                ) {
                    chords.delete(chord);
                }
            }
            if (chords.size === 0) active.delete(button);
        }
    }

    function pressMouse(mouse: MouseButton): boolean {
        if (mouseDown.has(mouse)) return true;
        mouseDown.add(mouse);
        const matched: { button: string; chord: Chord }[] = [];
        let highest = 0;
        for (const [button, chords] of bindings) {
            for (const chord of chords) {
                if (
                    chord.mouse !== mouse
                    || !matches(chord.keys, keysDown)
                    || !matches(chord.codes, codesDown)
                ) continue;
                matched.push({ button, chord });
                highest = Math.max(highest, chord.specificity);
            }
        }
        for (const { button, chord } of matched) {
            if (chord.specificity !== highest) continue;
            let chords = active.get(button);
            if (!chords) {
                chords = new Set();
                active.set(button, chords);
            }
            chords.add(chord);
        }
        return matched.length > 0;
    }

    function releaseMouse(mouse: MouseButton) {
        mouseDown.delete(mouse);
        for (const [button, chords] of active) {
            for (const chord of chords) {
                if (chord.mouse === mouse) chords.delete(chord);
            }
            if (chords.size === 0) active.delete(button);
        }
    }

    function releaseAll() {
        keysDown.clear();
        codesDown.clear();
        mouseDown.clear();
        active.clear();
    }

    function buttonsUsed(): Set<string> {
        return new Set(active.keys());
    }

    return {
        updateBinding,
        keyDown,
        keyUp,
        pressMouse,
        releaseMouse,
        releaseAll,
        buttonsUsed,
    };
}

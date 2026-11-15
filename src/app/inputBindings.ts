import type {
    ChordedKey,
    ChordedKGamepadButton,
    ChordedMouseButton,
    Key,
    KGamepadButton,
    MouseButton,
} from "../types";
import { type AppState, ButtonState } from "./app";
import { createKeyboardMouseBindings } from "./keyboardMouseBindings";

/** A mouse button committed while all listed keyboard inputs are held. */
export type KeyboardMouseChord = {
    mouse: MouseButton;
    keyboard?: Key | readonly Key[];
    keyboardCode?: string | readonly string[];
};

/**
 * A button binding.
 *
 * @group Input
 * @subgroup Buttons API
 */
export type ButtonBinding = {
    keyboard?: ChordedKey | ChordedKey[];
    keyboardCode?: string | string[];
    gamepad?: ChordedKGamepadButton | ChordedKGamepadButton[];
    mouse?: ChordedMouseButton | ChordedMouseButton[];
    keyboardMouse?: KeyboardMouseChord | readonly KeyboardMouseChord[];
};

/**
 * A buttons definition for an action (jump, walk-left, run).
 *
 * @group Input
 * @subgroup Buttons API
 */
export type ButtonsDef = Record<string, ButtonBinding>;

/**
 * A button binding device
 *
 * @group Input
 * @subgroup Buttons API
 */
export type ButtonBindingDevice = "keyboard" | "gamepad" | "mouse";

// pass the user `buttons` definition to different keymaps
export const parseButtonBindings = (appState: AppState) => {
    const btns = appState.buttons;

    for (const b in btns) {
        appState.buttonHandler.updateBinding(b, btns[b], appState);
    }
};

function splitButtons<T extends string>(b: T): T[] {
    // this is only to handle the special case of "+" being used as both the button and a splitter
    // "+".split("+") --> ["", ""]
    // in all practicality "+" can only be a real key once so "", "" should only appear once
    // we process it as many times as it appears to be consistent
    const out = b.split("+") as T[];
    for (var i = 0; i < out.length; i++) {
        if (out[i] === "" && out[i + 1] === "") {
            out.splice(i, 2, "+" as T);
            i--;
        }
    }
    return out;
}

class ChordedButtonDetector<T extends string = string> {
    // map of mod key --> down state
    mods = new Map<T, boolean>();
    // map of commit key --> checkers for this commit key
    committers = new Map<T, { check: Set<T>; btns: Map<string, T[][]> }>();
    private held = new Set<T>();
    private active = new Map<T, Map<string, T[]>>();

    get buttonsUsed(): Set<string> {
        const buttons = new Set<string>();
        for (const uses of this.active.values()) {
            for (const button of uses.keys()) buttons.add(button);
        }
        return buttons;
    }

    updateBinding(button: string, bindings: T[]) {
        for (const [committer, uses] of this.active) {
            uses.delete(button);
            if (!uses.size) this.active.delete(committer);
        }
        for (const [committer, entry] of this.committers) {
            entry.btns.delete(button);
            if (!entry.btns.size) this.committers.delete(committer);
        }
        for (const b of bindings) {
            const mods = splitButtons(b);
            const committer = mods.pop()!;
            let entry = this.committers.get(committer);
            if (!entry) {
                entry = { check: new Set(), btns: new Map() };
                this.committers.set(committer, entry);
            }
            const options = entry.btns.get(button) ?? [];
            options.push(mods);
            entry.btns.set(button, options);
        }
        // A modifier may be shared by several buttons, so rebuild the union.
        this.mods.clear();
        for (const entry of this.committers.values()) {
            entry.check.clear();
            for (const options of entry.btns.values()) {
                for (const option of options) {
                    for (const mod of option) {
                        entry.check.add(mod);
                        this.mods.set(mod, this.held.has(mod));
                    }
                }
            }
        }
    }
    handleDown(key: T, suppress: boolean = false): string[] {
        this.held.add(key);
        if (this.mods.has(key)) this.mods.set(key, true);
        const commit = this.committers.get(key);
        const pressedButtons: string[] = [];
        if (commit && !suppress) {
            for (const [button, options] of commit.btns) {
                for (const mods of options) {
                    let valid = true;
                    for (const mod of commit.check) {
                        if (this.mods.get(mod) !== mods.includes(mod)) {
                            valid = false;
                            break;
                        }
                    }
                    if (!valid) continue;
                    let uses = this.active.get(key);
                    if (!uses) {
                        uses = new Map();
                        this.active.set(key, uses);
                    }
                    uses.set(button, mods);
                    pressedButtons.push(button);
                    break;
                }
            }
        }
        return pressedButtons;
    }
    handleUp(key: T): string[] {
        const before = this.buttonsUsed;
        this.held.delete(key);
        if (this.mods.has(key)) this.mods.set(key, false);
        this.active.delete(key);
        for (const [committer, uses] of this.active) {
            for (const [button, mods] of uses) {
                if (mods.includes(key)) uses.delete(button);
            }
            if (!uses.size) this.active.delete(committer);
        }
        const after = this.buttonsUsed;
        return [...before].filter(button => !after.has(button));
    }
    releaseAll(): string[] {
        const buttons = [...this.buttonsUsed];
        this.held.clear();
        this.active.clear();
        this.mods.forEach((_, mod) => this.mods.set(mod, false));
        return buttons;
    }
}

export class ButtonProcessor {
    byKey = new ChordedButtonDetector<ChordedKey>();
    byKeyCode = new ChordedButtonDetector<string>();
    byMouse = new ChordedButtonDetector<ChordedMouseButton>();
    byGamepad = new ChordedButtonDetector<ChordedKGamepadButton>();
    keyboardMouse = createKeyboardMouseBindings();
    private virtual = new Set<string>();
    private gamepadHeld = new Map<number, Set<KGamepadButton>>();
    state = new ButtonState<string>(
        "buttonPress",
        null,
        "buttonDown",
        "buttonRelease",
    );
    updateBinding(name: string, b: ButtonBinding, state: AppState) {
        if (b.keyboardMouse !== undefined) {
            this.keyboardMouse.updateBinding(name, b.keyboardMouse);
        }
        const keyboardBtns = b.keyboard && [b.keyboard].flat();
        const keyboardCodes = b.keyboardCode === undefined
            ? undefined
            : [b.keyboardCode].flat();
        const gamepadBtns = b.gamepad && [b.gamepad].flat();
        const mouseBtns = b.mouse && [b.mouse].flat();
        if (keyboardBtns !== undefined) {
            this.byKey.updateBinding(name, keyboardBtns);
        }
        if (keyboardCodes !== undefined) {
            this.byKeyCode.updateBinding(name, keyboardCodes);
        }
        if (gamepadBtns !== undefined) {
            this.byGamepad.updateBinding(name, gamepadBtns);
        }
        if (mouseBtns !== undefined) {
            this.byMouse.updateBinding(name, mouseBtns);
        }
        this.reconcile(state);
    }

    private reconcile(state: AppState) {
        const active = new Set([
            ...this.byKey.buttonsUsed,
            ...this.byKeyCode.buttonsUsed,
            ...this.byMouse.buttonsUsed,
            ...this.byGamepad.buttonsUsed,
            ...this.keyboardMouse.buttonsUsed(),
            ...this.virtual,
        ]);
        for (const button of active) {
            if (!this.state.down.has(button)) this.state.press(button, state);
        }
        for (const button of [...this.state.down]) {
            if (!active.has(button)) this.state.release(button, state);
        }
    }

    processKeydown(key: Key, keyCode: string, state: AppState) {
        this.byKey.handleDown(key);
        this.byKeyCode.handleDown(keyCode);
        this.keyboardMouse.keyDown(key, keyCode);
        this.reconcile(state);
    }
    processKeyup(key: Key, keyCode: string, state: AppState) {
        this.byKey.handleUp(key);
        this.byKeyCode.handleUp(keyCode);
        this.keyboardMouse.keyUp(key, keyCode);
        this.reconcile(state);
    }
    processMousedown(mb: MouseButton, state: AppState) {
        const mixed = this.keyboardMouse.pressMouse(mb);
        this.byMouse.handleDown(mb, mixed);
        this.reconcile(state);
    }
    processMouseup(mb: MouseButton, state: AppState) {
        this.byMouse.handleUp(mb);
        this.keyboardMouse.releaseMouse(mb);
        this.reconcile(state);
    }
    processGamepadButtonDown(
        gb: KGamepadButton,
        gamepadIndex: number,
        state: AppState,
    ) {
        let held = this.gamepadHeld.get(gamepadIndex);
        if (!held) {
            held = new Set();
            this.gamepadHeld.set(gamepadIndex, held);
        }
        if (held.has(gb)) return;
        const alreadyHeld = this.isGamepadButtonHeld(gb);
        held.add(gb);
        if (!alreadyHeld) this.byGamepad.handleDown(gb);
        this.reconcile(state);
    }
    processGamepadButtonUp(
        gb: KGamepadButton,
        gamepadIndex: number,
        state: AppState,
    ) {
        const held = this.gamepadHeld.get(gamepadIndex);
        if (!held?.delete(gb)) return;
        if (!held.size) this.gamepadHeld.delete(gamepadIndex);
        if (!this.isGamepadButtonHeld(gb)) this.byGamepad.handleUp(gb);
        this.reconcile(state);
    }
    releaseGamepad(gamepadIndex: number, state: AppState) {
        for (const button of [...this.gamepadHeld.get(gamepadIndex) ?? []]) {
            this.processGamepadButtonUp(button, gamepadIndex, state);
        }
    }
    private isGamepadButtonHeld(button: KGamepadButton): boolean {
        for (const held of this.gamepadHeld.values()) {
            if (held.has(button)) return true;
        }
        return false;
    }
    releaseKeyboardMouse(state: AppState) {
        this.byKey.releaseAll();
        this.byKeyCode.releaseAll();
        this.byMouse.releaseAll();
        this.keyboardMouse.releaseAll();
        this.reconcile(state);
    }
    pressVirtual(button: string, state: AppState) {
        this.virtual.add(button);
        this.reconcile(state);
    }
    releaseVirtual(button: string, state: AppState) {
        this.virtual.delete(button);
        this.reconcile(state);
    }
    update() {
        this.state.update();
    }
    process(state: AppState) {
        this.state.process(state);
    }
}

import type {
    ChordedKey,
    ChordedKGamepadButton,
    ChordedMouseButton,
    Key,
    KGamepadButton,
    MouseButton,
} from "../types";
import { type AppState, ButtonState } from "./app";

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
        appState.buttonHandler.updateBinding(b, btns[b]);
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
    committers = new Map<T, { check: Set<T>; btns: Map<string, T[]> }>();
    buttonsUsed = new Set<string>();
    updateBinding(button: string, bindings: T[]) {
        // clear out old binding
        const modsToClear = new Set<T>();
        for (let { check, btns } of this.committers.values()) {
            btns.get(button)?.forEach(b =>
                check.delete(b) && modsToClear.add(b)
            );
            btns.delete(button);
        }
        // install new one
        for (let b of bindings) {
            const mods = splitButtons(b);
            const committer = mods.pop()!;
            // add checking on the old mod keys
            for (let m of mods) {
                modsToClear.delete(m);
                if (!this.mods.has(m)) this.mods.set(m, false);
            }

            // install new buttons
            if (!this.committers.has(committer)) {
                this.committers.set(committer, {
                    check: new Set(mods),
                    btns: new Map([[button, mods]]),
                });
            }
            else {
                const e = this.committers.get(committer)!;
                mods.forEach(m => e.check.add(m));
                e.btns.set(button, mods);
            }
        }
        // cleanup
        modsToClear.forEach(m => this.mods.delete(m));
    }
    handleDown(key: T): string[] {
        if (this.mods.has(key)) {
            this.mods.set(key, true);
        }
        const commit = this.committers.get(key);
        const pressedButtons: string[] = [];
        if (commit) {
            options: for (let [button, mods] of commit.btns.entries()) {
                for (let mod of commit.check.values()) {
                    if (this.mods.get(mod) !== mods.includes(mod)) {
                        continue options;
                    }
                }
                this.buttonsUsed.add(button);
                pressedButtons.push(button);
            }
        }
        return pressedButtons;
    }
    handleUp(key: T): string[] {
        if (this.mods.has(key)) {
            this.mods.set(key, false);
        }
        const commit = this.committers.get(key);
        const canceledButtons: string[] = [];
        if (commit) {
            for (var button of commit.btns.keys()) {
                this.buttonsUsed.delete(button) && canceledButtons.push(button);
            }
        }
        return canceledButtons;
    }
}

export class ButtonProcessor {
    byKey = new ChordedButtonDetector<ChordedKey>();
    byKeyCode = new ChordedButtonDetector<string>();
    byMouse = new ChordedButtonDetector<ChordedMouseButton>();
    byGamepad = new ChordedButtonDetector<ChordedKGamepadButton>();
    state = new ButtonState<string>(
        "buttonPress",
        null,
        "buttonDown",
        "buttonRelease",
    );
    updateBinding(name: string, b: ButtonBinding) {
        const keyboardBtns = b.keyboard && [b.keyboard].flat();
        const keyboardCodes = b.keyboardCode
            && [b.keyboardCode].flat();
        const gamepadBtns = b.gamepad && [b.gamepad].flat();
        const mouseBtns = b.mouse && [b.mouse].flat();
        if (keyboardBtns) {
            this.byKey.updateBinding(name, keyboardBtns);
        }
        if (keyboardCodes) {
            this.byKeyCode.updateBinding(name, keyboardCodes);
        }
        if (gamepadBtns) {
            this.byGamepad.updateBinding(name, gamepadBtns);
        }
        if (mouseBtns) {
            this.byMouse.updateBinding(name, mouseBtns);
        }
    }
    private _maybePress(buttons: string[], state: AppState) {
        for (let button of buttons) {
            this.state.press(button, state);
        }
    }
    private _maybeRelease(buttons: string[], state: AppState) {
        for (let button of buttons) {
            this.state.release(button, state);
        }
    }
    processKeydown(key: Key, keyCode: string, state: AppState) {
        this._maybePress(this.byKey.handleDown(key), state);
        this._maybePress(this.byKeyCode.handleDown(keyCode), state);
    }
    processKeyup(key: Key, keyCode: string, state: AppState) {
        this._maybeRelease(this.byKey.handleUp(key), state);
        this._maybeRelease(this.byKeyCode.handleUp(keyCode), state);
    }
    processMousedown(mb: MouseButton, state: AppState) {
        this._maybePress(this.byMouse.handleDown(mb), state);
    }
    processMouseup(mb: MouseButton, state: AppState) {
        this._maybeRelease(this.byMouse.handleUp(mb), state);
    }
    processGamepadButtonDown(gb: KGamepadButton, state: AppState) {
        this._maybePress(this.byGamepad.handleDown(gb), state);
    }
    processGamepadButtonUp(gb: KGamepadButton, state: AppState) {
        this._maybeRelease(this.byGamepad.handleUp(gb), state);
    }
    update() {
        this.state.update();
    }
    process(state: AppState) {
        this.state.process(state);
    }
}

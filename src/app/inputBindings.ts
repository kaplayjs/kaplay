import type {
    ChordedKey,
    ChordedKGamepadButton,
    ChordedMouseButton,
    Key,
    KGamepadButton,
    MouseButton,
} from "../types";
import { mapAddOrPush } from "../utils/sets";
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
        appState.buttonHandler.addBinding(b, btns[b]);
    }
};

class ChordedButtonDetector<T = string> {
}

export class ButtonProcessor {
    byKey = new Map<Key, string[]>();
    byKeyCode = new Map<string, string[]>();
    byMouse = new Map<MouseButton, string[]>();
    byGamepad = new Map<KGamepadButton, string[]>();
    state = new ButtonState<string>();
    addBinding(name: string, b: ButtonBinding) {
        const keyboardBtns = b.keyboard && [b.keyboard].flat();
        const keyboardCodes = b.keyboardCode
            && [b.keyboardCode].flat();
        const gamepadBtns = b.gamepad && [b.gamepad].flat();
        const mouseBtns = b.mouse && [b.mouse].flat();

        if (keyboardBtns) {
            keyboardBtns.forEach((k) => {
                mapAddOrPush(this.byKey, k, name);
            });
        }

        if (keyboardCodes) {
            keyboardCodes.forEach((k) => {
                mapAddOrPush(this.byKeyCode, k, name);
            });
        }

        if (gamepadBtns) {
            gamepadBtns.forEach((g) => {
                mapAddOrPush(this.byGamepad, g, name);
            });
        }

        if (mouseBtns) {
            mouseBtns.forEach((m) => {
                mapAddOrPush(this.byMouse, m, name);
            });
        }
    }
    processKeydown(key: Key, keyCode: string, state: AppState) {
        this.byKey.get(key)?.forEach((btn) => {
            this.state.press(btn);
            state.events.trigger("buttonPress", btn);
        });
        this.byKeyCode.get(keyCode)?.forEach((btn) => {
            this.state.press(btn);
            state.events.trigger("buttonPress", btn);
        });
    }
    processKeyup(key: Key, keyCode: string, state: AppState) {
        this.byKey.get(key)?.forEach((btn) => {
            this.state.release(btn);
            state.events.trigger("buttonRelease", btn);
        });
        this.byKeyCode.get(keyCode)?.forEach((btn) => {
            this.state.release(btn);
            state.events.trigger("buttonRelease", btn);
        });
    }
    processMousedown(mb: MouseButton, state: AppState) {
        this.byMouse.get(mb)?.forEach((btn) => {
            this.state.press(btn);
            state.events.trigger("buttonPress", btn);
        });
    }
    processMouseup(mb: MouseButton, state: AppState) {
        this.byMouse.get(mb)?.forEach((btn) => {
            this.state.release(btn);
            state.events.trigger("buttonRelease", btn);
        });
    }
    processGamepadButtonDown(gb: KGamepadButton, state: AppState) {
        this.byGamepad.get(gb)?.forEach(
            (btn) => {
                this.state.press(btn);
                state.events.trigger("buttonPress", btn);
            },
        );
    }
    processGamepadButtonUp(gb: KGamepadButton, state: AppState) {
        this.byGamepad.get(gb)?.forEach(
            (btn) => {
                this.state.release(btn);
                state.events.trigger("buttonRelease", btn);
            },
        );
    }
    update() {
        this.state.update();
    }
    process(state: AppState) {
        this.state.down.forEach((btn) => {
            state.events.trigger("buttonDown", btn);
        });
    }
}

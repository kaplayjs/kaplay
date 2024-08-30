import type { KAPLAYCtx, Key, KGamepadButton, MouseButton } from "../types";
import { mapAddOrPush } from "../utils";
import { appState } from "./app";

/**
 * A button binding.
 *
 * @group Button Bindings
 */
export type ButtonBinding = {
    keyboard?: Key | Key[];
    keyboardCode?: string | string[];
    gamepad?: KGamepadButton | KGamepadButton[];
    mouse?: MouseButton | MouseButton[];
};

/**
 * A buttons definition for an action (jump, walk-left, run).
 *
 * @group Button Bindings
 */
export type ButtonsDef = Record<string, ButtonBinding>;

/**
 * A button binding device
 *
 * @group Button Bindings
 */
export type ButtonBindingDevice = "keyboard" | "gamepad" | "mouse";

export const getLastInputDeviceType: KAPLAYCtx["getLastInputDeviceType"] =
    () => {
        return appState.lastInputDevice;
    };

// pass the user `buttons` definition to different keymaps
export const parseButtonBindings = () => {
    const btns = appState.buttons;

    for (const b in btns) {
        const keyboardBtns = btns[b].keyboard && [btns[b].keyboard].flat();
        const keyboardCodes = btns[b].keyboardCode
            && [btns[b].keyboardCode].flat();
        const gamepadBtns = btns[b].gamepad && [btns[b].gamepad].flat();
        const mouseBtns = btns[b].mouse && [btns[b].mouse].flat();

        if (keyboardBtns) {
            keyboardBtns.forEach((k) => {
                mapAddOrPush(appState.buttonsByKey, k, b);
            });
        }

        if (keyboardCodes) {
            keyboardCodes.forEach((k) => {
                mapAddOrPush(appState.buttonsByKeyCode, k, b);
            });
        }

        if (gamepadBtns) {
            gamepadBtns.forEach((g) => {
                mapAddOrPush(appState.buttonsByGamepad, g, b);
            });
        }

        if (mouseBtns) {
            mouseBtns.forEach((m) => {
                mapAddOrPush(appState.buttonsByMouse, m, b);
            });
        }
    }
};

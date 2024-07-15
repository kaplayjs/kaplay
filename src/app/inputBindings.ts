import type { KaboomCtx, Key, KGamepadButton, MouseButton } from "../types";
import { appState } from "./app";

/**
 * A button binding.
 *
 * @group Button Bindings
 */
export type ButtonBinding = {
    keyboard?: Key | Key[];
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

export const getLastDevice: KaboomCtx["getLastDevice"] = () => {
    return appState.lastInputDevice;
};

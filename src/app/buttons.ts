import { _k } from "../shared";
import type { ButtonBinding } from "./inputBindings";

// Getting / Setting bindings

export const getButtons = () => {
    return _k.app.state.buttons;
};

export const getButton = (btn: string): ButtonBinding => {
    return _k.app.state.buttons?.[btn];
};

export const setButton = (btn: string, binding: ButtonBinding) => {
    _k.app.state.buttons[btn] = {
        ..._k.app.state.buttons[btn],
        ...binding,
    };
    _k.app.state.buttonHandler.updateBinding(btn, binding);
};

// Virtually pressing / releasing

export const pressButton = (btn: string) => {
    _k.app.state.buttonHandler.state.press(btn, _k.app.state);
};

export const releaseButton = (btn: string) => {
    _k.app.state.buttonHandler.state.release(btn, _k.app.state);
};

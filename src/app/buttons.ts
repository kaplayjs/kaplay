import { _k } from "../shared";
import { parseButtonBindings, type ButtonBinding } from "./inputBindings";

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

    parseButtonBindings(_k.app.state);
};

// Virtually pressing / releasing

export const pressButton = (btn: string) => {
    _k.app.state.buttonState.press(btn);
    _k.app.state.events.trigger("buttonPress", btn);
};

export const releaseButton = (btn: string) => {
    _k.app.state.buttonState.release(btn);
    _k.app.state.events.trigger("buttonRelease", btn);
};

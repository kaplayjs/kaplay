import { _k } from "../shared";
import type { MouseButton } from "../types";

// factory function for double/multi-click action callback
export function multiClick(
    n: number,
    cb: (btn: MouseButton, count: number) => void,
    delay?: number,
    button?: MouseButton | MouseButton[],
) {
    // stores the state of the mouse button (how many clicks total, clicks in a row, n goal and the timer)
    // nth means clicks toward current target
    const state = new Map(); // button -> { total, count, nth, timer }

    const getState = (btn: MouseButton) => {
        let s = state.get(btn);
        if (!s) {
            s = { total: 0, count: 0, nth: 0, timer: undefined };
            state.set(btn, s);
        }
        return s;
    };

    // returns a function that runs when you call onMouseMultiPress
    // btn defaults to "left" in case this is called without one
    return (btn = "left" as MouseButton) => {
        if (
            button && !(typeof button === "string"
                ? button === btn
                : button.includes(btn))
        ) return;

        // gets the state of that mouse button
        const s = getState(btn);
        // increases the stats
        s.total++;
        s.count++;
        s.nth++;

        // resets the timer
        if (s.timer) s.timer.cancel();
        // creates a new timer to wait for the amount of delay
        // if no new clicks then stops litening for them
        s.timer = _k.game.root.wait(
            delay ?? _k.globalOpt.doubleClickDelay ?? 0.5,
            () => {
                s.nth = 0;
                s.count = 0;
                s.timer = undefined;
            },
        );

        // if the amount of clicks reaches the goal, the clicks reset and the function runs
        if (s.nth === n) {
            s.nth = 0;
            _k.app.state.multiClick.add(`${n}:${btn}`);
            cb(btn, s.count);
        }
    };
}

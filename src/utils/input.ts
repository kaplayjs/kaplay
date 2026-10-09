import type { TimerController } from "../ecs/components/misc/timer";
import { KEventController } from "../events/events";
import { _k } from "../shared";
import type { MouseButton } from "../types";

/**
 * State to track multiPress
 */
export class MultiPressState {
    /**
     * '`n:button:delay`, streak', e.g. '2:left:0.5, 1', streak will be 2 if clicked 4 times in a row, delay can be undefined
     */
    active = new Map<string, number>();

    /**
     * Timed handlers to be processed on raw input e.g. canvas mousedown
     */
    handlers: {
        nbd: string; // `n:btn:delay` e.g. `2:left:0.5` is double left-click at 0.5 delay
        process: (btn: MouseButton) => unknown;
        cancel: () => void;
    }[] = [];

    push(
        n: number,
        handler: (btn?: MouseButton) => unknown,
        btn: MouseButton,
        delay?: number,
        cond?: () => boolean,
    ) {
        const h = {
            nbd: `${n}:${btn}:${delay}`,
            process: (btn: MouseButton) => (cond?.() ?? true) && handler(btn),
            cancel: () => {
                const idx = this.handlers.indexOf(h);
                if (idx !== -1) this.handlers.splice(idx, 1);
            },
        };
        this.handlers.push(h);
        return h;
    }
    has(n: number, btn: MouseButton, delay?: number) {
        return this.handlers.findIndex(h => h.nbd === `${n}:${btn}:${delay}`)
            >= 0;
    }
    isActive(n: number, btn: MouseButton, delay?: number) {
        return this.active.has(`${n}:${btn}:${delay}`);
    }
    process(btn: MouseButton) {
        this.handlers.forEach(h => h.process(btn));
    }
    update() {
        this.active.clear();
    }
    clear() {
        this.handlers.length = 0;
    }
}

/**
 * Factory function that registers a timed handler for e.g. multi-click
 *
 * @param n - number of clicks in a row to trigger
 * @param cb - callback to be triggered
 * @param delay - seconds between
 * @param button - optional
 * @param condition - optional, fn boolean evaluated if timed handler should be processed
 * @param initialCount - optional, handy when creating multiPress handler ad-hoc inside another press listener
 * @param state - optional, defaults to multiclick app state
 *
 * @returns Object with a callback function that should run when you call e.g. onMouseMultiPress and cancel fn to cancel registered timed handler
 */
export function multiPress(
    n: number,
    cb?: (btn: MouseButton, count: number) => void,
    delay?: number,
    button?: MouseButton,
    condition?: () => boolean,
    initCount: number = 0,
    state = _k.app.state.multiClick,
) {
    // stores the state of the mouse button (how many clicks total, clicks in a row, n goal and the timer)
    // nth means clicks toward current target
    const btnState = new Map<
        MouseButton,
        {
            count: number;
            total: number;
            nth: number;
            timer?: TimerController;
        }
    >();

    const getBtnState = (btn: MouseButton) => {
        let s = btnState.get(btn);
        if (!s) {
            s = {
                total: initCount,
                count: initCount,
                nth: initCount,
                timer: undefined,
            };
            btnState.set(btn, s);
        }
        return s;
    };

    // btn defaults to "left" in case this is called without one
    const handler = (btn = "left" as MouseButton) => {
        // gets the state of that mouse button
        const s = getBtnState(btn);
        // increases the stats
        s.total++;
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

        // if the amount of clicks reaches the goal, the clicks reset
        // and marks it as active so callback passes
        if (s.nth === n) {
            s.nth = 0;
            s.count++;
            state.active.set(`${n}:${btn}:${delay}`, s.count);
        }
    };

    // register handler and save cancel to be returned
    const cancel =
        state.push(n, handler, button ?? "left", delay, condition).cancel;

    return {
        cb: (btn = "left" as MouseButton) => {
            const c = state.active.get(`${n}:${btn}:${delay}`);
            return c != null && cb?.(btn, c);
        },
        cancel,
    };
}

/**
 * Register multiPress handler, and attach canceller on passed event controller
 *
 * @param ev - Event to attach to
 * @param args - Params of {@link multiPress}
 *
 * @returns Combined event controller that cancels both timed handler and passed event
 */
export function onMultiPress(
    ev: (cb: ReturnType<typeof multiPress>["cb"]) => KEventController,
    ...args: Parameters<typeof multiPress>
) {
    const { cb, cancel } = multiPress(...args);
    const ec = ev(cb);
    return KEventController.join([ec, new KEventController(cancel)]);
}

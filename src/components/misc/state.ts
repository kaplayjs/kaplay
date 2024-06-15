import type { StateComp } from "../../types";
import { Event, EventController } from "../../utils";

export function state(
    initState: string,
    stateList?: string[],
    transitions?: Record<string, string | string[]>,
): StateComp {
    if (!initState) {
        throw new Error("state() requires an initial state");
    }

    const events = {};

    function initStateEvents(state: string) {
        if (!events[state]) {
            events[state] = {
                enter: new Event(),
                end: new Event(),
                update: new Event(),
                draw: new Event(),
            };
        }
    }

    function on(event, state, action) {
        initStateEvents(state);
        return events[state][event].add(action);
    }

    function trigger(event, state, ...args) {
        initStateEvents(state);
        events[state][event].trigger(...args);
    }

    let didFirstEnter = false;

    return {
        id: "state",
        state: initState,

        enterState(state: string, ...args) {
            didFirstEnter = true;

            if (stateList && !stateList.includes(state)) {
                throw new Error(`State not found: ${state}`);
            }

            const oldState = this.state;

            if (transitions) {
                // check if the transition is legal, if transition graph is defined
                if (!transitions?.[oldState]) {
                    return;
                }

                const available = typeof transitions[oldState] === "string"
                    ? [transitions[oldState]]
                    : transitions[oldState] as string[];

                if (!available.includes(state)) {
                    throw new Error(
                        `Cannot transition state from "${oldState}" to "${state}". Available transitions: ${
                            available.map((s) => `"${s}"`).join(", ")
                        }`,
                    );
                }
            }

            trigger("end", oldState, ...args);
            this.state = state;
            trigger("enter", state, ...args);
            trigger("enter", `${oldState} -> ${state}`, ...args);
        },

        onStateTransition(
            from: string,
            to: string,
            action: () => void,
        ): EventController {
            return on("enter", `${from} -> ${to}`, action);
        },

        onStateEnter(state: string, action: () => void): EventController {
            return on("enter", state, action);
        },

        onStateUpdate(state: string, action: () => void): EventController {
            return on("update", state, action);
        },

        onStateDraw(state: string, action: () => void): EventController {
            return on("draw", state, action);
        },

        onStateEnd(state: string, action: () => void): EventController {
            return on("end", state, action);
        },

        update() {
            // execute the enter event for initState
            if (!didFirstEnter) {
                trigger("enter", initState);
                didFirstEnter = true;
            }
            trigger("update", this.state);
        },

        draw() {
            trigger("draw", this.state);
        },

        inspect() {
            return this.state;
        },
    };
}

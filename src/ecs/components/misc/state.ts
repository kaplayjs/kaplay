import { KEvent, KEventController } from "../../../events/events";
import type { Comp } from "../../../types";

/**
 * The serialized {@link state `state()`} component.
 *
 * @group Component Serializations
 */
export interface SerializeStateComp {
    initState: string;
    stateList: string[];
    transitions: Record<string, string | string[]>;
}

/**
 * The {@link state `state()`} component.
 *
 * @group Component Types
 */
export interface StateComp<T extends string> extends Comp {
    /**
     * Current state.
     */
    state: T;
    /**
     * Enter a state, trigger onStateEnd for previous state and onStateEnter for the new State state.
     */
    enterState: (state: T, ...args: any) => void;
    /**
     * Register event that runs once when a specific state transition happens. Accepts arguments passed from `enterState(name, ...args)`.
     *
     * @since v2000.2
     */
    onStateTransition(
        from: T,
        to: T,
        action: () => void,
    ): KEventController;
    /**
     * Register event that runs once when enters a specific state. Accepts arguments passed from `enterState(name, ...args)`.
     */
    onStateEnter: (
        state: T,
        action: (...args: any) => void,
    ) => KEventController;
    /**
     * Register an event that runs once when leaves a specific state.
     */
    onStateEnd: (state: T, action: () => void) => KEventController;
    /**
     * Register an event that runs every frame when in a specific state.
     */
    onStateUpdate: (state: T, action: () => void) => KEventController;
    /**
     * Register an event that runs every frame when in a specific state.
     */
    onStateDraw: (state: T, action: () => void) => KEventController;
    serialize(): SerializeStateComp;
}

export function state<T extends string>(
    initState: T,
    stateList?: T[],
    transitions?: Record<T, T | T[]>,
): StateComp<T> {
    if (!initState) {
        throw new Error("state() requires an initial state");
    }

    const events: { [k: string]: any } = {};

    function initStateEvents(state: string) {
        if (!events[state]) {
            events[state] = {
                enter: new KEvent(),
                end: new KEvent(),
                update: new KEvent(),
                draw: new KEvent(),
            };
        }
    }

    function on(event: string, state: string, action: () => void) {
        initStateEvents(state);
        return events[state][event].add(action);
    }

    function trigger(event: string, state: string, ...args: any[]) {
        initStateEvents(state);
        events[state][event].trigger(...args);
    }

    let didFirstEnter = false;

    return {
        id: "state",
        state: initState,

        enterState(state, ...args) {
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
        ): KEventController {
            return on("enter", `${from} -> ${to}`, action);
        },

        onStateEnter(state: string, action: () => void): KEventController {
            return on("enter", state, action);
        },

        onStateUpdate(state: string, action: () => void): KEventController {
            return on("update", state, action);
        },

        onStateDraw(state: string, action: () => void): KEventController {
            return on("draw", state, action);
        },

        onStateEnd(state: string, action: () => void): KEventController {
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
            return `state: ${this.state}`;
        },

        serialize() {
            const data: any = {};
            data.initState = initState;
            if (stateList) data.stateList = stateList.slice();
            if (transitions) data.transitions = Object.assign({}, transitions);
            return data;
        },
    };
}

export function stateFactory(data: SerializeStateComp) {
    return state(data.initState, data.stateList, data.transitions);
}

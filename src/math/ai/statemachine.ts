type EnterCallback = (sm: StateMachine, previous: string) => void;
type UpdateCallback = (sm: StateMachine, current: string) => void;
type DrawCallback = (sm: StateMachine, current: string) => void;
type ExitCallback = (sm: StateMachine, next: string) => void;
type TransitionCallback = (sm: StateMachine, from: string, to: string) => void;

type StateCallbacks = {
    enter?: EnterCallback;
    update?: UpdateCallback;
    draw?: DrawCallback;
    exit?: ExitCallback;
};

class State {
    name: string;
    callbacks: StateCallbacks;
    transitions: Record<string, TransitionCallback> = {};
    constructor(name: string, callbacks: StateCallbacks) {
        this.name = name;
        this.callbacks = callbacks;
    }
}

/**
 * A finite state machine
 */
export class StateMachine {
    stateMap: Record<string, State> = {};
    state: State | undefined;

    /**
     * Create a machine given the states and initial state
     * @param states The states the machine can be in
     * @param initialState The initial state it will enter if given
     */
    constructor(states: string[]) {
        states.forEach(name => {
            this.stateMap[name] = new State(name, {});
        });
    }

    /**
     * Make the machine enter a state
     * @param name The new state
     */
    enterState(name: string) {
        let oldStateName = this.state?.name || "";

        // Exit old state
        if (this.state?.callbacks.exit) {
            this.state.callbacks.exit(this, name);
        }

        if (this.state?.transitions[name]) {
            this.state.transitions[name](this, oldStateName, name);
        }

        // Enter new state
        this.state = this.stateMap[name];
        if (this.state.callbacks.enter) {
            this.state.callbacks.enter(this, oldStateName);
        }
    }

    /**
     * Set a callback for when the machine enters a state
     * @param name The state
     * @param cb The callback
     */
    onStateEnter(name: string, cb: EnterCallback) {
        const state = this.stateMap[name];
        if (state) {
            state.callbacks.enter = cb;
        }
    }

    /**
     * Set a callback for when the machine updates a state
     * @param name The state
     * @param cb The callback
     */
    onStateUpdate(name: string, cb: UpdateCallback) {
        const state = this.stateMap[name];
        if (state) {
            state.callbacks.update = cb;
        }
    }

    /**
     * Set a callback for when the machine draws a state
     * @param name The state
     * @param cb The callback
     */
    onStateDraw(name: string, cb: DrawCallback) {
        const state = this.stateMap[name];
        if (state) {
            state.callbacks.draw = cb;
        }
    }

    /**
     * Set a callback for when the machine exits a state
     * @param name The state
     * @param cb The callback
     */
    onStateExit(name: string, cb: ExitCallback) {
        const state = this.stateMap[name];
        if (state) {
            state.callbacks.exit = cb;
        }
    }

    /**
     * Set a callback for when the machine transitions from one state to the other state
     * @param from The state which is exited
     * @param to The state which is entered
     * @param cb The callback
     */
    onStateTransition(from: string, to: string, cb: TransitionCallback) {
        const state = this.stateMap[from];
        if (state) {
            state.transitions[to] = cb;
        }
    }
}

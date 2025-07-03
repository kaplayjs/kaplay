"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.state = state;
var events_1 = require("../../../events/events");
function state(initState, stateList, transitions) {
    if (!initState) {
        throw new Error("state() requires an initial state");
    }
    var events = {};
    function initStateEvents(state) {
        if (!events[state]) {
            events[state] = {
                enter: new events_1.KEvent(),
                end: new events_1.KEvent(),
                update: new events_1.KEvent(),
                draw: new events_1.KEvent(),
            };
        }
    }
    function on(event, state, action) {
        initStateEvents(state);
        return events[state][event].add(action);
    }
    function trigger(event, state) {
        var _a;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        initStateEvents(state);
        (_a = events[state][event]).trigger.apply(_a, args);
    }
    var didFirstEnter = false;
    return {
        id: "state",
        state: initState,
        enterState: function (state) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            didFirstEnter = true;
            if (stateList && !stateList.includes(state)) {
                throw new Error("State not found: ".concat(state));
            }
            var oldState = this.state;
            if (transitions) {
                // check if the transition is legal, if transition graph is defined
                if (!(transitions === null || transitions === void 0 ? void 0 : transitions[oldState])) {
                    return;
                }
                var available = typeof transitions[oldState] === "string"
                    ? [transitions[oldState]]
                    : transitions[oldState];
                if (!available.includes(state)) {
                    throw new Error("Cannot transition state from \"".concat(oldState, "\" to \"").concat(state, "\". Available transitions: ").concat(available.map(function (s) { return "\"".concat(s, "\""); }).join(", ")));
                }
            }
            trigger.apply(void 0, __spreadArray(["end", oldState], args, false));
            this.state = state;
            trigger.apply(void 0, __spreadArray(["enter", state], args, false));
            trigger.apply(void 0, __spreadArray(["enter", "".concat(oldState, " -> ").concat(state)], args, false));
        },
        onStateTransition: function (from, to, action) {
            return on("enter", "".concat(from, " -> ").concat(to), action);
        },
        onStateEnter: function (state, action) {
            return on("enter", state, action);
        },
        onStateUpdate: function (state, action) {
            return on("update", state, action);
        },
        onStateDraw: function (state, action) {
            return on("draw", state, action);
        },
        onStateEnd: function (state, action) {
            return on("end", state, action);
        },
        update: function () {
            // execute the enter event for initState
            if (!didFirstEnter) {
                trigger("enter", initState);
                didFirstEnter = true;
            }
            trigger("update", this.state);
        },
        draw: function () {
            trigger("draw", this.state);
        },
        inspect: function () {
            return "state: ".concat(this.state);
        },
    };
}

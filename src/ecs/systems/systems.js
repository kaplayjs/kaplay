"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.system = exports.LCEvents = void 0;
var shared_1 = require("../../shared");
// Lifecycle events
var LCEvents;
(function (LCEvents) {
    LCEvents[LCEvents["BeforeUpdate"] = 0] = "BeforeUpdate";
    LCEvents[LCEvents["BeforeFixedUpdate"] = 1] = "BeforeFixedUpdate";
    LCEvents[LCEvents["BeforeDraw"] = 2] = "BeforeDraw";
    LCEvents[LCEvents["AfterUpdate"] = 3] = "AfterUpdate";
    LCEvents[LCEvents["AfterFixedUpdate"] = 4] = "AfterFixedUpdate";
    LCEvents[LCEvents["AfterDraw"] = 5] = "AfterDraw";
})(LCEvents || (exports.LCEvents = LCEvents = {}));
var system = function (name, action, when) {
    var systems = shared_1._k.game.systems;
    var replacingSystemIdx = systems.findIndex(function (s) { return s.name === name; });
    // if existent system, remove it
    if (replacingSystemIdx != -1) {
        var replacingSystem = systems[replacingSystemIdx];
        var when_3 = replacingSystem.when;
        for (var _i = 0, when_1 = when_3; _i < when_1.length; _i++) {
            var loc = when_1[_i];
            var idx = shared_1._k.game.systemsByEvent[loc].findIndex(function (s) { return s.name === name; });
            shared_1._k.game.systemsByEvent[loc].splice(idx, 1);
        }
    }
    var system = {
        name: name,
        run: action,
        when: when,
    };
    for (var _a = 0, when_2 = when; _a < when_2.length; _a++) {
        var loc = when_2[_a];
        shared_1._k.game.systemsByEvent[loc].push(system);
    }
    systems.push({ name: name, run: action, when: when });
};
exports.system = system;

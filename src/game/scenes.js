"use strict";
var __spreadArray = (this && this.__spreadArray) || function(to, from, pack) {
    if (pack || arguments.length === 2) {
        for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) {
                    ar = Array.prototype.slice.call(from, 0, i);
                }
                ar[i] = from[i];
            }
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scene = scene;
exports.go = go;
exports.onSceneLeave = onSceneLeave;
exports.getSceneName = getSceneName;
var appEvents_1 = require("../app/appEvents");
var math_1 = require("../math/math");
var shared_1 = require("../shared");
function scene(id, def) {
    shared_1._k.game.scenes[id] = def;
}
function go(name) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (!shared_1._k.game.scenes[name]) {
        throw new Error("Scene not found: ".concat(name));
    }
    shared_1._k.game.events.onOnce("frameEnd", function() {
        var _a;
        shared_1._k.game.events.trigger("sceneLeave", name);
        shared_1._k.app.events.clear();
        shared_1._k.game.events.clear();
        __spreadArray([], shared_1._k.game.root.children, true).forEach(
            function(obj) {
                if (
                    !obj.stay
                    || (obj.scenesToStay && !obj.scenesToStay.includes(name))
                ) {
                    shared_1._k.game.root.remove(obj);
                }
                else {
                    obj.trigger("sceneEnter", name);
                }
            },
        );
        shared_1._k.game.root.clearEvents();
        (0, appEvents_1.initAppEvents)();
        // cam
        shared_1._k.game.cam = {
            pos: null,
            scale: (0, math_1.vec2)(1),
            angle: 0,
            shake: 0,
            transform: new math_1.Mat23(),
        };
        (_a = shared_1._k.game.scenes)[name].apply(_a, args);
    });
    shared_1._k.game.currentScene = name;
}
function onSceneLeave(action) {
    return shared_1._k.game.events.on("sceneLeave", action);
}
function getSceneName() {
    return shared_1._k.game.currentScene;
}

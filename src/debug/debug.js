"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebug = void 0;
var general_1 = require("../constants/general");
var createDebug = function (gopt, app, appGfx, audio, game, fr) {
    var debugPaused = false;
    var debug = {
        inspect: false,
        set timeScale(timeScale) {
            app.state.timeScale = timeScale;
        },
        get timeScale() {
            return app.state.timeScale;
        },
        showLog: true,
        fps: function () { return app.fps(); },
        numFrames: function () { return app.numFrames(); },
        stepFrame: fr.updateFrame,
        drawCalls: function () { return appGfx.lastDrawCalls; },
        clearLog: function () { return game.logs = []; },
        log: function () {
            var _a;
            var msgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                msgs[_i] = arguments[_i];
            }
            var max = (_a = gopt.logMax) !== null && _a !== void 0 ? _a : general_1.LOG_MAX;
            var msg = msgs.length > 1 ? msgs.concat(" ").join(" ") : msgs[0];
            game.logs.unshift({
                msg: msg,
                time: app.time(),
            });
            if (game.logs.length > max) {
                game.logs = game.logs.slice(0, max);
            }
        },
        error: function (msg) {
            return debug.log(new Error(msg.toString ? msg.toString() : msg));
        },
        curRecording: null,
        numObjects: function () { return game.root.get("*", { recursive: true }).length; },
        get paused() {
            return debugPaused;
        },
        set paused(v) {
            debugPaused = v;
            if (v) {
                audio.ctx.suspend();
            }
            else {
                audio.ctx.resume();
            }
        },
    };
    return debug;
};
exports.createDebug = createDebug;

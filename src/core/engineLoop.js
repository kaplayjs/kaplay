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
exports.startEngineLoop = startEngineLoop;
var appEvents_1 = require("../app/appEvents");
var asset_1 = require("../assets/asset");
var systems_1 = require("../ecs/systems/systems");
var drawDebug_1 = require("../gfx/draw/drawDebug");
var drawFrame_1 = require("../gfx/draw/drawFrame");
var drawLoadingScreen_1 = require("../gfx/draw/drawLoadingScreen");
var viewport_1 = require("../gfx/viewport");
var errors_1 = require("./errors");
function startEngineLoop(app, game, assets, gopt, frameRenderer, debug) {
    var isFirstFrame = true;
    app.run(function() {
        try {
            if (assets.loaded) {
                if (!debug.paused) {
                    for (
                        var _i = 0,
                            _a = game
                                .systemsByEvent[
                                    systems_1.LCEvents.BeforeFixedUpdate
                                ];
                        _i < _a.length;
                        _i++
                    ) {
                        var sys = _a[_i];
                        sys.run();
                    }
                    frameRenderer.fixedUpdateFrame();
                    for (
                        var _b = 0,
                            _c = game
                                .systemsByEvent[
                                    systems_1.LCEvents.AfterFixedUpdate
                                ];
                        _b < _c.length;
                        _b++
                    ) {
                        var sys = _c[_b];
                        sys.run();
                    }
                }
                // checkFrame();
            }
        } catch (e) {
            (0, errors_1.handleErr)(e);
        }
    }, function(processInput, resetInput) {
        try {
            processInput();
            if (!assets.loaded) {
                if ((0, asset_1.loadProgress)() === 1 && !isFirstFrame) {
                    assets.loaded = true;
                    (0, asset_1.getFailedAssets)().forEach(function(details) {
                        var _a;
                        return (_a = game.events).trigger.apply(
                            _a,
                            __spreadArray(["loadError"], details, false),
                        );
                    });
                    game.events.trigger("load");
                }
            }
            if (
                !assets.loaded && gopt.loadingScreen !== false
                || isFirstFrame
            ) {
                frameRenderer.frameStart();
                // TODO: Currently if assets are not initially loaded no updates or timers will be run, however they will run if loadingScreen is set to false. What's the desired behavior or should we make them consistent?
                (0, drawLoadingScreen_1.drawLoadScreen)();
                frameRenderer.frameEnd();
            }
            else {
                if (!debug.paused) {
                    for (
                        var _i = 0,
                            _a = game
                                .systemsByEvent[
                                    systems_1.LCEvents.BeforeUpdate
                                ];
                        _i < _a.length;
                        _i++
                    ) {
                        var sys = _a[_i];
                        sys.run();
                    }
                    frameRenderer.updateFrame();
                    for (
                        var _b = 0,
                            _c = game
                                .systemsByEvent[systems_1.LCEvents.AfterUpdate];
                        _b < _c.length;
                        _b++
                    ) {
                        var sys = _c[_b];
                        sys.run();
                    }
                }
                // checkFrame();
                frameRenderer.frameStart();
                for (
                    var _d = 0,
                        _e = game.systemsByEvent[systems_1.LCEvents.BeforeDraw];
                    _d < _e.length;
                    _d++
                ) {
                    var sys = _e[_d];
                    sys.run();
                }
                (0, drawFrame_1.drawFrame)();
                if (gopt.debug !== false) {
                    (0, drawDebug_1.drawDebug)();
                }
                for (
                    var _f = 0,
                        _g = game.systemsByEvent[systems_1.LCEvents.AfterDraw];
                    _f < _g.length;
                    _f++
                ) {
                    var sys = _g[_f];
                    sys.run();
                }
                frameRenderer.frameEnd();
            }
            if (isFirstFrame) {
                isFirstFrame = false;
            }
            game.events.trigger("frameEnd");
            resetInput();
        } catch (e) {
            (0, errors_1.handleErr)(e);
        }
    });
    (0, viewport_1.updateViewport)();
    (0, appEvents_1.initAppEvents)();
}

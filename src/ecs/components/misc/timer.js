"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timer = timer;
var events_1 = require("../../../events/events");
var easings_1 = require("../../../math/easings");
var lerp_1 = require("../../../math/lerp");
var shared_1 = require("../../../shared");
function timer(maxLoopsPerFrame) {
    if (maxLoopsPerFrame === void 0) { maxLoopsPerFrame = 1000; }
    return {
        id: "timer",
        maxLoopsPerFrame: maxLoopsPerFrame,
        loop: function (time, action, count, waitFirst) {
            var _this = this;
            if (count === void 0) { count = Infinity; }
            if (waitFirst === void 0) { waitFirst = false; }
            var t = waitFirst ? 0 : time;
            var onEndEvents = new events_1.KEvent();
            var ev = this.onUpdate(function () {
                t += shared_1._k.app.state.dt;
                for (var i = 0; t >= time && i < _this.maxLoopsPerFrame; i++) {
                    count--;
                    action();
                    t -= time;
                    if (count <= 0) {
                        ev.cancel();
                        onEndEvents.trigger();
                        return;
                    }
                }
            });
            return {
                get timeLeft() {
                    return t;
                },
                set timeLeft(val) {
                    t = val;
                },
                get paused() {
                    return ev.paused;
                },
                set paused(p) {
                    ev.paused = p;
                },
                cancel: ev.cancel,
                onEnd: function (f) {
                    onEndEvents.add(f);
                },
                then: function (f) {
                    onEndEvents.add(f);
                    return this;
                },
            };
        },
        wait: function (time, action) {
            return this.loop(time, action !== null && action !== void 0 ? action : (function () { }), 1, true);
        },
        tween: function (from, to, duration, setValue, easeFunc) {
            if (easeFunc === void 0) { easeFunc = easings_1.easings.linear; }
            var curTime = 0;
            var onEndEvents = [];
            var ev = this.onUpdate(function () {
                curTime += shared_1._k.app.state.dt;
                var t = Math.min(curTime / duration, 1);
                setValue((0, lerp_1.lerp)(from, to, easeFunc(t)));
                if (t === 1) {
                    ev.cancel();
                    setValue(to);
                    onEndEvents.forEach(function (action) { return action(); });
                }
            });
            return {
                get currentTime() {
                    return curTime;
                },
                set currentTime(val) {
                    curTime = val;
                },
                get timeLeft() {
                    return duration - curTime;
                },
                set timeLeft(val) {
                    curTime = duration - val;
                },
                get paused() {
                    return ev.paused;
                },
                set paused(p) {
                    ev.paused = p;
                },
                onEnd: function (action) {
                    onEndEvents.push(action);
                },
                then: function (action) {
                    this.onEnd(action);
                    return this;
                },
                cancel: function () {
                    ev.cancel();
                },
                finish: function () {
                    ev.cancel();
                    setValue(to);
                    onEndEvents.forEach(function (action) { return action(); });
                },
            };
        },
    };
}

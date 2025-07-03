"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playMusic = playMusic;
var events_1 = require("../events/events");
var clamp_1 = require("../math/clamp");
var shared_1 = require("../shared");
function playMusic(url, opt) {
    var _a;
    if (opt === void 0) opt = {};
    var onEndEvents = new events_1.KEvent();
    var el = new Audio(url);
    el.crossOrigin = "anonymous";
    el.loop = Boolean(opt.loop);
    var src = shared_1._k.audio.ctx.createMediaElementSource(el);
    src.connect(
        (_a = opt.connectTo) !== null && _a !== void 0
            ? _a
            : shared_1._k.audio.masterNode,
    );
    function resumeAudioCtx() {
        if (shared_1._k.debug.paused) {
            return;
        }
        if (
            shared_1._k.app.isHidden() && !shared_1._k.globalOpt.backgroundAudio
        ) {
            return;
        }
        shared_1._k.audio.ctx.resume();
    }
    function play() {
        resumeAudioCtx();
        el.play();
    }
    if (!opt.paused) {
        play();
    }
    el.onended = function() {
        return onEndEvents.trigger();
    };
    return {
        play: function() {
            play();
        },
        seek: function(time) {
            el.currentTime = time;
        },
        stop: function() {
            el.pause();
            this.seek(0);
        },
        set loop(l) {
            el.loop = l;
        },
        get loop() {
            return el.loop;
        },
        set paused(p) {
            if (p) {
                el.pause();
            }
            else {
                play();
            }
        },
        get paused() {
            return el.paused;
        },
        time: function() {
            return el.currentTime;
        },
        duration: function() {
            return el.duration;
        },
        set volume(val) {
            el.volume = (0, clamp_1.clamp)(val, 0, 1);
        },
        get volume() {
            return el.volume;
        },
        set speed(s) {
            el.playbackRate = Math.max(s, 0);
        },
        get speed() {
            return el.playbackRate;
        },
        set detune(d) {
            // TODO
        },
        get detune() {
            // TODO
            return 0;
        },
        onEnd: function(action) {
            return onEndEvents.add(action);
        },
        then: function(action) {
            return this.onEnd(action);
        },
        connect: function(node) {
            src.disconnect();
            src.connect(
                node !== null && node !== void 0
                    ? node
                    : shared_1._k.audio.masterNode,
            );
        },
    };
}

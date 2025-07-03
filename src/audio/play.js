"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.play = play;
var asset_1 = require("../assets/asset");
var sound_1 = require("../assets/sound");
var events_1 = require("../events/events");
var shared_1 = require("../shared");
var playMusic_1 = require("./playMusic");
function play(src, opt) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (opt === void 0) { opt = {}; }
    if (typeof src === "string" && shared_1._k.assets.music[src]) {
        return (0, playMusic_1.playMusic)(shared_1._k.assets.music[src], opt);
    }
    var ctx = shared_1._k.audio.ctx;
    var paused = (_a = opt.paused) !== null && _a !== void 0 ? _a : false;
    var srcNode = ctx.createBufferSource();
    var onEndEvents = new events_1.KEvent();
    var gainNode = ctx.createGain();
    var panNode = ctx.createStereoPanner();
    var pos = (_b = opt.seek) !== null && _b !== void 0 ? _b : 0;
    var startTime = 0;
    var stopTime = 0;
    var started = false;
    srcNode.loop = Boolean(opt.loop);
    srcNode.detune.value = (_c = opt.detune) !== null && _c !== void 0 ? _c : 0;
    srcNode.playbackRate.value = (_d = opt.speed) !== null && _d !== void 0 ? _d : 1;
    srcNode.connect(panNode);
    srcNode.onended = function () {
        var _a, _b;
        if (getTime()
            >= ((_b = (_a = srcNode.buffer) === null || _a === void 0 ? void 0 : _a.duration) !== null && _b !== void 0 ? _b : Number.POSITIVE_INFINITY)) {
            onEndEvents.trigger();
        }
    };
    panNode.pan.value = (_e = opt.pan) !== null && _e !== void 0 ? _e : 0;
    panNode.connect(gainNode);
    gainNode.connect((_f = opt.connectTo) !== null && _f !== void 0 ? _f : shared_1._k.audio.masterNode);
    gainNode.gain.value = (_g = opt.volume) !== null && _g !== void 0 ? _g : 1;
    var start = function (data) {
        srcNode.buffer = data.buf;
        if (!paused) {
            startTime = ctx.currentTime;
            srcNode.start(0, pos);
            started = true;
        }
    };
    var snd = (0, sound_1.resolveSound)(
    // @ts-expect-error Resolve Type Error
    src);
    if (snd instanceof asset_1.Asset) {
        snd.onLoad(start);
    }
    var getTime = function () {
        if (!srcNode.buffer)
            return 0;
        var t = paused
            ? stopTime - startTime
            : ctx.currentTime - startTime;
        var d = srcNode.buffer.duration;
        return srcNode.loop ? t % d : Math.min(t, d);
    };
    var cloneNode = function (oldNode) {
        var newNode = ctx.createBufferSource();
        newNode.buffer = oldNode.buffer;
        newNode.loop = oldNode.loop;
        newNode.playbackRate.value = oldNode.playbackRate.value;
        newNode.detune.value = oldNode.detune.value;
        newNode.onended = oldNode.onended;
        newNode.connect(panNode);
        return newNode;
    };
    return {
        stop: function () {
            this.paused = true;
            this.seek(0);
        },
        set paused(p) {
            if (paused === p)
                return;
            paused = p;
            if (p) {
                if (started) {
                    srcNode.stop();
                    started = false;
                }
                stopTime = ctx.currentTime;
            }
            else {
                srcNode = cloneNode(srcNode);
                var pos_1 = stopTime - startTime;
                srcNode.start(0, pos_1);
                started = true;
                startTime = ctx.currentTime - pos_1;
                stopTime = 0;
            }
        },
        get paused() {
            return paused;
        },
        play: function (time) {
            if (time === void 0) { time = 0; }
            this.seek(time);
            this.paused = false;
        },
        seek: function (time) {
            var _a;
            if (!((_a = srcNode.buffer) === null || _a === void 0 ? void 0 : _a.duration))
                return;
            if (time > srcNode.buffer.duration)
                return;
            if (paused) {
                srcNode = cloneNode(srcNode);
                startTime = stopTime - time;
            }
            else {
                srcNode.stop();
                srcNode = cloneNode(srcNode);
                startTime = ctx.currentTime - time;
                srcNode.start(0, time);
                started = true;
                stopTime = 0;
            }
        },
        // TODO: affect time()
        set speed(val) {
            srcNode.playbackRate.value = val;
        },
        get speed() {
            return srcNode.playbackRate.value;
        },
        set detune(val) {
            srcNode.detune.value = val;
        },
        get detune() {
            return srcNode.detune.value;
        },
        set volume(val) {
            gainNode.gain.value = Math.max(val, 0);
        },
        get volume() {
            return gainNode.gain.value;
        },
        set pan(pan) {
            panNode.pan.value = pan;
        },
        get pan() {
            return panNode.pan.value;
        },
        set loop(l) {
            srcNode.loop = l;
        },
        get loop() {
            return srcNode.loop;
        },
        duration: function () {
            var _a, _b;
            return (_b = (_a = srcNode.buffer) === null || _a === void 0 ? void 0 : _a.duration) !== null && _b !== void 0 ? _b : 0;
        },
        time: function () {
            return getTime() % this.duration();
        },
        onEnd: function (action) {
            return onEndEvents.add(action);
        },
        then: function (action) {
            return this.onEnd(action);
        },
        connect: function (node) {
            gainNode.disconnect();
            gainNode.connect(node !== null && node !== void 0 ? node : shared_1._k.audio.masterNode);
        },
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundData = void 0;
exports.resolveSound = resolveSound;
exports.getSound = getSound;
exports.loadSound = loadSound;
exports.loadMusic = loadMusic;
var shared_1 = require("../shared");
var dataURL_1 = require("../utils/dataURL");
var asset_1 = require("./asset");
var utils_1 = require("./utils");
var SoundData = /** @class */ function() {
    function SoundData(buf) {
        this.buf = buf;
    }
    SoundData.fromAudioBuffer = function(buf) {
        return new SoundData(buf);
    };
    SoundData.fromArrayBuffer = function(buf) {
        return new Promise(function(resolve, reject) {
            return shared_1._k.audio.ctx.decodeAudioData(buf, resolve, reject);
        }).then(function(buf) {
            return new SoundData(buf);
        });
    };
    SoundData.fromURL = function(url) {
        if ((0, dataURL_1.isDataURL)(url)) {
            return SoundData.fromArrayBuffer(
                (0, dataURL_1.dataURLToArrayBuffer)(url),
            );
        }
        else {
            return (0, asset_1.fetchArrayBuffer)(url).then(function(buf) {
                return SoundData.fromArrayBuffer(buf);
            });
        }
    };
    return SoundData;
}();
exports.SoundData = SoundData;
function resolveSound(src) {
    if (typeof src === "string") {
        var snd = getSound(src);
        if (snd) {
            return snd;
        }
        else if ((0, asset_1.loadProgress)() < 1) {
            return null;
        }
        else {
            throw new Error("Sound not found: ".concat(src));
        }
    }
    else if (src instanceof SoundData) {
        return asset_1.Asset.loaded(src);
    }
    else if (src instanceof asset_1.Asset) {
        return src;
    }
    else {
        throw new Error("Invalid sound: ".concat(src));
    }
}
function getSound(name) {
    var _a;
    return (_a = shared_1._k.assets.sounds.get(name)) !== null && _a !== void 0
        ? _a
        : null;
}
// load a sound to asset manager
function loadSound(name, src) {
    var fixedSrc = (0, utils_1.fixURL)(src);
    var sound;
    if (typeof fixedSrc === "string") {
        sound = SoundData.fromURL(fixedSrc);
    }
    else if (fixedSrc instanceof ArrayBuffer) {
        sound = SoundData.fromArrayBuffer(fixedSrc);
    }
    else {
        sound = Promise.resolve(SoundData.fromAudioBuffer(fixedSrc));
    }
    return shared_1._k.assets.sounds.add(name, sound);
}
function loadMusic(name, url) {
    var musicUrl = (0, utils_1.fixURL)(url);
    var a = new Audio(musicUrl);
    a.preload = "auto";
    return shared_1._k.assets.music[name] = musicUrl;
}

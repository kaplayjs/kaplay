"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpriteData = void 0;
exports.resolveSprite = resolveSprite;
exports.getSprite = getSprite;
exports.loadSprite = loadSprite;
exports.slice = slice;
exports.createSpriteSheet = createSpriteSheet;
exports.loadBean = loadBean;
var math_1 = require("../math/math");
var shared_1 = require("../shared");
var asset_1 = require("./asset");
var utils_1 = require("./utils");
var SpriteData = /** @class */ (function () {
    function SpriteData(tex, frames, anims, slice9, packerId) {
        if (anims === void 0) { anims = {}; }
        if (slice9 === void 0) { slice9 = null; }
        if (packerId === void 0) { packerId = null; }
        this.frames = [new math_1.Quad(0, 0, 1, 1)];
        this.anims = {};
        this.slice9 = null;
        this.tex = tex;
        if (frames)
            this.frames = frames;
        this.anims = anims;
        this.slice9 = slice9;
        this.packerId = packerId;
    }
    Object.defineProperty(SpriteData.prototype, "width", {
        /**
         * @since v3001.0
         */
        get: function () {
            return this.tex.width * this.frames[0].w;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SpriteData.prototype, "height", {
        get: function () {
            return this.tex.height * this.frames[0].h;
        },
        enumerable: false,
        configurable: true
    });
    SpriteData.from = function (src, opt) {
        if (opt === void 0) { opt = {}; }
        return typeof src === "string"
            ? SpriteData.fromURL(src, opt)
            : Promise.resolve(SpriteData.fromImage(src, opt));
    };
    SpriteData.fromImage = function (data, opt) {
        if (opt === void 0) { opt = {}; }
        var _a = opt.singular
            ? shared_1._k.assets.packer.addSingle(data)
            : shared_1._k.assets.packer.add(data), tex = _a[0], quad = _a[1], packerId = _a[2];
        var frames = opt.frames
            ? opt.frames.map(function (f) {
                return new math_1.Quad(quad.x + f.x * quad.w, quad.y + f.y * quad.h, f.w * quad.w, f.h * quad.h);
            })
            : slice(opt.sliceX || 1, opt.sliceY || 1, quad.x, quad.y, quad.w, quad.h);
        return new SpriteData(tex, frames, opt.anims, opt.slice9, packerId);
    };
    SpriteData.fromURL = function (url, opt) {
        if (opt === void 0) { opt = {}; }
        return (0, asset_1.loadImg)(url).then(function (img) { return SpriteData.fromImage(img, opt); });
    };
    return SpriteData;
}());
exports.SpriteData = SpriteData;
function resolveSprite(src) {
    if (typeof src === "string") {
        var spr = getSprite(src);
        if (spr) {
            // if it's already loaded or being loading, return it
            return spr;
        }
        else if ((0, asset_1.loadProgress)() < 1) {
            // if there's any other ongoing loading task we return empty and don't error yet
            return null;
        }
        else {
            // if all other assets are loaded and we still haven't found this sprite, throw
            throw new Error("Sprite not found: ".concat(src));
        }
    }
    // else if (src instanceof SpriteData) {
    //     return Asset.loaded(src);
    // }
    else if (src instanceof asset_1.Asset) {
        return src;
    }
    else {
        throw new Error("Invalid sprite: ".concat(src));
    }
}
function getSprite(name) {
    var _a;
    return (_a = shared_1._k.assets.sprites.get(name)) !== null && _a !== void 0 ? _a : null;
}
// load a sprite to asset manager
function loadSprite(name, src, opt) {
    if (opt === void 0) { opt = {
        sliceX: 1,
        sliceY: 1,
        anims: {},
    }; }
    src = (0, utils_1.fixURL)(src);
    if (Array.isArray(src)) {
        if (src.some(function (s) { return typeof s === "string"; })) {
            return shared_1._k.assets.sprites.add(name, Promise.all(src.map(function (s) {
                return typeof s === "string"
                    ? (0, asset_1.loadImg)(s)
                    : Promise.resolve(s);
            })).then(function (images) { return createSpriteSheet(images, opt); }));
        }
        else {
            return shared_1._k.assets.sprites.addLoaded(name, createSpriteSheet(src, opt));
        }
    }
    else {
        if (typeof src === "string") {
            return shared_1._k.assets.sprites.add(name, SpriteData.from(src, opt));
        }
        else {
            return shared_1._k.assets.sprites.addLoaded(name, SpriteData.fromImage(src, opt));
        }
    }
}
function slice(x, y, dx, dy, w, h) {
    if (x === void 0) { x = 1; }
    if (y === void 0) { y = 1; }
    if (dx === void 0) { dx = 0; }
    if (dy === void 0) { dy = 0; }
    if (w === void 0) { w = 1; }
    if (h === void 0) { h = 1; }
    var frames = [];
    var qw = w / x;
    var qh = h / y;
    for (var j = 0; j < y; j++) {
        for (var i = 0; i < x; i++) {
            frames.push(new math_1.Quad(dx + i * qw, dy + j * qh, qw, qh));
        }
    }
    return frames;
}
// TODO: load synchronously if passed ImageSource
function createSpriteSheet(images, opt) {
    if (opt === void 0) { opt = {}; }
    var canvas = document.createElement("canvas");
    var width = images[0].width;
    var height = images[0].height;
    canvas.width = width * images.length;
    canvas.height = height;
    var c2d = canvas.getContext("2d");
    if (!c2d)
        throw new Error("Failed to create canvas context");
    images.forEach(function (img, i) {
        if (img instanceof ImageData) {
            c2d.putImageData(img, i * width, 0);
        }
        else {
            c2d.drawImage(img, i * width, 0);
        }
    });
    var merged = c2d.getImageData(0, 0, images.length * width, height);
    return SpriteData.fromImage(merged, __assign(__assign({}, opt), { sliceX: images.length, sliceY: 1 }));
}
function loadBean(name) {
    if (name === void 0) { name = "bean"; }
    if (!shared_1._k.game.defaultAssets.bean) {
        throw new Error("You can't use bean in kaplay/mini");
    }
    return loadSprite(name, shared_1._k.game.defaultAssets.bean);
}

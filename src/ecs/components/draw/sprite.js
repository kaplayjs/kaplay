"use strict";
// TODO: accept canvas
Object.defineProperty(exports, "__esModule", { value: true });
exports.sprite = sprite;
var sprite_1 = require("../../../assets/sprite");
var general_1 = require("../../../constants/general");
var events_1 = require("../../../events/events");
var globalEvents_1 = require("../../../events/globalEvents");
var utils_1 = require("../../../game/utils");
var anchor_1 = require("../../../gfx/anchor");
var drawTexture_1 = require("../../../gfx/draw/drawTexture");
var math_1 = require("../../../math/math");
var shared_1 = require("../../../shared");
// TODO: clean
function sprite(src, opt) {
    var _a, _b, _c;
    if (opt === void 0) opt = {};
    var spriteData = null;
    var curAnim = null;
    // 1  - from small index to large index
    // -1 - reverse
    var curAnimDir = null;
    var spriteLoadedEvent = new events_1.KEvent();
    if (!src) {
        throw new Error("Please pass the resource name or data to sprite()");
    }
    var calcTexScale = function(tex, q, w, h) {
        var scale = (0, math_1.vec2)(1, 1);
        if (w && h) {
            scale.x = w / (tex.width * q.w);
            scale.y = h / (tex.height * q.h);
        }
        else if (w) {
            scale.x = w / (tex.width * q.w);
            scale.y = scale.x;
        }
        else if (h) {
            scale.y = h / (tex.height * q.h);
            scale.x = scale.y;
        }
        return scale;
    };
    var setSpriteData = function(obj, spr) {
        if (!spr) {
            return;
        }
        var q = spr.frames[0].clone();
        if (opt.quad) {
            q = q.scale(opt.quad);
        }
        var scale = calcTexScale(spr.tex, q, opt.width, opt.height);
        obj.width = spr.tex.width * q.w * scale.x;
        obj.height = spr.tex.height * q.h * scale.y;
        if (spr.anims) {
            for (var animName in spr.anims) {
                var anim = spr.anims[animName];
                if (typeof anim !== "number") {
                    anim.frames = createAnimFrames(anim);
                }
            }
        }
        spriteData = spr;
        spriteLoadedEvent.trigger(spriteData);
        if (opt.anim) {
            obj.play(opt.anim);
        }
    };
    var createAnimFrames = function(anim) {
        if (anim.frames) {
            return anim.frames;
        }
        var frames = [];
        if (anim.from === undefined || anim.to === undefined) {
            throw new Error(
                "Sprite anim 'from' and 'to' must be defined if 'frames' is not defined",
            );
        }
        var frameSeqLength = Math.abs(anim.to - anim.from) + 1;
        for (var i = 0; i < frameSeqLength; i++) {
            frames.push(anim.from + i * Math.sign(anim.to - anim.from));
        }
        if (anim.pingpong) {
            for (var i = frameSeqLength - 2; i > 0; i--) {
                frames.push(frames[i]);
            }
        }
        return frames;
    };
    var _shape;
    var _width = 0;
    var _height = 0;
    return {
        id: "sprite",
        // TODO: allow update
        get width() {
            return _width;
        },
        set width(value) {
            _width = value;
            if (_shape) {
                _shape.width = value;
            }
        },
        get height() {
            return _height;
        },
        set height(value) {
            _height = value;
            if (_shape) {
                _shape.height = value;
            }
        },
        frame: opt.frame || 0,
        quad: opt.quad || new math_1.Quad(0, 0, 1, 1),
        animSpeed: (_a = opt.animSpeed) !== null && _a !== void 0 ? _a : 1,
        flipX: (_b = opt.flipX) !== null && _b !== void 0 ? _b : false,
        flipY: (_c = opt.flipY) !== null && _c !== void 0 ? _c : false,
        get sprite() {
            return src.toString();
        },
        set sprite(src) {
            var _this = this;
            var spr = (0, sprite_1.resolveSprite)(src);
            if (spr) {
                spr.onLoad(function(spr) {
                    return setSpriteData(_this, spr);
                });
            }
        },
        get animFrame() {
            if (!spriteData || !curAnim || curAnimDir === null) {
                return this.frame;
            }
            var anim = spriteData.anims[curAnim.name];
            if (typeof anim === "number") {
                return anim;
            }
            if (anim.from === undefined || anim.to === undefined) {
                return curAnim.frameIndex;
            }
            return this.frame - Math.min(anim.from, anim.to);
        },
        draw: function() {
            var _a, _b, _c;
            if (!spriteData) {
                return;
            }
            var q = spriteData
                .frames[
                    (_a = this.frame) !== null && _a !== void 0
                        ? _a
                        : 0
                ];
            if (!q) {
                throw new Error(
                    "Frame not found: ".concat(
                        (_b = this.frame) !== null && _b !== void 0 ? _b : 0,
                    ),
                );
            }
            if (spriteData.slice9) {
                // TODO: tile
                // TODO: use scale or width / height, or both?
                var _d = spriteData.slice9,
                    left = _d.left,
                    right = _d.right,
                    top_1 = _d.top,
                    bottom = _d.bottom;
                var tw = spriteData.tex.width * q.w;
                var th = spriteData.tex.height * q.h;
                var iw = this.width - left - right;
                var ih = this.height - top_1 - bottom;
                var w1 = left / tw;
                var w3 = right / tw;
                var w2 = 1 - w1 - w3;
                var h1 = top_1 / th;
                var h3 = bottom / th;
                var h2 = 1 - h1 - h3;
                var quads = [
                    // uv
                    (0, math_1.quad)(0, 0, w1, h1),
                    (0, math_1.quad)(w1, 0, w2, h1),
                    (0, math_1.quad)(w1 + w2, 0, w3, h1),
                    (0, math_1.quad)(0, h1, w1, h2),
                    (0, math_1.quad)(w1, h1, w2, h2),
                    (0, math_1.quad)(w1 + w2, h1, w3, h2),
                    (0, math_1.quad)(0, h1 + h2, w1, h3),
                    (0, math_1.quad)(w1, h1 + h2, w2, h3),
                    (0, math_1.quad)(w1 + w2, h1 + h2, w3, h3),
                    // transform
                    (0, math_1.quad)(0, 0, left, top_1),
                    (0, math_1.quad)(left, 0, iw, top_1),
                    (0, math_1.quad)(left + iw, 0, right, top_1),
                    (0, math_1.quad)(0, top_1, left, ih),
                    (0, math_1.quad)(left, top_1, iw, ih),
                    (0, math_1.quad)(left + iw, top_1, right, ih),
                    (0, math_1.quad)(0, top_1 + ih, left, bottom),
                    (0, math_1.quad)(left, top_1 + ih, iw, bottom),
                    (0, math_1.quad)(left + iw, top_1 + ih, right, bottom),
                ];
                var props = (0, utils_1.getRenderProps)(this);
                var offset = (0, anchor_1.anchorPt)(
                    props.anchor || general_1.DEF_ANCHOR,
                );
                var offsetX = -(offset.x + 1) * 0.5 * this.width;
                var offsetY = -(offset.y + 1) * 0.5 * this.height;
                for (var i = 0; i < 9; i++) {
                    var uv = quads[i];
                    var transform = quads[i + 9];
                    if (transform.w == 0 || transform.h == 0) {
                        return;
                    }
                    (0, drawTexture_1.drawTexture)(Object.assign(props, {
                        pos: transform.pos().add(offsetX, offsetY),
                        anchor: "topleft",
                        tex: spriteData.tex,
                        quad: q.scale(uv),
                        flipX: this.flipX,
                        flipY: this.flipY,
                        tiled: opt.tiled,
                        width: transform.w,
                        height: transform.h,
                    }));
                }
            }
            else {
                (0, drawTexture_1.drawTexture)(
                    Object.assign((0, utils_1.getRenderProps)(this), {
                        tex: spriteData.tex,
                        quad: q.scale(
                            (_c = this.quad) !== null && _c !== void 0
                                ? _c
                                : new math_1.Quad(0, 0, 1, 1),
                        ),
                        flipX: this.flipX,
                        flipY: this.flipY,
                        tiled: opt.tiled,
                        width: this.width,
                        height: this.height,
                    }),
                );
            }
        },
        add: function() {
            var _this = this;
            var spr = (0, sprite_1.resolveSprite)(src);
            if (spr) {
                // The sprite exists
                spr.onLoad(function(spr) {
                    return setSpriteData(_this, spr);
                });
            }
            else {
                // The sprite may be loaded later in the script, check again when all resources have been loaded
                (0, globalEvents_1.onLoad)(function() {
                    return setSpriteData(
                        _this,
                        (0, sprite_1.resolveSprite)(src).data,
                    );
                });
            }
        },
        update: function() {
            if (!spriteData || !curAnim || curAnimDir === null) {
                return;
            }
            var anim = spriteData.anims[curAnim.name];
            if (typeof anim === "number") {
                this.frame = anim;
                return;
            }
            if (anim.speed === 0) {
                throw new Error("Sprite anim speed cannot be 0");
            }
            curAnim.timer += shared_1._k.app.dt() * this.animSpeed;
            if (curAnim.timer >= (1 / curAnim.speed)) {
                curAnim.timer = 0;
                curAnim.frameIndex += curAnimDir;
                var frames_1 = anim.frames;
                if (curAnim.frameIndex >= frames_1.length) {
                    if (curAnim.pingpong && !anim.pingpong) {
                        curAnimDir = -1;
                        curAnim.frameIndex = frames_1.length - 2;
                    }
                    else if (curAnim.loop) {
                        curAnim.frameIndex = 0;
                    }
                    else {
                        this.frame = frames_1.at(-1);
                        curAnim.onEnd();
                        this.stop();
                        return;
                    }
                }
                else if (curAnim.frameIndex < 0) {
                    if (curAnim.pingpong && curAnim.loop) {
                        curAnimDir = 1;
                        curAnim.frameIndex = 1;
                    }
                    else if (curAnim.loop) {
                        curAnim.frameIndex = frames_1.length - 1;
                    }
                    else {
                        this.frame = frames_1[0];
                        curAnim.onEnd();
                        this.stop();
                        return;
                    }
                }
                this.frame = frames_1[curAnim.frameIndex];
            }
        },
        play: function(name, opt) {
            var _this = this;
            var _a, _b, _c, _d, _e, _f, _g;
            if (opt === void 0) opt = {};
            if (!spriteData) {
                spriteLoadedEvent.add(function() {
                    return _this.play(name, opt);
                });
                return;
            }
            var anim = spriteData.anims[name];
            if (anim === undefined) {
                throw new Error("Anim not found: ".concat(name));
            }
            if (curAnim) {
                if (opt.preventRestart && curAnim.name === name) {
                    return;
                }
                this.stop();
            }
            curAnim = typeof anim === "number"
                ? {
                    name: name,
                    timer: 0,
                    loop: false,
                    pingpong: false,
                    speed: 0,
                    frameIndex: 0,
                    onEnd: function() {},
                }
                : {
                    name: name,
                    timer: 0,
                    loop: (_b = (_a = opt.loop) !== null && _a !== void 0
                                    ? _a
                                    : anim.loop) !== null && _b !== void 0
                        ? _b
                        : false,
                    pingpong:
                        (_d = (_c = opt.pingpong) !== null && _c !== void 0
                                    ? _c
                                    : anim.pingpong) !== null && _d !== void 0
                            ? _d
                            : false,
                    speed: (_f = (_e = opt.speed) !== null && _e !== void 0
                                    ? _e
                                    : anim.speed) !== null && _f !== void 0
                        ? _f
                        : 10,
                    frameIndex: 0,
                    onEnd: (_g = opt.onEnd) !== null && _g !== void 0
                        ? _g
                        : (function() {}),
                };
            curAnimDir = typeof anim === "number" ? null : 1;
            this.frame = typeof anim === "number" ? anim : anim.frames[0];
            this.trigger("animStart", name);
        },
        stop: function() {
            if (!curAnim) {
                return;
            }
            var prevAnim = curAnim.name;
            curAnim = null;
            this.trigger("animEnd", prevAnim);
        },
        numFrames: function() {
            var _a;
            return (_a = spriteData === null || spriteData === void 0
                            ? void 0
                            : spriteData.frames.length) !== null
                    && _a !== void 0
                ? _a
                : 0;
        },
        getCurAnim: function() {
            return curAnim;
        },
        curAnim: function() {
            return curAnim === null || curAnim === void 0
                ? void 0
                : curAnim.name;
        },
        getAnim: function(name) {
            var _a;
            return (_a = spriteData === null || spriteData === void 0
                            ? void 0
                            : spriteData.anims[name]) !== null && _a !== void 0
                ? _a
                : null;
        },
        hasAnim: function(name) {
            return Boolean(this.getAnim(name));
        },
        onAnimEnd: function(action) {
            return this.on("animEnd", action);
        },
        onAnimStart: function(action) {
            return this.on("animStart", action);
        },
        renderArea: function() {
            if (!_shape) {
                _shape = new math_1.Rect((0, math_1.vec2)(0), _width, _height);
            }
            return _shape;
        },
        inspect: function() {
            if (typeof src === "string") {
                return "sprite: \"".concat(src, "\"");
            }
            return null;
        },
    };
}

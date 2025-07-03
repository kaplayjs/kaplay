"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.animate = animate;
exports.serializeAnimation = serializeAnimation;
exports.applyAnimation = applyAnimation;
var clamp_1 = require("../../../math/clamp");
var color_1 = require("../../../math/color");
var easings_1 = require("../../../math/easings");
var lerp_1 = require("../../../math/lerp");
var math_1 = require("../../../math/math");
var Vec2_1 = require("../../../math/Vec2");
var shared_1 = require("../../../shared");
/**
 * Baseclass for animation channels, only handles parameter normalization and keyframe searches
 */
var AnimateChannel = /** @class */ (function () {
    function AnimateChannel(name, opts, relative) {
        this.name = name;
        this.duration = opts.duration;
        this.loops = opts.loops || 0;
        this.direction = opts.direction || "forward";
        this.easing = opts.easing || easings_1.easings.linear;
        this.interpolation = opts.interpolation || "linear";
        this.isFinished = false;
        this.timing = opts.timing;
        this.easings = opts.easings;
        this.relative = relative;
    }
    AnimateChannel.prototype.update = function (obj, t) {
        return true;
    };
    /**
     * Returns the first key index for the given time, as well as the relative time towards the second key.
     * @param t - The time in seconds.
     * @param timing - The optional timestamps in percent.
     *
     * @returns The first key index for the given time, as well as the relative time towards the second key.
     */
    AnimateChannel.prototype.getLowerKeyIndexAndRelativeTime = function (t, count, timing) {
        var maxIndex = count - 1;
        // Check how many loops we've made
        var p = t / this.duration;
        if (this.loops !== 0 && p >= this.loops) {
            return [maxIndex, 0, true];
        }
        // Split looped and actual time
        var m = Math.trunc(p);
        p -= m;
        // Reverse if needed
        if (this.direction == "reverse"
            || (this.direction == "ping-pong" && (m & 1))) {
            p = 1 - p;
        }
        // If we have individual keyframe positions, use them, otherwise use uniform spread
        if (timing) {
            var index = 0;
            while (timing[index + 1] !== undefined && timing[index + 1] < p) {
                index++;
            }
            if (index >= maxIndex) {
                return [maxIndex, 0, true];
            }
            return [
                index,
                (p - timing[index]) / (timing[index + 1] - timing[index]),
                false,
            ];
        }
        else {
            var index = Math.floor((count - 1) * p);
            return [index, (p - index / maxIndex) * maxIndex, false];
        }
    };
    AnimateChannel.prototype.setValue = function (obj, name, value) {
        if (this.relative) {
            switch (name) {
                case "pos":
                    obj["pos"] = obj.base.pos.add(value);
                    break;
                case "angle":
                    obj["angle"] = obj.base.angle + value;
                    break;
                case "scale":
                    obj["scale"] = obj.base.scale.scale(value);
                    break;
                case "opacity":
                    obj["opacity"] = obj.base.opacity * value;
                    break;
                default:
                    obj[name] = value;
            }
        }
        else {
            obj[name] = value;
        }
    };
    AnimateChannel.prototype.serialize = function () {
        var _this = this;
        var serialization = {
            duration: this.duration,
            keys: [],
        };
        if (this.loops) {
            serialization.loops = this.loops;
        }
        if (this.direction !== "forward") {
            serialization.direction = this.direction;
        }
        if (this.easing != easings_1.easings.linear) {
            serialization.easing = this.easing.name;
        }
        if (this.interpolation !== "linear") {
            serialization.interpolation = this.interpolation;
        }
        if (this.timing) {
            serialization.timing = this.timing;
        }
        if (this.easings) {
            serialization.easings = this.easings.map(function (e) { return _this.easing.name; });
        }
        return serialization;
    };
    return AnimateChannel;
}());
/**
 * Reflects a point around another point
 * @param a - Point to reflect
 * @param b - Point to reflect around
 *
 * @returns Reflected point
 */
function reflect(a, b) {
    return b.add(b.sub(a));
}
/**
 * Subclass handling number keys
 */
var AnimateChannelNumber = /** @class */ (function (_super) {
    __extends(AnimateChannelNumber, _super);
    function AnimateChannelNumber(name, keys, opts, relative) {
        var _this = _super.call(this, name, opts, relative) || this;
        _this.keys = keys;
        return _this;
    }
    AnimateChannelNumber.prototype.update = function (obj, t) {
        var _a = this.getLowerKeyIndexAndRelativeTime(t, this.keys.length, this.timing), index = _a[0], alpha = _a[1], isFinished = _a[2];
        // Return exact value in case of exact hit or no interpolation, otherwise interpolate
        if (alpha == 0 || this.interpolation === "none") {
            this.setValue(obj, this.name, this.keys[index]);
        }
        else {
            var easing = this.easings ? this.easings[index] : this.easing;
            this.setValue(obj, this.name, (0, lerp_1.lerp)(this.keys[index], this.keys[index + 1], easing(alpha)));
        }
        return isFinished;
    };
    AnimateChannelNumber.prototype.serialize = function () {
        return Object.assign(_super.prototype.serialize.call(this), { keys: this.keys });
    };
    return AnimateChannelNumber;
}(AnimateChannel));
/**
 * Subclass handling vector keys
 */
var AnimateChannelVec2 = /** @class */ (function (_super) {
    __extends(AnimateChannelVec2, _super);
    function AnimateChannelVec2(name, keys, opts, relative, followMotion) {
        var _a;
        var _this = _super.call(this, name, opts, relative) || this;
        _this.keys = keys;
        // If spline interpolation is used, bake splines
        if (_this.interpolation === "spline") {
            _this.curves = [];
            // If following motion, bake derivatives as well
            if (followMotion) {
                _this.dcurves = [];
            }
            for (var i = 0; i < _this.keys.length - 1; i++) {
                var prevKey = _this.keys[i];
                var nextIndex = i + 1;
                var nextKey = _this.keys[nextIndex];
                var prevPrevKey = i > 0
                    ? _this.keys[i - 1]
                    : reflect(nextKey, prevKey);
                var nextNextKey = nextIndex < _this.keys.length - 1
                    ? _this.keys[nextIndex + 1]
                    : reflect(prevKey, nextKey);
                _this.curves.push((0, math_1.catmullRom)(prevPrevKey, prevKey, nextKey, nextNextKey));
                if (followMotion) {
                    (_a = _this.dcurves) === null || _a === void 0 ? void 0 : _a.push((0, math_1.catmullRom)(prevPrevKey, prevKey, nextKey, nextNextKey, math_1.hermiteFirstDerivative));
                }
            }
        }
        return _this;
    }
    AnimateChannelVec2.prototype.update = function (obj, t) {
        var _a = this.getLowerKeyIndexAndRelativeTime(t, this.keys.length, this.timing), index = _a[0], alpha = _a[1], isFinished = _a[2];
        // Return exact value in case of exact hit or no interpolation, otherwise interpolate
        if (alpha == 0 || this.interpolation === "none") {
            this.setValue(obj, this.name, this.keys[index]);
        }
        else {
            var easing = this.easings ? this.easings[index] : this.easing;
            // Use linear or spline interpolation
            switch (this.interpolation) {
                case "linear":
                    this.setValue(obj, this.name, this.keys[index].lerp(this.keys[index + 1], easing(alpha)));
                    break;
                case "slerp":
                    this.setValue(obj, this.name, this.keys[index].slerp(this.keys[index + 1], easing(alpha)));
                    break;
                case "spline":
                    if (this.curves) {
                        this.setValue(obj, this.name, this.curves[index](easing(alpha)));
                        if (this.dcurves) {
                            this.setValue(obj, "angle", this.dcurves[index](easing(alpha)).angle());
                        }
                        break;
                    }
            }
        }
        return isFinished;
    };
    AnimateChannelVec2.prototype.serialize = function () {
        return Object.assign(_super.prototype.serialize.call(this), {
            keys: this.keys.map(function (v) { return [v.x, v.y]; }),
        });
    };
    return AnimateChannelVec2;
}(AnimateChannel));
/**
 * Subclass handling color keys
 */
var AnimateChannelColor = /** @class */ (function (_super) {
    __extends(AnimateChannelColor, _super);
    function AnimateChannelColor(name, keys, opts, relative) {
        var _this = _super.call(this, name, opts, relative) || this;
        _this.keys = keys;
        return _this;
    }
    AnimateChannelColor.prototype.update = function (obj, t) {
        var _a = this.getLowerKeyIndexAndRelativeTime(t, this.keys.length, this.timing), index = _a[0], alpha = _a[1], isFinished = _a[2];
        // Return exact value in case of exact hit or no interpolation, otherwise interpolate
        if (alpha == 0 || this.interpolation == "none") {
            this.setValue(obj, this.name, this.keys[index]);
        }
        else {
            var easing = this.easings ? this.easings[index] : this.easing;
            this.setValue(obj, this.name, this.keys[index].lerp(this.keys[index + 1], easing(alpha)));
        }
        return isFinished;
    };
    AnimateChannelColor.prototype.serialize = function () {
        return Object.assign(_super.prototype.serialize.call(this), { keys: this.keys });
    };
    return AnimateChannelColor;
}(AnimateChannel));
function animate(gopts) {
    if (gopts === void 0) { gopts = {}; }
    var channels = [];
    var t = 0;
    var isFinished = false;
    return {
        id: "animate",
        require: gopts.followMotion ? ["rotate"] : undefined,
        base: {
            pos: (0, math_1.vec2)(0, 0),
            angle: 0,
            scale: (0, math_1.vec2)(1, 1),
            opacity: 1,
        },
        animation: {
            paused: false,
            seek: function (time) {
                t = (0, clamp_1.clamp)(time, 0, this.duration);
                channels.forEach(function (channel) {
                    channel.isFinished = false;
                });
                isFinished = false;
            },
            get duration() {
                return channels.reduce(function (acc, channel) { return Math.max(channel.duration, acc); }, 0);
            },
        },
        add: function () {
            if (gopts.relative) {
                if (this.has("pos")) {
                    this.base.pos = this.pos.clone();
                }
                if (this.has("rotate")) {
                    this.base.angle = this.angle;
                }
                if (this.has("scale")) {
                    this.base.scale = this.scale;
                }
                if (this.has("opacity")) {
                    this.base.opacity = this.opacity;
                }
            }
        },
        update: function () {
            if (this.animation.paused)
                return;
            var allFinished = true;
            var localFinished;
            t += shared_1._k.app.dt();
            for (var _i = 0, channels_1 = channels; _i < channels_1.length; _i++) {
                var c = channels_1[_i];
                localFinished = c.update(this, t);
                if (localFinished && !c.isFinished) {
                    c.isFinished = true;
                    this.trigger("animateChannelFinished", c.name);
                }
                allFinished && (allFinished = localFinished);
            }
            if (allFinished && !isFinished) {
                isFinished = true;
                this.trigger("animateFinished");
            }
        },
        animate: function (name, keys, opts) {
            isFinished = false;
            this.unanimate(name);
            if (typeof keys[0] === "number") {
                channels.push(new AnimateChannelNumber(name, keys, opts, gopts.relative || false));
            }
            else if (keys[0] instanceof Vec2_1.Vec2) {
                channels.push(new AnimateChannelVec2(name, keys, opts, gopts.relative || false, name === "pos" && (gopts.followMotion || false)));
            }
            else if (keys[0] instanceof color_1.Color) {
                channels.push(new AnimateChannelColor(name, keys, opts, gopts.relative || false));
            }
        },
        unanimate: function (name) {
            var index = channels.findIndex(function (c) { return c.name === name; });
            if (index >= 0) {
                channels.splice(index, 1);
            }
        },
        unanimateAll: function () {
            channels.splice(0, channels.length);
        },
        onAnimateFinished: function (cb) {
            return this.on("animateFinished", cb);
        },
        onAnimateChannelFinished: function (cb) {
            return this.on("animateChannelFinished", cb);
        },
        serializeAnimationChannels: function () {
            return channels.reduce(function (o, c) {
                o[c.name] = c.serialize();
                return o;
            }, {});
        },
        serializeAnimationOptions: function () {
            var options = {};
            if (gopts.followMotion) {
                options.followMotion = true;
            }
            if (gopts.relative) {
                options.relative = true;
            }
            return options;
        },
    };
}
/**
 * Serializes an animation to javascript objects for serialization to JSON.
 * @param obj - The root object to serialize from.
 * @param name - Optional name of the root object.
 *
 * @returns A javascript object serialization of the animation.
 */
function serializeAnimation(obj, name) {
    var serialization = { name: obj.name };
    if (obj.has("animate")) {
        serialization.channels = obj
            .serializeAnimationChannels();
        Object.assign(serialization, obj
            .serializeAnimationOptions());
    }
    if (obj.children.length > 0) {
        serialization.children = obj.children.filter(function (o) { return o.has("named"); }).map(function (o) { return serializeAnimation(o, o.name); });
    }
    return serialization;
}
function deserializeKeys(keys) {
    if (typeof keys[0] == "number") {
        return keys;
    }
    else if (Array.isArray(keys[0])) {
        if (keys[0].length == 2) {
            return keys.map(function (k) { return new Vec2_1.Vec2(k[0], k[1]); });
        }
        else if (keys[0].length == 3) {
            return keys.map(function (k) { return new color_1.Color(k[0], k[1], k[2]); });
        }
    }
}
function deserializeOptions(options) {
    if (options.easing) {
        options.easing = easings_1.easings[options.easing];
    }
    if (options.easings) {
        options.easings = options.easings.map(function (e) { return easings_1.easings[e]; });
    }
    return options;
}
/**
 * Applies the animation to this object and its named children
 * @param obj - The root object to deserialize to.
 * @param animation - A javascript object serialization of the animation.
 */
function applyAnimation(obj, animation) {
    // TODO: test this
    obj.use(animate({
        followMotion: animation.followMotion,
        relative: animation.relative,
    }));
    if (animation.channels) {
        for (var name_1 in animation.channels) {
            var channel = animation.channels[name_1];
            obj.animate(name_1, deserializeKeys(channel.keys), deserializeOptions(channel));
        }
    }
    if (animation.children) {
        for (var _i = 0, _a = animation.children; _i < _a.length; _i++) {
            var childAnimation = _a[_i];
            var q = obj.query({ name: childAnimation.name });
            if (q.length != 0) {
                applyAnimation(q[0], childAnimation);
            }
        }
    }
}

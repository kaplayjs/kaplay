"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pos = pos;
var camera_1 = require("../../../game/camera");
var drawCircle_1 = require("../../../gfx/draw/drawCircle");
var color_1 = require("../../../math/color");
var math_1 = require("../../../math/math");
var shared_1 = require("../../../shared");
var utils_1 = require("../../entity/utils");
function pos() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return {
        id: "pos",
        pos: math_1.vec2.apply(void 0, args),
        moveBy: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this.pos = this.pos.add(math_1.vec2.apply(void 0, args));
        },
        // move with velocity (pixels per second)
        move: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this.moveBy(math_1.vec2.apply(void 0, args).scale(shared_1._k.app.dt()));
        },
        // move to a destination, with optional speed
        // Adress all ts ignores
        moveTo: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (typeof args[0] === "number" && typeof args[1] === "number") {
                // @ts-ignore Use overload functions here?
                return this.moveTo((0, math_1.vec2)(args[0], args[1]), args[2]);
            }
            var dest = args[0];
            var speed = args[1];
            if (speed === undefined) {
                this.pos = (0, math_1.vec2)(dest);
                return;
            }
            // @ts-ignore
            var diff = dest.sub(this.pos);
            if (diff.len() <= speed * shared_1._k.app.dt()) {
                this.pos = (0, math_1.vec2)(dest);
                return;
            }
            this.move(diff.unit().scale(speed));
        },
        // Get the position of the object relative to the root
        worldPos: function (pos) {
            if (pos === void 0) { pos = null; }
            if (pos) {
                this.pos = this.pos.add(this.fromWorld(pos));
                return null;
            }
            else {
                return this.parent
                    ? this.parent.transform.transformPointV(this.pos, (0, math_1.vec2)())
                    : this.pos;
            }
        },
        // Transform a local point to a world point
        toWorld: function (p) {
            return this.parent
                ? this.parent.transform.transformPointV(this.pos.add(p), (0, math_1.vec2)())
                : this.pos.add(p);
        },
        // Transform a world point (relative to the root) to a local point (relative to this)
        fromWorld: function (p) {
            return this.parent
                ? this.parent.transform.inverse.transformPointV(p, (0, math_1.vec2)()).sub(this.pos)
                : p.sub(this.pos);
        },
        // Transform a screen point (relative to the camera) to a local point (relative to this)
        screenPos: function (pos) {
            if (pos === void 0) { pos = null; }
            if (pos) {
                this.pos = this.pos.add(this.fromScreen(pos));
                return null;
            }
            else {
                var pos_1 = this.worldPos();
                // This is not really possible, because worldPos() will always return a value
                // if it doesn't have arguments
                // I left this like that for compatibility, maybe if it returns a value
                // will break something?
                if (!pos_1) {
                    return null;
                }
                return (0, utils_1.isFixed)(this)
                    ? pos_1
                    : (0, camera_1.toScreen)(pos_1);
            }
        },
        // Transform a local point (relative to this) to a screen point (relative to the camera)
        toScreen: function (p) {
            var pos = this.toWorld(p);
            return (0, utils_1.isFixed)(this)
                ? pos
                : (0, camera_1.toScreen)(pos);
        },
        // Transform a screen point (relative to the camera) to a local point (relative to this)
        fromScreen: function (p) {
            return (0, utils_1.isFixed)(this)
                ? this.fromWorld(p)
                : this.fromWorld((0, camera_1.toWorld)(p));
        },
        // Transform a point relative to this to a point relative to other
        toOther: function (other, p) {
            return other.fromWorld(this.toWorld(p));
        },
        // Transform a point relative to other to a point relative to this
        fromOther: function (other, p) {
            return other.toOther(this, p);
        },
        inspect: function () {
            return "pos: (".concat(Math.round(this.pos.x), "x, ").concat(Math.round(this.pos.y), "y)");
        },
        drawInspect: function () {
            (0, drawCircle_1.drawCircle)({
                color: (0, color_1.rgb)(255, 0, 0),
                radius: 4 / shared_1._k.gfx.viewport.scale,
            });
        },
    };
}

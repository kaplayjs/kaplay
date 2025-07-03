"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sentry = sentry;
var Vec2_1 = require("../../../math/Vec2");
var shared_1 = require("../../../shared");
var raycast_1 = require("../draw/raycast");
function sentry(candidates, opts) {
    if (opts === void 0) opts = {};
    var get = typeof candidates === "function"
        ? candidates
        : function() {
            return shared_1._k.game.root.query(candidates);
        };
    var checkFrequency = opts.checkFrequency || 1;
    var directionVector = typeof opts.direction === "number"
        ? Vec2_1.Vec2.fromAngle(opts.direction)
        : opts.direction;
    var t = 0;
    return {
        id: "sentry",
        require: ["pos"],
        direction: typeof opts.direction == "number"
            ? Vec2_1.Vec2.fromAngle(opts.direction)
            : opts.direction,
        spotted: [],
        set directionAngle(value) {
            this.direction = value !== undefined
                ? Vec2_1.Vec2.fromAngle(value)
                : undefined;
        },
        get directionAngle() {
            return this.direction ? this.direction.angle() : undefined;
        },
        fieldOfView: opts.fieldOfView || 200, // 200 degrees = Human field of view
        isWithinFieldOfView: function(obj, direction, fieldOfView) {
            var dir = (typeof direction === "number"
                ? Vec2_1.Vec2.fromAngle(direction)
                : direction) || directionVector;
            var fov = fieldOfView || opts.fieldOfView;
            if (!dir || !fov || fov >= 360) {
                return true;
            }
            var halfAngle = fov / 2;
            return obj.pos
                && dir.angleBetween(obj.pos.sub(this.pos)) <= halfAngle;
        },
        hasLineOfSight: function(obj) {
            var hit = (0, raycast_1.raycast)(
                this.pos,
                obj.pos.sub(this.pos),
                opts.raycastExclude,
            );
            return hit != null && hit.object === obj;
        },
        update: function() {
            var _this = this;
            t += shared_1._k.app.dt();
            if (t > checkFrequency) {
                t -= checkFrequency;
                var objects = get();
                // If fieldOfView is used, keep only object within view
                if (
                    objects.length && directionVector && this.fieldOfView
                    && this.fieldOfView < 360
                ) {
                    var halfAngle_1 = this.fieldOfView / 2;
                    objects = objects.filter(function(o) {
                        return o.pos
                            && directionVector.angleBetween(
                                    o.pos.sub(_this.pos),
                                )
                                <= halfAngle_1;
                    });
                }
                // If lineOfSight is used, raycast
                if (objects.length && opts.lineOfSight) {
                    objects = objects.filter(function(o) {
                        return o.pos
                            && _this.hasLineOfSight(o);
                    });
                }
                if (objects.length > 0) {
                    this.spotted = objects;
                    this.trigger("objectSpotted", objects);
                }
            }
        },
        onObjectsSpotted: function(cb) {
            return this.on("objectSpotted", cb);
        },
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vec2 = void 0;
var lerpNumber_1 = require("./lerpNumber");
var math_1 = require("./math");
/**
 * A 2D vector.
 *
 * @group Math
 */
var Vec2 = /** @class */ function() {
    function Vec2(x, y) {
        if (x === void 0) x = 0;
        if (y === void 0) y = x;
        /** The x coordinate */
        this.x = 0;
        /** The y coordinate */
        this.y = 0;
        this.x = x;
        this.y = y;
    }
    /** Set the X and Y of this vector */
    Vec2.prototype.set = function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    };
    /** Create a new Vec2 from an angle in degrees */
    Vec2.fromAngle = function(deg) {
        var angle = (0, math_1.deg2rad)(deg);
        return new Vec2(Math.cos(angle), Math.sin(angle));
    };
    /** Create a new Vec2 from an array */
    Vec2.fromArray = function(arr) {
        return new Vec2(arr[0], arr[1]);
    };
    /** Closest orthogonal direction: LEFT, RIGHT, UP, or DOWN */
    Vec2.prototype.toAxis = function() {
        return Math.abs(this.x) > Math.abs(this.y)
            ? this.x < 0 ? Vec2.LEFT : Vec2.RIGHT
            : this.y < 0
            ? Vec2.UP
            : Vec2.DOWN;
    };
    /** Clone the vector */
    Vec2.prototype.clone = function() {
        return new Vec2(this.x, this.y);
    };
    Vec2.copy = function(v, out) {
        out.x = v.x;
        out.y = v.y;
        return out;
    };
    /** Returns the sum with another vector. */
    Vec2.prototype.add = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var p2 = math_1.vec2.apply(void 0, args);
        return new Vec2(this.x + p2.x, this.y + p2.y);
    };
    Vec2.addScaled = function(v, other, s, out) {
        out.x = v.x + other.x * s;
        out.y = v.y + other.y * s;
        return out;
    };
    /**
     * Calculates the sum of the vectors
     * @param v - The first term
     * @param x - The x of the second term
     * @param y - The y of the second term
     * @param out - The vector sum
     *
     * @returns The sum of the vectors
     */
    Vec2.addc = function(v, x, y, out) {
        out.x = v.x + x;
        out.y = v.y + y;
        return out;
    };
    /**
     * Calculates the sum of the vectors
     * @param v - The first term
     * @param other - The second term
     * @param out - The vector sum
     *
     * @returns The sum of the vectors
     */
    Vec2.add = function(v, other, out) {
        out.x = v.x + other.x;
        out.y = v.y + other.y;
        return out;
    };
    /** Returns the difference with another vector. */
    Vec2.prototype.sub = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var p2 = math_1.vec2.apply(void 0, args);
        return new Vec2(this.x - p2.x, this.y - p2.y);
    };
    /**
     * Calculates the difference of the vectors
     * @param v - The first term
     * @param x - The x of the second term
     * @param y - The y of the second term
     * @param out - The vector difference
     *
     * @returns The difference of the vectors
     */
    Vec2.subc = function(v, x, y, out) {
        out.x = v.x - x;
        out.y = v.y - y;
        return out;
    };
    /**
     * Calculates the difference of the vectors
     * @param v - The first term
     * @param other - The second term
     * @param out - The vector difference
     *
     * @returns The difference of the vectors
     */
    Vec2.sub = function(v, other, out) {
        out.x = v.x - other.x;
        out.y = v.y - other.y;
        return out;
    };
    /** Scale by another vector. or a single number */
    Vec2.prototype.scale = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var s = math_1.vec2.apply(void 0, args);
        return new Vec2(this.x * s.x, this.y * s.y);
    };
    /**
     * Calculates the scale of the vector
     * @param v - The vector
     * @param x - The x scale
     * @param y - The y scale
     * @param out - The scaled vector
     *
     * @returns The scale of the vector
     */
    Vec2.scale = function(v, s, out) {
        out.x = v.x * s;
        out.y = v.y * s;
        return out;
    };
    /**
     * Calculates the scale of the vector
     * @param v - The vector
     * @param x - The x scale
     * @param y - The y scale
     * @param out - The scaled vector
     *
     * @returns The scale of the vector
     */
    Vec2.scalec = function(v, x, y, out) {
        out.x = v.x * x;
        out.y = v.y * y;
        return out;
    };
    /**
     * Calculates the scale of the vector
     * @param v - The vector
     * @param other - The scale
     * @param out - The scaled vector
     *
     * @returns The scale of the vector
     */
    Vec2.scalev = function(v, other, out) {
        out.x = v.x * other.x;
        out.y = v.y * other.y;
        return out;
    };
    /** Scale by the inverse of another vector. or a single number */
    Vec2.prototype.invScale = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var s = math_1.vec2.apply(void 0, args);
        return new Vec2(this.x / s.x, this.y / s.y);
    };
    /** Get distance between another vector */
    Vec2.prototype.dist = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var p2 = math_1.vec2.apply(void 0, args);
        return this.sub(p2).len();
    };
    /**
     * Calculates the distance between the vectors
     * @param v - The vector
     * @param other - The other vector
     *
     * @returns The between the vectors
     */
    Vec2.dist = function(v, other) {
        var x = v.x - other.x;
        var y = v.y - other.y;
        return Math.sqrt(x * x + y * y);
    };
    /** Get squared distance between another vector */
    Vec2.prototype.sdist = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var p2 = math_1.vec2.apply(void 0, args);
        return this.sub(p2).slen();
    };
    /**
     * Calculates the squared distance between the vectors
     * @param v - The vector
     * @param other - The other vector
     *
     * @returns The distance between the vectors
     */
    Vec2.sdist = function(v, other) {
        var x = v.x - other.x;
        var y = v.y - other.y;
        return x * x + y * y;
    };
    /**
     * Get length of the vector
     *
     * @since v3000.0
     */
    Vec2.prototype.len = function() {
        return Math.sqrt(this.dot(this));
    };
    /**
     * Calculates the length of the vector
     * @param v - The vector
     *
     * @returns The length of the vector
     */
    Vec2.len = function(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    };
    /**
     * Get squared length of the vector
     *
     * @since v3000.0
     */
    Vec2.prototype.slen = function() {
        return this.dot(this);
    };
    /**
     * Calculates the squared length of the vector
     * @param v - The vector
     *
     * @returns The squared length of the vector
     */
    Vec2.slen = function(v) {
        return v.x * v.x + v.y * v.y;
    };
    /**
     * Get the unit vector (length of 1).
     */
    Vec2.prototype.unit = function() {
        var len = this.len();
        return len === 0 ? new Vec2(0) : this.scale(1 / len);
    };
    Vec2.unit = function(v, out) {
        var len = Vec2.len(v);
        out.x = v.x / len;
        out.y = v.y / len;
        return out;
    };
    /**
     * Get the perpendicular vector.
     */
    Vec2.prototype.normal = function() {
        return new Vec2(this.y, -this.x);
    };
    Vec2.normal = function(v, out) {
        out.x = v.y;
        out.y = -v.x;
        return out;
    };
    /**
     * Get the reflection of a vector with a normal.
     *
     * @since v3000.0
     */
    Vec2.prototype.reflect = function(normal) {
        return this.sub(normal.scale(2 * this.dot(normal)));
    };
    /**
     * Get the projection of a vector onto another vector.
     *
     * @since v3000.0
     */
    Vec2.prototype.project = function(on) {
        return on.scale(on.dot(this) / on.len());
    };
    /**
     * Get the rejection of a vector onto another vector.
     *
     * @since v3000.0
     */
    Vec2.prototype.reject = function(on) {
        return this.sub(this.project(on));
    };
    Vec2.prototype.rotate = function(vecOrAngle) {
        if (vecOrAngle instanceof Vec2) {
            return new Vec2(
                this.x * vecOrAngle.x - this.y * vecOrAngle.y,
                this.x * vecOrAngle.y + this.y * vecOrAngle.x,
            );
        }
        else {
            var angle = (0, math_1.deg2rad)(vecOrAngle);
            var c = Math.cos(angle);
            var s = Math.sin(angle);
            return new Vec2(this.x * c - this.y * s, this.x * s + this.y * c);
        }
    };
    /**
     * Calculates the rotated vector
     * @param v - The vector
     * @param dir - The rotation vector
     * @param out - The rotated vector
     *
     * @returns The rotated vector
     */
    Vec2.rotate = function(v, dir, out) {
        var tmp = v.x;
        out.x = v.x * dir.x - v.y * dir.y;
        out.y = tmp * dir.y + v.y * dir.x;
        return out;
    };
    /**
     * Calculates the rotated vector
     * @param v - The vector
     * @param angle - The angle in radians
     * @param out - The rotated vector
     *
     * @returns The rotated vector
     */
    Vec2.rotateByAngle = function(v, angle, out) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var tmp = v.x;
        out.x = v.x * c - v.y * s;
        out.y = tmp * s + v.y * c;
        return out;
    };
    Vec2.prototype.invRotate = function(vecOrAngle) {
        if (vecOrAngle instanceof Vec2) {
            return this.rotate(new Vec2(vecOrAngle.x, -vecOrAngle.y));
        }
        else {
            return this.rotate(-vecOrAngle);
        }
    };
    /**
     * Calculates the inverse rotated vector
     * @param v - The vector
     * @param dir - The rotation vector
     * @param out - The rotated vector
     *
     * @returns The rotated vector
     */
    Vec2.inverseRotate = function(v, dir, out) {
        var tmp = v.x;
        out.x = v.x * dir.x + v.y * dir.y;
        out.y = -tmp * dir.y + v.y * dir.x;
        return out;
    };
    /**
     * Get the dot product with another vector.
     */
    Vec2.prototype.dot = function(p2) {
        return this.x * p2.x + this.y * p2.y;
    };
    /**
     * Get the dot product between 2 vectors.
     *
     * @since v3000.0
     */
    Vec2.dot = function(v, other) {
        return v.x * other.x + v.y * other.y;
    };
    /**
     * Get the cross product with another vector.
     *
     * @since v3000.0
     */
    Vec2.prototype.cross = function(p2) {
        return this.x * p2.y - this.y * p2.x;
    };
    /**
     * Get the cross product between 2 vectors.
     *
     * @since v3000.0
     */
    Vec2.cross = function(v, other) {
        return v.x * other.y - v.y * other.x;
    };
    /**
     * Get the angle of the vector in degrees.
     */
    Vec2.prototype.angle = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var p2 = math_1.vec2.apply(void 0, args);
        return (0, math_1.rad2deg)(Math.atan2(this.y - p2.y, this.x - p2.x));
    };
    /**
     * Calculates the angle represented by the vector in radians
     * @param v - The vector
     *
     * @returns Angle represented by the vector in radians
     */
    Vec2.toAngle = function(v) {
        return Math.atan2(v.y, v.x);
    };
    /**
     * Get the angle between this vector and another vector.
     *
     * @since v3000.0
     */
    Vec2.prototype.angleBetween = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var p2 = math_1.vec2.apply(void 0, args);
        return (0, math_1.rad2deg)(Math.atan2(this.cross(p2), this.dot(p2)));
    };
    /**
     * Calculates the angle between the vectors in radians
     * @param v - First vector
     * @param other - Second vector
     *
     * @returns Angle between the vectors in radians
     */
    Vec2.angleBetween = function(v, other) {
        return Math.atan2(Vec2.cross(v, other), Vec2.dot(v, other));
    };
    /**
     * Linear interpolate to a destination vector (for positions).
     */
    Vec2.prototype.lerp = function(dest, t) {
        return new Vec2(
            (0, lerpNumber_1.lerpNumber)(this.x, dest.x, t),
            (0, lerpNumber_1.lerpNumber)(this.y, dest.y, t),
        );
    };
    /**
     * Linear interpolate src and dst by t
     * @param src - First vector
     * @param dst - Second vector
     * @param t - Percentage
     * @param out - The linear interpolation between src and dst by t
     *
     * @returns The linear interpolation between src and dst by t
     */
    Vec2.lerp = function(src, dst, t, out) {
        out.x = src.x * (dst.x - src.x) * t;
        out.y = src.y * (dst.y - src.y) * t;
        return out;
    };
    /**
     * Spherical linear interpolate to a destination vector (for rotations).
     *
     * @since v3000.0
     */
    Vec2.prototype.slerp = function(dest, t) {
        var cos = this.dot(dest);
        var sin = this.cross(dest);
        var angle = Math.atan2(sin, cos);
        return this
            .scale(Math.sin((1 - t) * angle))
            .add(dest.scale(Math.sin(t * angle)))
            .scale(1 / sin);
    };
    /**
     * Spherical interpolate src and dst by t
     * @param src - First vector
     * @param dst - Second vector
     * @param t - Percentage
     * @param out - The spherical interpolation between src and dst by t
     *
     * @returns The spherical interpolation between src and dst by t
     */
    Vec2.slerp = function(src, dst, t, out) {
        var cos = Vec2.dot(src, dst);
        var sin = Vec2.cross(src, dst);
        var angle = Math.atan2(sin, cos);
        var t1 = Math.sin((1 - t) * angle);
        var t2 = Math.sin(t * angle);
        var invSin = 1 / sin;
        out.x = (src.x * t1 + dst.x * t2) * invSin;
        out.y = (src.y * t1 + dst.y * t2) * invSin;
        return out;
    };
    /**
     * If the vector (x, y) is zero.
     *
     * @since v3000.0
     */
    Vec2.prototype.isZero = function() {
        return this.x === 0 && this.y === 0;
    };
    /**
     * To n precision floating point.
     */
    Vec2.prototype.toFixed = function(n) {
        return new Vec2(Number(this.x.toFixed(n)), Number(this.y.toFixed(n)));
    };
    /**
     * Multiply by a Mat4.
     *
     * @since v3000.0
     */
    Vec2.prototype.transform = function(m) {
        return m.multVec2(this);
    };
    /**
     * See if one vector is equal to another.
     *
     * @since v3000.0
     */
    Vec2.prototype.eq = function(other) {
        return this.x === other.x && this.y === other.y;
    };
    /** Converts the vector to a {@link Rect `Rect()`} with the vector as the origin.
     * @since v3000.0.
     */
    Vec2.prototype.bbox = function() {
        return new math_1.Rect(this, 0, 0);
    };
    /** Converts the vector to a readable string. */
    Vec2.prototype.toString = function() {
        return "vec2(".concat(this.x.toFixed(2), ", ").concat(
            this.y.toFixed(2),
            ")",
        );
    };
    /** Converts the vector to an array.
     * @since v3001.0
     */
    Vec2.prototype.toArray = function() {
        return [this.x, this.y];
    };
    /** An empty vector. (0, 0) */
    Vec2.ZERO = new Vec2(0, 0);
    /** A vector with both components of 1. (1, 1) */
    Vec2.ONE = new Vec2(1, 1);
    /** A vector signaling to the left. (-1, 0) */
    Vec2.LEFT = new Vec2(-1, 0);
    /** A vector signaling to the right. (1, 0) */
    Vec2.RIGHT = new Vec2(1, 0);
    /** A vector signaling up. (0, -1) */
    Vec2.UP = new Vec2(0, -1);
    /** A vector signaling down. (0, 1) */
    Vec2.DOWN = new Vec2(0, 1);
    return Vec2;
}();
exports.Vec2 = Vec2;

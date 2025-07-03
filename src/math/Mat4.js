"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mat4 = void 0;
var math_1 = require("./math");
var Vec2_1 = require("./Vec2");
/**
 * @group Math
 */
var Mat4 = /** @class */ (function () {
    function Mat4(m) {
        this.m = [
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
        ];
        if (m) {
            this.m = m;
        }
    }
    Mat4.translate = function (p) {
        return new Mat4([
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            p.x,
            p.y,
            0,
            1,
        ]);
    };
    Mat4.scale = function (s) {
        return new Mat4([
            s.x,
            0,
            0,
            0,
            0,
            s.y,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
        ]);
    };
    Mat4.rotateX = function (a) {
        a = (0, math_1.deg2rad)(-a);
        var c = Math.cos(a);
        var s = Math.sin(a);
        return new Mat4([
            1,
            0,
            0,
            0,
            0,
            c,
            -s,
            0,
            0,
            s,
            c,
            0,
            0,
            0,
            0,
            1,
        ]);
    };
    Mat4.rotateY = function (a) {
        a = (0, math_1.deg2rad)(-a);
        var c = Math.cos(a);
        var s = Math.sin(a);
        return new Mat4([
            c,
            0,
            s,
            0,
            0,
            1,
            0,
            0,
            -s,
            0,
            c,
            0,
            0,
            0,
            0,
            1,
        ]);
    };
    Mat4.rotateZ = function (a) {
        a = (0, math_1.deg2rad)(-a);
        var c = Math.cos(a);
        var s = Math.sin(a);
        return new Mat4([
            c,
            -s,
            0,
            0,
            s,
            c,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
        ]);
    };
    Mat4.prototype.translate = function (p) {
        this.m[12] += this.m[0] * p.x + this.m[4] * p.y;
        this.m[13] += this.m[1] * p.x + this.m[5] * p.y;
        this.m[14] += this.m[2] * p.x + this.m[6] * p.y;
        this.m[15] += this.m[3] * p.x + this.m[7] * p.y;
        return this;
    };
    Mat4.prototype.scale = function (p) {
        this.m[0] *= p.x;
        this.m[4] *= p.y;
        this.m[1] *= p.x;
        this.m[5] *= p.y;
        this.m[2] *= p.x;
        this.m[6] *= p.y;
        this.m[3] *= p.x;
        this.m[7] *= p.y;
        return this;
    };
    Mat4.prototype.rotate = function (a) {
        a = (0, math_1.deg2rad)(-a);
        var c = Math.cos(a);
        var s = Math.sin(a);
        var m0 = this.m[0];
        var m1 = this.m[1];
        var m4 = this.m[4];
        var m5 = this.m[5];
        this.m[0] = m0 * c + m1 * s;
        this.m[1] = -m0 * s + m1 * c;
        this.m[4] = m4 * c + m5 * s;
        this.m[5] = -m4 * s + m5 * c;
        return this;
    };
    // TODO: in-place variant
    Mat4.prototype.mult = function (other) {
        var out = [];
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                out[i * 4 + j] = this.m[0 * 4 + j] * other.m[i * 4 + 0]
                    + this.m[1 * 4 + j] * other.m[i * 4 + 1]
                    + this.m[2 * 4 + j] * other.m[i * 4 + 2]
                    + this.m[3 * 4 + j] * other.m[i * 4 + 3];
            }
        }
        return new Mat4(out);
    };
    Mat4.prototype.multVec2 = function (p) {
        return new Vec2_1.Vec2(p.x * this.m[0] + p.y * this.m[4] + this.m[12], p.x * this.m[1] + p.y * this.m[5] + this.m[13]);
    };
    Mat4.prototype.getTranslation = function () {
        return new Vec2_1.Vec2(this.m[12], this.m[13]);
    };
    Mat4.prototype.getScale = function () {
        if (this.m[0] != 0 || this.m[1] != 0) {
            var det = this.m[0] * this.m[5] - this.m[1] * this.m[4];
            var r = Math.sqrt(this.m[0] * this.m[0] + this.m[1] * this.m[1]);
            return new Vec2_1.Vec2(r, det / r);
        }
        else if (this.m[4] != 0 || this.m[5] != 0) {
            var det = this.m[0] * this.m[5] - this.m[1] * this.m[4];
            var s = Math.sqrt(this.m[4] * this.m[4] + this.m[5] * this.m[5]);
            return new Vec2_1.Vec2(det / s, s);
        }
        else {
            return new Vec2_1.Vec2(0, 0);
        }
    };
    Mat4.prototype.getRotation = function () {
        if (this.m[0] != 0 || this.m[1] != 0) {
            var r = Math.sqrt(this.m[0] * this.m[0] + this.m[1] * this.m[1]);
            return (0, math_1.rad2deg)(this.m[1] > 0
                ? Math.acos(this.m[0] / r)
                : -Math.acos(this.m[0] / r));
        }
        else if (this.m[4] != 0 || this.m[5] != 0) {
            var s = Math.sqrt(this.m[4] * this.m[4] + this.m[5] * this.m[5]);
            return (0, math_1.rad2deg)(Math.PI / 2 - (this.m[5] > 0
                ? Math.acos(-this.m[4] / s)
                : -Math.acos(this.m[4] / s)));
        }
        else {
            return 0;
        }
    };
    Mat4.prototype.getSkew = function () {
        if (this.m[0] != 0 || this.m[1] != 0) {
            var r = Math.sqrt(this.m[0] * this.m[0] + this.m[1] * this.m[1]);
            return new Vec2_1.Vec2(Math.atan(this.m[0] * this.m[4] + this.m[1] * this.m[5])
                / (r * r), 0);
        }
        else if (this.m[4] != 0 || this.m[5] != 0) {
            var s = Math.sqrt(this.m[4] * this.m[4] + this.m[5] * this.m[5]);
            return new Vec2_1.Vec2(0, Math.atan(this.m[0] * this.m[4] + this.m[1] * this.m[5])
                / (s * s));
        }
        else {
            return new Vec2_1.Vec2(0, 0);
        }
    };
    Mat4.prototype.invert = function () {
        var out = [];
        var f00 = this.m[10] * this.m[15] - this.m[14] * this.m[11];
        var f01 = this.m[9] * this.m[15] - this.m[13] * this.m[11];
        var f02 = this.m[9] * this.m[14] - this.m[13] * this.m[10];
        var f03 = this.m[8] * this.m[15] - this.m[12] * this.m[11];
        var f04 = this.m[8] * this.m[14] - this.m[12] * this.m[10];
        var f05 = this.m[8] * this.m[13] - this.m[12] * this.m[9];
        var f06 = this.m[6] * this.m[15] - this.m[14] * this.m[7];
        var f07 = this.m[5] * this.m[15] - this.m[13] * this.m[7];
        var f08 = this.m[5] * this.m[14] - this.m[13] * this.m[6];
        var f09 = this.m[4] * this.m[15] - this.m[12] * this.m[7];
        var f10 = this.m[4] * this.m[14] - this.m[12] * this.m[6];
        var f11 = this.m[5] * this.m[15] - this.m[13] * this.m[7];
        var f12 = this.m[4] * this.m[13] - this.m[12] * this.m[5];
        var f13 = this.m[6] * this.m[11] - this.m[10] * this.m[7];
        var f14 = this.m[5] * this.m[11] - this.m[9] * this.m[7];
        var f15 = this.m[5] * this.m[10] - this.m[9] * this.m[6];
        var f16 = this.m[4] * this.m[11] - this.m[8] * this.m[7];
        var f17 = this.m[4] * this.m[10] - this.m[8] * this.m[6];
        var f18 = this.m[4] * this.m[9] - this.m[8] * this.m[5];
        out[0] = this.m[5] * f00 - this.m[6] * f01 + this.m[7] * f02;
        out[4] = -(this.m[4] * f00 - this.m[6] * f03 + this.m[7] * f04);
        out[8] = this.m[4] * f01 - this.m[5] * f03 + this.m[7] * f05;
        out[12] = -(this.m[4] * f02 - this.m[5] * f04 + this.m[6] * f05);
        out[1] = -(this.m[1] * f00 - this.m[2] * f01 + this.m[3] * f02);
        out[5] = this.m[0] * f00 - this.m[2] * f03 + this.m[3] * f04;
        out[9] = -(this.m[0] * f01 - this.m[1] * f03 + this.m[3] * f05);
        out[13] = this.m[0] * f02 - this.m[1] * f04 + this.m[2] * f05;
        out[2] = this.m[1] * f06 - this.m[2] * f07 + this.m[3] * f08;
        out[6] = -(this.m[0] * f06 - this.m[2] * f09 + this.m[3] * f10);
        out[10] = this.m[0] * f11 - this.m[1] * f09 + this.m[3] * f12;
        out[14] = -(this.m[0] * f08 - this.m[1] * f10 + this.m[2] * f12);
        out[3] = -(this.m[1] * f13 - this.m[2] * f14 + this.m[3] * f15);
        out[7] = this.m[0] * f13 - this.m[2] * f16 + this.m[3] * f17;
        out[11] = -(this.m[0] * f14 - this.m[1] * f16 + this.m[3] * f18);
        out[15] = this.m[0] * f15 - this.m[1] * f17 + this.m[2] * f18;
        var det = this.m[0] * out[0]
            + this.m[1] * out[4]
            + this.m[2] * out[8]
            + this.m[3] * out[12];
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                out[i * 4 + j] *= 1.0 / det;
            }
        }
        return new Mat4(out);
    };
    Mat4.prototype.clone = function () {
        return new Mat4(__spreadArray([], this.m, true));
    };
    Mat4.prototype.toString = function () {
        return this.m.toString();
    };
    return Mat4;
}());
exports.Mat4 = Mat4;

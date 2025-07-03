"use strict";
// TODO: A lot
// - move RNG to it's own file
// - move Vec2 to it's own file
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
exports.Polygon = exports.Ellipse = exports.Circle = exports.Rect = exports.Line = exports.Point = exports.RNG = exports.M = exports.C = exports.A = exports.Mat23 = exports.Quad = void 0;
exports.deg2rad = deg2rad;
exports.rad2deg = rad2deg;
exports.map = map;
exports.mapc = mapc;
exports.step = step;
exports.smoothstep = smoothstep;
exports.vec2 = vec2;
exports.quad = quad;
exports.wave = wave;
exports.randSeed = randSeed;
exports.rand = rand;
exports.randi = randi;
exports.chance = chance;
exports.shuffle = shuffle;
exports.chooseMultiple = chooseMultiple;
exports.choose = choose;
exports.testRectRect2 = testRectRect2;
exports.testRectRect = testRectRect;
exports.testLineLineT = testLineLineT;
exports.testLineLine = testLineLine;
exports.clipLineToRect = clipLineToRect;
exports.testRectLine = testRectLine;
exports.testRectPoint2 = testRectPoint2;
exports.testRectPoint = testRectPoint;
exports.testRectCircle = testRectCircle;
exports.testRectPolygon = testRectPolygon;
exports.testLinePoint = testLinePoint;
exports.clipLineToCircle = clipLineToCircle;
exports.testLineCircle = testLineCircle;
exports.testLinePolygon = testLinePolygon;
exports.testCirclePoint = testCirclePoint;
exports.testCircleCircle = testCircleCircle;
exports.testCirclePolygon = testCirclePolygon;
exports.testPolygonPolygon = testPolygonPolygon;
exports.testPolygonPoint = testPolygonPoint;
exports.testEllipsePoint = testEllipsePoint;
exports.testEllipseCircle = testEllipseCircle;
exports.testEllipseLine = testEllipseLine;
exports.testEllipseEllipse = testEllipseEllipse;
exports.testEllipseRect = testEllipseRect;
exports.testEllipsePolygon = testEllipsePolygon;
exports.testPointPoint = testPointPoint;
exports.testPointShape = testPointShape;
exports.testLineShape = testLineShape;
exports.testCircleShape = testCircleShape;
exports.testRectShape = testRectShape;
exports.testPolygonShape = testPolygonShape;
exports.testEllipseShape = testEllipseShape;
exports.testShapeShape = testShapeShape;
exports.raycastGrid = raycastGrid;
exports.evaluateQuadratic = evaluateQuadratic;
exports.evaluateQuadraticFirstDerivative = evaluateQuadraticFirstDerivative;
exports.evaluateQuadraticSecondDerivative = evaluateQuadraticSecondDerivative;
exports.evaluateBezier = evaluateBezier;
exports.evaluateBezierFirstDerivative = evaluateBezierFirstDerivative;
exports.evaluateBezierSecondDerivative = evaluateBezierSecondDerivative;
exports.evaluateCatmullRom = evaluateCatmullRom;
exports.evaluateCatmullRomFirstDerivative = evaluateCatmullRomFirstDerivative;
exports.normalizedCurve = normalizedCurve;
exports.curveLengthApproximation = curveLengthApproximation;
exports.hermite = hermite;
exports.cardinal = cardinal;
exports.catmullRom = catmullRom;
exports.bezier = bezier;
exports.kochanekBartels = kochanekBartels;
exports.hermiteFirstDerivative = hermiteFirstDerivative;
exports.easingLinear = easingLinear;
exports.easingCubicBezier = easingCubicBezier;
exports.easingSteps = easingSteps;
exports.triangulate = triangulate;
exports.isConvex = isConvex;
var shared_1 = require("../shared");
var clamp_1 = require("./clamp");
var color_1 = require("./color");
var lerp_1 = require("./lerp");
var Vec2_1 = require("./Vec2");
function deg2rad(deg) {
    return deg * Math.PI / 180;
}
function rad2deg(rad) {
    return rad * 180 / Math.PI;
}
function map(v, l1, h1, l2, h2) {
    return l2 + (v - l1) / (h1 - l1) * (h2 - l2);
}
function mapc(v, l1, h1, l2, h2) {
    return (0, clamp_1.clamp)(map(v, l1, h1, l2, h2), l2, h2);
}
function step(edge, x) {
    return x < edge ? 0 : 1;
}
function smoothstep(edge0, edge1, x) {
    x = (0, clamp_1.clamp)((x - edge0) / (edge1 - edge0), 0, 1);
    return x * x * (3.0 - 2.0 * x);
}
function vec2() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (args.length === 1) {
        if (args[0] instanceof Vec2_1.Vec2) {
            return new Vec2_1.Vec2(args[0].x, args[0].y);
        }
        else if (Array.isArray(args[0]) && args[0].length === 2) {
            return new (Vec2_1.Vec2.bind.apply(Vec2_1.Vec2, __spreadArray([void 0], args[0], false)))();
        }
    }
    // @ts-ignore
    return new (Vec2_1.Vec2.bind.apply(Vec2_1.Vec2, __spreadArray([void 0], args, false)))();
}
/**
 * @group Math
 */
var Quad = /** @class */ (function () {
    function Quad(x, y, w, h) {
        this.x = 0;
        this.y = 0;
        this.w = 1;
        this.h = 1;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    Quad.prototype.scale = function (other) {
        return new Quad(this.x + this.w * other.x, this.y + this.h * other.y, this.w * other.w, this.h * other.h);
    };
    Quad.prototype.pos = function () {
        return new Vec2_1.Vec2(this.x, this.y);
    };
    Quad.prototype.clone = function () {
        return new Quad(this.x, this.y, this.w, this.h);
    };
    Quad.prototype.eq = function (other) {
        return this.x === other.x
            && this.y === other.y
            && this.w === other.w
            && this.h === other.h;
    };
    Quad.prototype.toString = function () {
        return "quad(".concat(this.x, ", ").concat(this.y, ", ").concat(this.w, ", ").concat(this.h, ")");
    };
    return Quad;
}());
exports.Quad = Quad;
function quad(x, y, w, h) {
    return new Quad(x, y, w, h);
}
// Internal class
var Mat2 = /** @class */ (function () {
    function Mat2(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
    Mat2.prototype.mul = function (other) {
        return new Mat2(this.a * other.a + this.b * other.c, this.a * other.b + this.b * other.d, this.c * other.a + this.d * other.c, this.c * other.b + this.d * other.d);
    };
    Mat2.prototype.transform = function (point) {
        return vec2(this.a * point.x + this.b * point.y, this.c * point.x + this.d * point.y);
    };
    Object.defineProperty(Mat2.prototype, "inverse", {
        get: function () {
            var det = this.det;
            return new Mat2(this.d / det, -this.b / det, -this.c / det, this.a / det);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mat2.prototype, "transpose", {
        get: function () {
            return new Mat2(this.a, this.c, this.b, this.d);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mat2.prototype, "eigenvalues", {
        get: function () {
            var m = this.trace / 2;
            var d = this.det;
            var e1 = m + Math.sqrt(m * m - d);
            var e2 = m - Math.sqrt(m * m - d);
            return [e1, e2];
        },
        enumerable: false,
        configurable: true
    });
    Mat2.prototype.eigenvectors = function (e1, e2) {
        if (this.c != 0) {
            return [[e1 - this.d, this.c], [e2 - this.d, this.c]];
        }
        else if (this.b != 0) {
            return [[this.b, e1 - this.a], [this.b, e2 - this.a]];
        }
        else {
            if (Math.abs(this.transform(vec2(1, 0)).x - e1) < Number.EPSILON) {
                return [[1, 0], [0, 1]];
            }
            else {
                return [[0, 1], [1, 0]];
            }
        }
    };
    Object.defineProperty(Mat2.prototype, "det", {
        get: function () {
            return this.a * this.d - this.b * this.c;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mat2.prototype, "trace", {
        get: function () {
            return this.a + this.d;
        },
        enumerable: false,
        configurable: true
    });
    Mat2.rotation = function (radians) {
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        return new Mat2(c, s, -s, c);
    };
    Mat2.scale = function (x, y) {
        return new Mat2(x, 0, 0, y);
    };
    return Mat2;
}());
// Internal class
var Mat23 = /** @class */ (function () {
    function Mat23(a, b, c, d, e, f) {
        if (a === void 0) { a = 1; }
        if (b === void 0) { b = 0; }
        if (c === void 0) { c = 0; }
        if (d === void 0) { d = 1; }
        if (e === void 0) { e = 0; }
        if (f === void 0) { f = 0; }
        this._inverse = null;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
    }
    Mat23.fromMat2 = function (m) {
        return new Mat23(m.a, m.b, m.c, m.d, 0, 0);
    };
    Mat23.prototype.toMat2 = function () {
        return new Mat2(this.a, this.b, this.c, this.d);
    };
    Mat23.fromTranslation = function (t) {
        return new Mat23(1, 0, 0, 1, t.x, t.y);
    };
    Mat23.fromRotation = function (radians) {
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        return new Mat23(c, s, -s, c, 0, 0);
    };
    Mat23.fromScale = function (s) {
        return new Mat23(s.x, 0, 0, s.y, 0, 0);
    };
    Mat23.prototype.clone = function () {
        return new Mat23(this.a, this.b, this.c, this.d, this.e, this.f);
    };
    Mat23.prototype.setMat23 = function (m) {
        this.a = m.a;
        this.b = m.b;
        this.c = m.c;
        this.d = m.d;
        this.e = m.e;
        this.f = m.f;
        this._inverse = m._inverse;
        return this;
    };
    Mat23.prototype.setIdentity = function () {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
        this._inverse = null;
        return this;
    };
    Mat23.prototype.mul = function (other) {
        return new Mat23(other.a * this.a + other.b * this.c, other.a * this.b + other.b * this.d, other.c * this.a + other.d * this.c, other.c * this.b + other.d * this.d, other.e * this.a + other.f * this.c + this.e, other.e * this.b + other.f * this.d + this.f);
    };
    Mat23.prototype.translateSelfV = function (t) {
        this.e += t.x * this.a + t.y * this.c;
        this.f += t.x * this.b + t.y * this.d;
        this._inverse = null;
        return this;
    };
    Mat23.prototype.translateSelf = function (x, y) {
        this.e += x * this.a + y * this.c;
        this.f += x * this.b + y * this.d;
        this._inverse = null;
        return this;
    };
    Mat23.prototype.rotateSelf = function (degrees) {
        var radians = deg2rad(degrees);
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        var oldA = this.a;
        var oldB = this.b;
        this.a = c * this.a + s * this.c;
        this.b = c * this.b + s * this.d;
        this.c = c * this.c - s * oldA;
        this.d = c * this.d - s * oldB;
        this._inverse = null;
        return this;
    };
    Mat23.prototype.scaleSelfV = function (s) {
        this.a *= s.x;
        this.b *= s.x;
        this.c *= s.y;
        this.d *= s.y;
        this._inverse = null;
        return this;
    };
    Mat23.prototype.scaleSelf = function (x, y) {
        this.a *= x;
        this.b *= x;
        this.c *= y;
        this.d *= y;
        this._inverse = null;
        return this;
    };
    Mat23.prototype.mulSelf = function (other) {
        var a = other.a * this.a + other.b * this.c;
        var b = other.a * this.b + other.b * this.d;
        var c = other.c * this.a + other.d * this.c;
        var d = other.c * this.b + other.d * this.d;
        var e = other.e * this.a + other.f * this.c + this.e;
        var f = other.e * this.b + other.f * this.d + this.f;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        this._inverse = null;
        return this;
    };
    Mat23.prototype.transform = function (p) {
        return vec2(this.a * p.x + this.c * p.y + this.e, this.b * p.x + this.d * p.y + this.f);
    };
    Mat23.prototype.transformPointV = function (p, o) {
        var tmp = p.x;
        o.x = this.a * p.x + this.c * p.y + this.e;
        o.y = this.b * tmp + this.d * p.y + this.f;
        return o;
    };
    Mat23.prototype.transformVectorV = function (v, o) {
        var tmp = v.x;
        o.x = this.a * v.x + this.c * v.y;
        o.y = this.b * tmp + this.d * v.y;
        return o;
    };
    Mat23.prototype.transformPoint = function (x, y, o) {
        var tmp = x;
        o.x = this.a * x + this.c * y + this.e;
        o.y = this.b * tmp + this.d * y + this.f;
        return o;
    };
    Mat23.prototype.transformVector = function (x, y, o) {
        var tmp = x;
        o.x = this.a * x + this.c * y;
        o.y = this.b * tmp + this.d * y;
        return o;
    };
    Object.defineProperty(Mat23.prototype, "det", {
        get: function () {
            return this.a * this.d - this.b * this.c;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mat23.prototype, "inverse", {
        get: function () {
            if (this._inverse)
                return this._inverse;
            var det = this.det;
            this._inverse = new Mat23(this.d / det, -this.b / det, -this.c / det, this.a / det, (this.c * this.f - this.d * this.e) / det, (this.b * this.e - this.a * this.f) / det);
            return this._inverse;
        },
        enumerable: false,
        configurable: true
    });
    Mat23.prototype.getTranslation = function () {
        return new Vec2_1.Vec2(this.e, this.f);
    };
    Mat23.prototype.getRotation = function () {
        return rad2deg(Math.atan2(-this.c, this.a));
    };
    Mat23.prototype.getScale = function () {
        return new Vec2_1.Vec2(Math.sqrt(this.a * this.a + this.c * this.c), Math.sqrt(this.b * this.b + this.d * this.d));
    };
    return Mat23;
}());
exports.Mat23 = Mat23;
// Internal class
var Mat3 = /** @class */ (function () {
    function Mat3(m11, m12, m13, m21, m22, m23, m31, m32, m33) {
        this.m11 = m11;
        this.m12 = m12;
        this.m13 = m13;
        this.m21 = m21;
        this.m22 = m22;
        this.m23 = m23;
        this.m31 = m31;
        this.m32 = m32;
        this.m33 = m33;
    }
    Mat3.fromMat2 = function (m) {
        return new Mat3(m.a, m.b, 0, m.c, m.d, 0, 0, 0, 1);
    };
    Mat3.prototype.toMat2 = function () {
        return new Mat2(this.m11, this.m12, this.m21, this.m22);
    };
    Mat3.prototype.mul = function (other) {
        return new Mat3(this.m11 * other.m11 + this.m12 * other.m21 + this.m13 * other.m31, this.m11 * other.m12 + this.m12 * other.m22 + this.m13 * other.m32, this.m11 * other.m13 + this.m12 * other.m23 + this.m13 * other.m33, this.m21 * other.m11 + this.m22 * other.m21 + this.m23 * other.m31, this.m21 * other.m12 + this.m22 * other.m22 + this.m23 * other.m32, this.m21 * other.m13 + this.m22 * other.m23 + this.m23 * other.m33, this.m31 * other.m11 + this.m32 * other.m21 + this.m33 * other.m31, this.m31 * other.m12 + this.m32 * other.m22 + this.m33 * other.m32, this.m31 * other.m13 + this.m32 * other.m23 + this.m33 * other.m33);
    };
    Object.defineProperty(Mat3.prototype, "det", {
        get: function () {
            return this.m11 * this.m22 * this.m33 + this.m12 * this.m23 * this.m31
                + this.m13 * this.m21 * this.m32 - this.m13 * this.m22 * this.m31
                - this.m12 * this.m21 * this.m33 - this.m11 * this.m23 * this.m32;
        },
        enumerable: false,
        configurable: true
    });
    Mat3.prototype.rotate = function (radians) {
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        var oldA = this.m11;
        var oldB = this.m12;
        this.m11 = c * this.m11 + s * this.m21;
        this.m12 = c * this.m12 + s * this.m22;
        this.m21 = c * this.m21 - s * oldA;
        this.m22 = c * this.m22 - s * oldB;
        return this;
    };
    Mat3.prototype.scale = function (x, y) {
        this.m11 *= x;
        this.m12 *= x;
        this.m21 *= y;
        this.m22 *= y;
        return this;
    };
    Object.defineProperty(Mat3.prototype, "inverse", {
        get: function () {
            var det = this.det;
            return new Mat3((this.m22 * this.m33 - this.m23 * this.m32) / det, (this.m13 * this.m32 - this.m12 * this.m33) / det, (this.m12 * this.m23 - this.m13 * this.m22) / det, (this.m23 * this.m31 - this.m21 * this.m33) / det, (this.m11 * this.m33 - this.m13 * this.m31) / det, (this.m13 * this.m21 - this.m11 * this.m23) / det, (this.m21 * this.m32 - this.m22 * this.m31) / det, (this.m12 * this.m31 - this.m11 * this.m32) / det, (this.m11 * this.m22 - this.m12 * this.m21) / det);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mat3.prototype, "transpose", {
        get: function () {
            return new Mat3(this.m11, this.m21, this.m31, this.m12, this.m22, this.m32, this.m13, this.m23, this.m33);
        },
        enumerable: false,
        configurable: true
    });
    return Mat3;
}());
function wave(lo, hi, t, f) {
    if (f === void 0) { f = function (t) { return -Math.cos(t); }; }
    return (0, lerp_1.lerp)(lo, hi, (f(t) + 1) / 2);
}
// basic ANSI C LCG
exports.A = 1103515245;
exports.C = 12345;
exports.M = 2147483648;
/**
 * A random number generator using the linear congruential generator algorithm.
 *
 * @group Math
 */
var RNG = /** @class */ (function () {
    function RNG(seed) {
        this.seed = seed;
    }
    /**
     * Generate a random number between 0 and 1.
     *
     * @example
     * ```js
     * const rng = new RNG(Date.now())
     * const value = rng.gen() // Returns number between 0-1
     * ```
     *
     * @returns A number between 0 and 1.
     */
    RNG.prototype.gen = function () {
        this.seed = (exports.A * this.seed + exports.C) % exports.M;
        return this.seed / exports.M;
    };
    /**
     * Generate a random number between two values.
     *
     * @param a - The minimum value.
     * @param b - The maximum value.
     *
     * @example
     * ```js
     * const rng = new RNG(Date.now())
     * const value = rng.genNumber(10, 20) // Returns number between 10-20
     * ```
     *
     * @returns A number between a and b.
     */
    RNG.prototype.genNumber = function (a, b) {
        return a + this.gen() * (b - a);
    };
    /**
     * Generate a random 2D vector between two vectors.
     *
     * @param a - The minimum vector.
     * @param b - The maximum vector.
     *
     * @example
     * ```js
     * const rng = new RNG(Date.now())
     * const vec = rng.genVec2(vec2(0,0), vec2(100,100))
     * ```
     *
     * @returns A vector between vectors a and b.
     */
    RNG.prototype.genVec2 = function (a, b) {
        return new Vec2_1.Vec2(this.genNumber(a.x, b.x), this.genNumber(a.y, b.y));
    };
    /**
     * Generate a random color between two colors.
     *
     * @param a - The first color.
     * @param b - The second color.
     *
     * @example
     * ```js
     * const rng = new RNG(Date.now())
     * const color = rng.genColor(rgb(0,0,0), rgb(255,255,255))
     * ```
     *
     * @returns A color between colors a and b.
     */
    RNG.prototype.genColor = function (a, b) {
        return new color_1.Color(this.genNumber(a.r, b.r), this.genNumber(a.g, b.g), this.genNumber(a.b, b.b));
    };
    /**
     * Generate a random value of a specific type.
     *
     * @param args - No args for [0-1], one arg for [0-arg], or two args for [arg1-arg2].
     *
     * @example
     * ```js
     * const rng = new RNG(Date.now())
     * const val = rng.genAny(0, 100) // Number between 0-100
     * const vec = rng.genAny(vec2(0,0), vec2(100,100)) // Vec2
     * const col = rng.genAny(rgb(0,0,0), rgb(255,255,255)) // Color
     * ```
     *
     * @returns A random value.
     */
    RNG.prototype.genAny = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 0) {
            return this.gen();
        }
        else if (args.length === 1) {
            if (typeof args[0] === "number") {
                return this.genNumber(0, args[0]);
            }
            else if (args[0] instanceof Vec2_1.Vec2) {
                return this.genVec2(vec2(0, 0), args[0]);
            }
            else if (args[0] instanceof color_1.Color) {
                return this.genColor((0, color_1.rgb)(0, 0, 0), args[0]);
            }
        }
        else if (args.length === 2) {
            if (typeof args[0] === "number" && typeof args[1] === "number") {
                return this.genNumber(args[0], args[1]);
            }
            else if (args[0] instanceof Vec2_1.Vec2 && args[1] instanceof Vec2_1.Vec2) {
                return this.genVec2(args[0], args[1]);
            }
            else if (args[0] instanceof color_1.Color && args[1] instanceof color_1.Color) {
                return this.genColor(args[0], args[1]);
            }
        }
        throw new Error("More than 2 arguments not supported");
    };
    return RNG;
}());
exports.RNG = RNG;
function randSeed(seed) {
    if (seed != null) {
        shared_1._k.game.defRNG.seed = seed;
    }
    return shared_1._k.game.defRNG.seed;
}
function rand() {
    var _a;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return (_a = shared_1._k.game.defRNG).genAny.apply(_a, args);
}
function randi() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return Math.floor(rand.apply(void 0, (args.length > 0 ? args : [2])));
}
function chance(p) {
    return rand() <= p;
}
function shuffle(list) {
    var _a;
    for (var i = list.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [list[j], list[i]], list[i] = _a[0], list[j] = _a[1];
    }
    return list;
}
function chooseMultiple(list, count) {
    return list.length <= count
        ? list.slice()
        : shuffle(list.slice()).slice(0, count);
}
function choose(list) {
    return list[randi(list.length)];
}
// TODO: better name
function testRectRect2(r1, r2) {
    return r1.pos.x + r1.width >= r2.pos.x
        && r1.pos.x <= r2.pos.x + r2.width
        && r1.pos.y + r1.height >= r2.pos.y
        && r1.pos.y <= r2.pos.y + r2.height;
}
function testRectRect(r1, r2) {
    return r1.pos.x + r1.width > r2.pos.x
        && r1.pos.x < r2.pos.x + r2.width
        && r1.pos.y + r1.height > r2.pos.y
        && r1.pos.y < r2.pos.y + r2.height;
}
// TODO: better name
function testLineLineT(l1, l2) {
    if ((l1.p1.x === l1.p2.x && l1.p1.y === l1.p2.y)
        || (l2.p1.x === l2.p2.x && l2.p1.y === l2.p2.y)) {
        return null;
    }
    var denom = (l2.p2.y - l2.p1.y) * (l1.p2.x - l1.p1.x)
        - (l2.p2.x - l2.p1.x) * (l1.p2.y - l1.p1.y);
    // parallel
    if (denom === 0) {
        return null;
    }
    var ua = ((l2.p2.x - l2.p1.x) * (l1.p1.y - l2.p1.y)
        - (l2.p2.y - l2.p1.y) * (l1.p1.x - l2.p1.x)) / denom;
    var ub = ((l1.p2.x - l1.p1.x) * (l1.p1.y - l2.p1.y)
        - (l1.p2.y - l1.p1.y) * (l1.p1.x - l2.p1.x)) / denom;
    // is the intersection on the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return null;
    }
    return ua;
}
function testLineLine(l1, l2) {
    var t = testLineLineT(l1, l2);
    if (!t)
        return null;
    return vec2(l1.p1.x + t * (l1.p2.x - l1.p1.x), l1.p1.y + t * (l1.p2.y - l1.p1.y));
}
function clipLineToRect(r, l, result) {
    var dir = l.p2.sub(l.p1);
    var tmin = Number.NEGATIVE_INFINITY, tmax = Number.POSITIVE_INFINITY;
    if (dir.x != 0.0) {
        var tx1 = (r.pos.x - l.p1.x) / dir.x;
        var tx2 = (r.pos.x + r.width - l.p1.x) / dir.x;
        tmin = Math.max(tmin, Math.min(tx1, tx2));
        tmax = Math.min(tmax, Math.max(tx1, tx2));
    }
    else {
        if (l.p1.x < r.pos.x || l.p1.x > r.pos.x + r.width) {
            return false;
        }
    }
    if (dir.y != 0.0) {
        var ty1 = (r.pos.y - l.p1.y) / dir.y;
        var ty2 = (r.pos.y + r.height - l.p1.y) / dir.y;
        tmin = Math.max(tmin, Math.min(ty1, ty2));
        tmax = Math.min(tmax, Math.max(ty1, ty2));
    }
    else {
        if (l.p1.y < r.pos.y || l.p1.y > r.pos.y + r.height) {
            return false;
        }
    }
    if (tmax >= tmin && tmax >= 0 && tmin <= 1) {
        Vec2_1.Vec2.addScaled(l.p1, dir, Math.max(tmin, 0), result.p1);
        Vec2_1.Vec2.addScaled(l.p1, dir, Math.min(tmax, 1), result.p2);
        return true;
    }
    else {
        return false;
    }
}
function testRectLine(r, l) {
    var dir = l.p2.sub(l.p1);
    var tmin = Number.NEGATIVE_INFINITY, tmax = Number.POSITIVE_INFINITY;
    if (dir.x != 0.0) {
        var tx1 = (r.pos.x - l.p1.x) / dir.x;
        var tx2 = (r.pos.x + r.width - l.p1.x) / dir.x;
        tmin = Math.max(tmin, Math.min(tx1, tx2));
        tmax = Math.min(tmax, Math.max(tx1, tx2));
    }
    else {
        if (l.p1.x < r.pos.x || l.p1.x > r.pos.x + r.width) {
            return false;
        }
    }
    if (dir.y != 0.0) {
        var ty1 = (r.pos.y - l.p1.y) / dir.y;
        var ty2 = (r.pos.y + r.height - l.p1.y) / dir.y;
        tmin = Math.max(tmin, Math.min(ty1, ty2));
        tmax = Math.min(tmax, Math.max(ty1, ty2));
    }
    else {
        if (l.p1.y < r.pos.y || l.p1.y > r.pos.y + r.height) {
            return false;
        }
    }
    return tmax >= tmin && tmax >= 0 && tmin <= 1;
}
function testRectPoint2(r, pt) {
    return pt.x >= r.pos.x
        && pt.x <= r.pos.x + r.width
        && pt.y >= r.pos.y
        && pt.y <= r.pos.y + r.height;
}
function testRectPoint(r, pt) {
    return pt.x > r.pos.x
        && pt.x < r.pos.x + r.width
        && pt.y > r.pos.y
        && pt.y < r.pos.y + r.height;
}
function testRectCircle(r, c) {
    var nx = Math.max(r.pos.x, Math.min(c.center.x, r.pos.x + r.width));
    var ny = Math.max(r.pos.y, Math.min(c.center.y, r.pos.y + r.height));
    var nearestPoint = vec2(nx, ny);
    return nearestPoint.sdist(c.center) <= c.radius * c.radius;
}
function testRectPolygon(r, p) {
    return testPolygonPolygon(p, new Polygon(r.points()));
}
function testLinePoint(l, pt) {
    var v1 = pt.sub(l.p1);
    var v2 = l.p2.sub(l.p1);
    // Check if sine is 0, in that case lines are parallel.
    // If not parallel, the point cannot lie on the line.
    if (Math.abs(v1.cross(v2)) > Number.EPSILON) {
        return false;
    }
    // Scalar projection of v1 on v2
    var t = v1.dot(v2) / v2.dot(v2);
    // Since t is percentual distance of pt from line.p1 on the line,
    // it should be between 0% and 100%
    return t >= 0 && t <= 1;
}
function clipLineToCircle(circle, l, result) {
    var v = l.p2.sub(l.p1);
    var a = v.dot(v);
    var centerToOrigin = l.p1.sub(circle.center);
    var b = 2 * v.dot(centerToOrigin);
    var c = centerToOrigin.dot(centerToOrigin)
        - circle.radius * circle.radius;
    // Calculate the discriminant of ax^2 + bx + c
    var dis = b * b - 4 * a * c;
    // No root
    if ((a <= Number.EPSILON) || (dis < 0)) {
        return false;
    }
    // One possible root
    else if (dis == 0) {
        var t = -b / (2 * a);
        if (t >= 0 && t <= 1) {
            if (testCirclePoint(circle, l.p1)) {
                Vec2_1.Vec2.copy(l.p1, result.p1);
                Vec2_1.Vec2.addScaled(l.p1, v, t, result.p2);
            }
            else {
                Vec2_1.Vec2.addScaled(l.p1, v, t, result.p1);
                Vec2_1.Vec2.copy(l.p2, result.p2);
            }
            return true;
        }
    }
    // Two possible roots
    else {
        var t1 = (-b + Math.sqrt(dis)) / (2 * a);
        var t2 = (-b - Math.sqrt(dis)) / (2 * a);
        var b1 = t1 >= 0 && t1 <= 1;
        var b2 = t2 >= 0 && t2 <= 1;
        if (b1 && b2) {
            Vec2_1.Vec2.addScaled(l.p1, v, t1, result.p1);
            Vec2_1.Vec2.addScaled(l.p1, v, t2, result.p2);
            return true;
        }
        else if (b1 || b2) {
            var t = b1 ? t1 : t2;
            if (testCirclePoint(circle, l.p1)) {
                Vec2_1.Vec2.copy(l.p1, result.p1);
                Vec2_1.Vec2.addScaled(l.p1, v, t, result.p2);
            }
            else {
                Vec2_1.Vec2.addScaled(l.p1, v, t, result.p1);
                Vec2_1.Vec2.copy(l.p2, result.p2);
            }
            return true;
        }
    }
    // Check if line is completely within the circle
    // We only need to check one point, since the line didn't cross the circle
    if (testCirclePoint(circle, l.p1)) {
        Vec2_1.Vec2.copy(l.p1, result.p1);
        Vec2_1.Vec2.copy(l.p2, result.p2);
        return true;
    }
    else {
        return false;
    }
}
function testLineCircle(l, circle) {
    var v = l.p2.sub(l.p1);
    var a = v.dot(v);
    var centerToOrigin = l.p1.sub(circle.center);
    var b = 2 * v.dot(centerToOrigin);
    var c = centerToOrigin.dot(centerToOrigin)
        - circle.radius * circle.radius;
    // Calculate the discriminant of ax^2 + bx + c
    var dis = b * b - 4 * a * c;
    // No root
    if ((a <= Number.EPSILON) || (dis < 0)) {
        return false;
    }
    // One possible root
    else if (dis == 0) {
        var t = -b / (2 * a);
        if (t >= 0 && t <= 1) {
            return true;
        }
    }
    // Two possible roots
    else {
        var t1 = (-b + Math.sqrt(dis)) / (2 * a);
        var t2 = (-b - Math.sqrt(dis)) / (2 * a);
        if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) {
            return true;
        }
    }
    // Check if line is completely within the circle
    // We only need to check one point, since the line didn't cross the circle
    return testCirclePoint(circle, l.p1);
}
function testLinePolygon(l, p) {
    // test if line is inside
    if (testPolygonPoint(p, l.p1) || testPolygonPoint(p, l.p2)) {
        return true;
    }
    // test each line
    for (var i = 0; i < p.pts.length; i++) {
        var p1 = p.pts[i];
        var p2 = p.pts[(i + 1) % p.pts.length];
        if (testLineLine(l, new Line(p1, p2))) {
            return true;
        }
    }
    return false;
}
function testCirclePoint(c, p) {
    return c.center.sdist(p) < c.radius * c.radius;
}
function testCircleCircle(c1, c2) {
    return c1.center.sdist(c2.center)
        < (c1.radius + c2.radius) * (c1.radius + c2.radius);
}
function testCirclePolygon(c, p) {
    // For each edge check for intersection
    var prev = p.pts[p.pts.length - 1];
    for (var _i = 0, _a = p.pts; _i < _a.length; _i++) {
        var cur = _a[_i];
        if (testLineCircle(new Line(prev, cur), c)) {
            return true;
        }
        prev = cur;
    }
    // Check if the polygon is completely within the circle
    // We only need to check one point, since the polygon didn't cross the circle
    if (testCirclePoint(c, p.pts[0])) {
        return true;
    }
    // Check if the circle is completely within the polygon
    return testPolygonPoint(p, c.center);
}
function testPolygonPolygon(p1, p2) {
    for (var i = 0; i < p1.pts.length; i++) {
        if (testLinePolygon(new Line(p1.pts[i], p1.pts[(i + 1) % p1.pts.length]), p2)) {
            return true;
        }
    }
    // Check if any of the points of the polygon lie in the other polygon
    if (p1.pts.some(function (p) { return testPolygonPoint(p2, p); })
        || p2.pts.some(function (p) { return testPolygonPoint(p1, p); })) {
        return true;
    }
    return false;
}
// https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
function testPolygonPoint(poly, pt) {
    var c = false;
    var p = poly.pts;
    for (var i = 0, j = p.length - 1; i < p.length; j = i++) {
        if (((p[i].y > pt.y) != (p[j].y > pt.y))
            && (pt.x
                < (p[j].x - p[i].x) * (pt.y - p[i].y) / (p[j].y - p[i].y)
                    + p[i].x)) {
            c = !c;
        }
    }
    return c;
}
function testEllipsePoint(ellipse, pt) {
    // Transform the point into the ellipse's unrotated coordinate system at the origin
    pt = pt.sub(ellipse.center);
    var angle = deg2rad(ellipse.angle);
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var vx = pt.x * c + pt.y * s;
    var vy = -pt.x * s + pt.y * c;
    return vx * vx / (ellipse.radiusX * ellipse.radiusX)
        + vy * vy / (ellipse.radiusY * ellipse.radiusY) < 1;
}
function testEllipseCircle(ellipse, circle) {
    // This is an approximation, because the parallel curve of an ellipse is an octic algebraic curve, not just a larger ellipse.
    // Transform the circle's center into the ellipse's unrotated coordinate system at the origin
    var center = circle.center.sub(ellipse.center);
    var angle = deg2rad(ellipse.angle);
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var cx = center.x * c + center.y * s;
    var cy = -center.x * s + center.y * c;
    // Test with an approximate Minkowski sum of the ellipse and the circle
    return testEllipsePoint(new Ellipse(vec2(), ellipse.radiusX + circle.radius, ellipse.radiusY + circle.radius, 0), vec2(cx, cy));
}
function testEllipseLine(ellipse, line) {
    // Transform the line to the coordinate system where the ellipse is a unit circle
    var T = ellipse.toMat2().inverse;
    line = new Line(T.transform(line.p1.sub(ellipse.center)), T.transform(line.p2.sub(ellipse.center)));
    return testLineCircle(line, new Circle(vec2(), 1));
}
function testEllipseEllipse(ellipse1, ellipse2) {
    // First check if one of the ellipses isn't secretly a circle
    if (ellipse1.radiusX === ellipse1.radiusY) {
        return testEllipseCircle(ellipse2, new Circle(ellipse1.center, ellipse1.radiusX));
    }
    else if (ellipse2.radiusX === ellipse2.radiusY) {
        return testEllipseCircle(ellipse1, new Circle(ellipse2.center, ellipse2.radiusX));
    }
    // No luck, we need to solve the equation
    /*
    Etayo, Fernando, Laureano Gonzalez-Vega, and Natalia del Rio. "A new approach to characterizing the relative position of two ellipses depending on one parameter." Computer aided geometric design 23, no. 4 (2006): 324-350.
    */
    var A1 = new Mat3(1 / Math.pow(ellipse1.radiusX, 2), 0, 0, 0, 1 / Math.pow(ellipse1.radiusY, 2), 0, 0, 0, -1);
    var A2 = new Mat3(1 / Math.pow(ellipse2.radiusX, 2), 0, 0, 0, 1 / Math.pow(ellipse2.radiusY, 2), 0, 0, 0, -1);
    var x1 = ellipse1.center.x;
    var y1 = ellipse1.center.y;
    var x2 = ellipse2.center.x;
    var y2 = ellipse2.center.y;
    var theta1 = deg2rad(ellipse1.angle);
    var theta2 = deg2rad(ellipse2.angle);
    var M1 = new Mat3(Math.cos(theta1), -Math.sin(theta1), x1, Math.sin(theta1), Math.cos(theta1), y1, 0, 0, 1);
    var M2 = new Mat3(Math.cos(theta2), -Math.sin(theta2), x2, Math.sin(theta2), Math.cos(theta2), y2, 0, 0, 1);
    var M1inv = M1.inverse;
    var M2inv = M2.inverse;
    var A = M1inv.transpose.mul(A1).mul(M1inv);
    var B = M2inv.transpose.mul(A2).mul(M2inv);
    var a11 = A.m11;
    var a12 = A.m12;
    var a13 = A.m13;
    var a21 = A.m21;
    var a22 = A.m22;
    var a23 = A.m23;
    var a31 = A.m31;
    var a32 = A.m32;
    var a33 = A.m33;
    var b11 = B.m11;
    var b12 = B.m12;
    var b13 = B.m13;
    var b21 = B.m21;
    var b22 = B.m22;
    var b23 = B.m23;
    var b31 = B.m31;
    var b32 = B.m32;
    var b33 = B.m33;
    var factor = a11 * a22 * a33 - a11 * a23 * a32 - a12 * a21 * a33
        + a12 * a23 * a31 + a13 * a21 * a32 - a13 * a22 * a31;
    var a = (a11 * a22 * b33 - a11 * a23 * b32 - a11 * a32 * b23 + a11 * a33 * b22
        - a12 * a21 * b33 + a12 * a23 * b31 + a12 * a31 * b23
        - a12 * a33 * b21 + a13 * a21 * b32 - a13 * a22 * b31
        - a13 * a31 * b22 + a13 * a32 * b21 + a21 * a32 * b13
        - a21 * a33 * b12 - a22 * a31 * b13 + a22 * a33 * b11
        + a23 * a31 * b12 - a23 * a32 * b11) / factor;
    var b = (a11 * b22 * b33 - a11 * b23 * b32 - a12 * b21 * b33 + a12 * b23 * b31
        + a13 * b21 * b32 - a13 * b22 * b31 - a21 * b12 * b33
        + a21 * b13 * b32 + a22 * b11 * b33 - a22 * b13 * b31
        - a23 * b11 * b32 + a23 * b12 * b31 + a31 * b12 * b23
        - a31 * b13 * b22 - a32 * b11 * b23 + a32 * b13 * b21
        + a33 * b11 * b22 - a33 * b12 * b21) / factor;
    var c = (b11 * b22 * b33 - b11 * b23 * b32 - b12 * b21 * b33 + b12 * b23 * b31
        + b13 * b21 * b32 - b13 * b22 * b31) / factor;
    if (a >= 0) {
        var condition1 = -3 * b + Math.pow(a, 2);
        var condition2 = 3 * a * c + b * Math.pow(a, 2) - 4 * Math.pow(b, 2);
        var condition3 = -27 * Math.pow(c, 2) + 18 * c * a * b + Math.pow(a, 2) * Math.pow(b, 2)
            - 4 * Math.pow(a, 3) * c - 4 * Math.pow(b, 3);
        if (condition1 > 0 && condition2 < 0 && condition3 > 0) {
            return false;
        }
        else {
            return true;
        }
    }
    else {
        var condition1 = -3 * b + Math.pow(a, 2);
        var condition2 = -27 * Math.pow(c, 2) + 18 * c * a * b + Math.pow(a, 2) * Math.pow(b, 2)
            - 4 * Math.pow(a, 3) * c - 4 * Math.pow(b, 3);
        if (condition1 > 0 && condition2 > 0) {
            return false;
        }
        else {
            return true;
        }
    }
}
function testEllipseRect(ellipse, rect) {
    return testEllipsePolygon(ellipse, new Polygon(rect.points()));
}
function testEllipsePolygon(ellipse, poly) {
    // Transform the polygon to the coordinate system where the ellipse is a unit circle
    var T = ellipse.toMat2().inverse;
    poly = new Polygon(poly.pts.map(function (p) { return T.transform(p.sub(ellipse.center)); }));
    return testCirclePolygon(new Circle(vec2(), 1), poly);
}
function testPointPoint(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}
function testPointShape(point, shape) {
    if (shape instanceof Vec2_1.Vec2) {
        return testPointPoint(shape, point.pt);
    }
    else if (shape instanceof Circle) {
        return testCirclePoint(shape, point.pt);
    }
    else if (shape instanceof Line) {
        return testLinePoint(shape, point.pt);
    }
    else if (shape instanceof Rect) {
        return testRectPoint(shape, point.pt);
    }
    else if (shape instanceof Polygon) {
        return testPolygonPoint(shape, point.pt);
    }
    else if (shape instanceof Ellipse) {
        return testEllipsePoint(shape, point.pt);
    }
    else {
        return false;
    }
}
function testLineShape(line, shape) {
    if (shape instanceof Vec2_1.Vec2) {
        return testLinePoint(line, shape);
    }
    else if (shape instanceof Circle) {
        return testLineCircle(line, shape);
    }
    else if (shape instanceof Line) {
        return testLineLine(line, shape) != null;
    }
    else if (shape instanceof Rect) {
        return testRectLine(shape, line);
    }
    else if (shape instanceof Polygon) {
        return testLinePolygon(line, shape);
    }
    else if (shape instanceof Ellipse) {
        return testEllipseLine(shape, line);
    }
    else {
        return false;
    }
}
function testCircleShape(circle, shape) {
    if (shape instanceof Vec2_1.Vec2) {
        return testCirclePoint(circle, shape);
    }
    else if (shape instanceof Circle) {
        return testCircleCircle(circle, shape);
    }
    else if (shape instanceof Line) {
        return testLineCircle(shape, circle);
    }
    else if (shape instanceof Rect) {
        return testRectCircle(shape, circle);
    }
    else if (shape instanceof Polygon) {
        return testCirclePolygon(circle, shape);
    }
    else if (shape instanceof Ellipse) {
        return testEllipseCircle(shape, circle);
    }
    else {
        return false;
    }
}
function testRectShape(rect, shape) {
    if (shape instanceof Vec2_1.Vec2) {
        return testRectPoint(rect, shape);
    }
    else if (shape instanceof Circle) {
        return testRectCircle(rect, shape);
    }
    else if (shape instanceof Line) {
        return testRectLine(rect, shape);
    }
    else if (shape instanceof Rect) {
        return testRectRect(rect, shape);
    }
    else if (shape instanceof Polygon) {
        return testRectPolygon(rect, shape);
    }
    else if (shape instanceof Ellipse) {
        return testEllipseRect(shape, rect);
    }
    else {
        return false;
    }
}
function testPolygonShape(polygon, shape) {
    if (shape instanceof Vec2_1.Vec2) {
        return testPolygonPoint(polygon, shape);
    }
    else if (shape instanceof Circle) {
        return testCirclePolygon(shape, polygon);
    }
    else if (shape instanceof Line) {
        return testLinePolygon(shape, polygon);
    }
    else if (shape instanceof Rect) {
        return testRectPolygon(shape, polygon);
    }
    else if (shape instanceof Polygon) {
        return testPolygonPolygon(shape, polygon);
    }
    else if (shape instanceof Ellipse) {
        return testEllipsePolygon(shape, polygon);
    }
    else {
        return false;
    }
}
function testEllipseShape(ellipse, shape) {
    if (shape instanceof Vec2_1.Vec2) {
        return testEllipsePoint(ellipse, shape);
    }
    else if (shape instanceof Circle) {
        return testEllipseCircle(ellipse, shape);
    }
    else if (shape instanceof Line) {
        return testEllipseLine(ellipse, shape);
    }
    else if (shape instanceof Rect) {
        return testEllipseRect(ellipse, shape);
    }
    else if (shape instanceof Polygon) {
        return testEllipsePolygon(ellipse, shape);
    }
    else if (shape instanceof Ellipse) {
        return testEllipseEllipse(shape, ellipse);
    }
    else {
        return false;
    }
}
function testShapeShape(shape1, shape2) {
    if (shape1 instanceof Vec2_1.Vec2) {
        return testPointShape(new Point(shape1), shape2);
    }
    else if (shape1 instanceof Circle) {
        return testCircleShape(shape1, shape2);
    }
    else if (shape1 instanceof Line) {
        return testLineShape(shape1, shape2);
    }
    else if (shape1 instanceof Rect) {
        return testRectShape(shape1, shape2);
    }
    else if (shape1 instanceof Polygon) {
        return testPolygonShape(shape1, shape2);
    }
    else if (shape1 instanceof Ellipse) {
        return testEllipseShape(shape1, shape2);
    }
    else {
        return false;
    }
}
function raycastLine(origin, direction, line) {
    var a = origin;
    var c = line.p1;
    var d = line.p2;
    var ab = direction;
    var cd = d.sub(c);
    var abxcd = ab.cross(cd);
    // If parallel, no intersection
    if (Math.abs(abxcd) < Number.EPSILON) {
        return null;
    }
    var ac = c.sub(a);
    var s = ac.cross(cd) / abxcd;
    // Outside the ray
    if (s <= 0 || s >= 1) {
        return null;
    }
    // Outside the line
    var t = ac.cross(ab) / abxcd;
    if (t <= 0 || t >= 1) {
        return null;
    }
    var normal = cd.normal().unit();
    if (direction.dot(normal) > 0) {
        normal.x *= -1;
        normal.y *= -1;
    }
    return {
        point: a.add(ab.scale(s)),
        normal: normal,
        fraction: s,
    };
}
function raycastRect(origin, direction, rect) {
    var tmin = Number.NEGATIVE_INFINITY, tmax = Number.POSITIVE_INFINITY;
    var normal;
    if (origin.x != 0.0) {
        var tx1 = (rect.pos.x - origin.x) / direction.x;
        var tx2 = (rect.pos.x + rect.width - origin.x) / direction.x;
        normal = vec2(-Math.sign(direction.x), 0);
        tmin = Math.max(tmin, Math.min(tx1, tx2));
        tmax = Math.min(tmax, Math.max(tx1, tx2));
    }
    if (origin.y != 0.0) {
        var ty1 = (rect.pos.y - origin.y) / direction.y;
        var ty2 = (rect.pos.y + rect.height - origin.y) / direction.y;
        if (Math.min(ty1, ty2) > tmin) {
            normal = vec2(0, -Math.sign(direction.y));
        }
        tmin = Math.max(tmin, Math.min(ty1, ty2));
        tmax = Math.min(tmax, Math.max(ty1, ty2));
    }
    if (tmax >= tmin && tmin >= 0 && tmin <= 1) {
        var point = origin.add(direction.scale(tmin));
        return {
            point: point,
            normal: normal,
            fraction: tmin,
        };
    }
    else {
        return null;
    }
}
function raycastCircle(origin, direction, circle) {
    var a = origin;
    var c = circle.center;
    var ab = direction;
    var A = ab.dot(ab);
    var centerToOrigin = a.sub(c);
    var B = 2 * ab.dot(centerToOrigin);
    var C = centerToOrigin.dot(centerToOrigin)
        - circle.radius * circle.radius;
    // Calculate the discriminant of ax^2 + bx + c
    var disc = B * B - 4 * A * C;
    // No root
    if ((A <= Number.EPSILON) || (disc < 0)) {
        return null;
    }
    // One possible root
    else if (disc == 0) {
        var t = -B / (2 * A);
        if (t >= 0 && t <= 1) {
            var point = a.add(ab.scale(t));
            return {
                point: point,
                normal: point.sub(c),
                fraction: t,
            };
        }
    }
    // Two possible roots
    else {
        var t1 = (-B + Math.sqrt(disc)) / (2 * A);
        var t2 = (-B - Math.sqrt(disc)) / (2 * A);
        var t = null;
        if (t1 >= 0 && t1 <= 1) {
            t = t1;
        }
        if (t2 >= 0 && t2 <= 1) {
            t = Math.min(t2, t !== null && t !== void 0 ? t : t2);
        }
        if (t != null) {
            var point = a.add(ab.scale(t));
            return {
                point: point,
                normal: point.sub(c).unit(),
                fraction: t,
            };
        }
    }
    return null;
}
function raycastPolygon(origin, direction, polygon) {
    var points = polygon.pts;
    var minHit = null;
    var prev = points[points.length - 1];
    for (var i = 0; i < points.length; i++) {
        var cur = points[i];
        var hit = raycastLine(origin, direction, new Line(prev, cur));
        if (hit && (!minHit || minHit.fraction > hit.fraction)) {
            minHit = hit;
        }
        prev = cur;
    }
    return minHit;
}
function raycastEllipse(origin, direction, ellipse) {
    // Transforms from unit circle to rotated ellipse
    var T = ellipse.toMat2();
    // Transforms from rotated ellipse to unit circle
    var TI = T.inverse;
    // Transform both origin and direction into the unit circle coordinate system
    var Torigin = TI.transform(origin.sub(ellipse.center));
    var Tdirection = TI.transform(direction);
    // Raycast as if we have a circle
    var result = raycastCircle(Torigin, Tdirection, new Circle(vec2(), 1));
    if (result) {
        var R = Mat2.rotation(deg2rad(-ellipse.angle));
        var S = Mat2.scale(ellipse.radiusX, ellipse.radiusY);
        // Scale the point so we have a point on the unrotated ellipse
        var p = S.transform(result.point);
        // transform the result point to the coordinate system of the rotated ellipse
        var point = T.transform(result.point).add(ellipse.center);
        var fraction = point.dist(origin) / direction.len();
        return {
            point: point,
            // Calculate the normal at the unrotated ellipse, then rotate the normal to the rotated ellipse
            normal: R.transform(vec2(Math.pow(ellipse.radiusY, 2) * p.x, Math.pow(ellipse.radiusX, 2) * p.y)).unit(),
            fraction: fraction,
        };
    }
    return result;
}
function raycastGrid(origin, direction, gridPosHit, maxDistance) {
    if (maxDistance === void 0) { maxDistance = 64; }
    var pos = origin;
    var len = direction.len();
    var dir = direction.scale(1 / len);
    var t = 0;
    var gridPos = vec2(Math.floor(origin.x), Math.floor(origin.y));
    var step = vec2(dir.x > 0 ? 1 : -1, dir.y > 0 ? 1 : -1);
    var tDelta = vec2(Math.abs(1 / dir.x), Math.abs(1 / dir.y));
    var dist = vec2((step.x > 0) ? (gridPos.x + 1 - origin.x) : (origin.x - gridPos.x), (step.y > 0) ? (gridPos.y + 1 - origin.y) : (origin.y - gridPos.y));
    var tMax = vec2((tDelta.x < Infinity) ? tDelta.x * dist.x : Infinity, (tDelta.y < Infinity) ? tDelta.y * dist.y : Infinity);
    var steppedIndex = -1;
    while (t <= maxDistance) {
        var hit = gridPosHit(gridPos);
        if (hit === true) {
            return {
                point: pos.add(dir.scale(t)),
                normal: vec2(steppedIndex === 0 ? -step.x : 0, steppedIndex === 1 ? -step.y : 0),
                fraction: t / len, // Since dir is normalized, t is len times too large
                gridPos: gridPos,
            };
        }
        else if (hit) {
            return hit;
        }
        if (tMax.x < tMax.y) {
            gridPos.x += step.x;
            t = tMax.x;
            tMax.x += tDelta.x;
            steppedIndex = 0;
        }
        else {
            gridPos.y += step.y;
            t = tMax.y;
            tMax.y += tDelta.y;
            steppedIndex = 1;
        }
    }
    return null;
}
var Point = /** @class */ (function () {
    function Point(pt) {
        this.pt = pt.clone();
    }
    Point.prototype.transform = function (m, s) {
        if (s && s instanceof Point) {
            m.transformPointV(this.pt, s.pt);
            return s;
        }
        return new Point(m.transformPointV(this.pt, vec2()));
    };
    Point.prototype.bbox = function () {
        return new Rect(this.pt, 0, 0);
    };
    Point.prototype.area = function () {
        return 0;
    };
    Point.prototype.clone = function () {
        return new Point(this.pt);
    };
    Point.prototype.collides = function (shape) {
        return testPointShape(this, shape);
    };
    Point.prototype.contains = function (point) {
        return this.pt.eq(point);
    };
    Point.prototype.raycast = function (origin, direction) {
        return null;
    };
    Point.prototype.random = function () {
        return this.pt.clone();
    };
    return Point;
}());
exports.Point = Point;
/**
 * @group Math
 */
var Line = /** @class */ (function () {
    function Line(p1, p2) {
        this.p1 = p1.clone();
        this.p2 = p2.clone();
    }
    Line.prototype.transform = function (m, s) {
        if (s && s instanceof Line) {
            m.transformPointV(this.p1, s.p1);
            m.transformPointV(this.p2, s.p2);
            return s;
        }
        return new Line(m.transformPointV(this.p1, vec2()), m.transformPointV(this.p2, vec2()));
    };
    Line.prototype.bbox = function () {
        return Rect.fromPoints(this.p1, this.p2);
    };
    Line.prototype.area = function () {
        return this.p1.dist(this.p2);
    };
    Line.prototype.clone = function () {
        return new Line(this.p1, this.p2);
    };
    Line.prototype.collides = function (shape) {
        return testLineShape(this, shape);
    };
    Line.prototype.contains = function (point) {
        return this.collides(point);
    };
    Line.prototype.raycast = function (origin, direction) {
        return raycastLine(origin, direction, this);
    };
    Line.prototype.random = function () {
        return this.p1.add(this.p2.sub(this.p1).scale(rand(1)));
    };
    return Line;
}());
exports.Line = Line;
// TODO: use x: number y: number (x, y, width, height)
/**
 * @group Math
 */
var Rect = /** @class */ (function () {
    function Rect(pos, width, height) {
        this.pos = pos.clone();
        this.width = width;
        this.height = height;
    }
    Rect.fromPoints = function (p1, p2) {
        return new Rect(p1.clone(), p2.x - p1.x, p2.y - p1.y);
    };
    Rect.prototype.center = function () {
        return new Vec2_1.Vec2(this.pos.x + this.width / 2, this.pos.y + this.height / 2);
    };
    Rect.prototype.points = function () {
        return [
            this.pos,
            this.pos.add(this.width, 0),
            this.pos.add(this.width, this.height),
            this.pos.add(0, this.height),
        ];
    };
    Rect.prototype.transform = function (m, s) {
        // TODO: resize existing pts array?
        var p = (s && s instanceof Polygon && s.pts.length == 4)
            ? s
            : new Polygon([new Vec2_1.Vec2(), new Vec2_1.Vec2(), new Vec2_1.Vec2(), new Vec2_1.Vec2()]);
        p.pts[0] = m.transformPointV(this.pos, p.pts[0]);
        p.pts[1] = m.transformPoint(this.pos.x + this.width, this.pos.y, p.pts[1]);
        p.pts[2] = m.transformPoint(this.pos.x + this.width, this.pos.y + this.height, p.pts[2]);
        p.pts[3] = m.transformPoint(this.pos.x, this.pos.y + this.height, p.pts[3]);
        return p;
    };
    Rect.prototype.bbox = function () {
        return this.clone();
    };
    Rect.prototype.area = function () {
        return this.width * this.height;
    };
    Rect.prototype.clone = function () {
        return new Rect(this.pos.clone(), this.width, this.height);
    };
    Rect.prototype.distToPoint = function (p) {
        return Math.sqrt(this.sdistToPoint(p));
    };
    Rect.prototype.sdistToPoint = function (p) {
        var min = this.pos;
        var max = this.pos.add(this.width, this.height);
        var dx = Math.max(min.x - p.x, 0, p.x - max.x);
        var dy = Math.max(min.y - p.y, 0, p.y - max.y);
        return dx * dx + dy * dy;
    };
    Rect.prototype.collides = function (shape) {
        return testRectShape(this, shape);
    };
    Rect.prototype.contains = function (point) {
        return this.collides(point);
    };
    Rect.prototype.raycast = function (origin, direction) {
        // Further type checking is needed here @mflerackers
        // @ts-ignore
        return raycastRect(origin, direction, this);
    };
    Rect.prototype.random = function () {
        return this.pos.add(rand(this.width), rand(this.height));
    };
    return Rect;
}());
exports.Rect = Rect;
/**
 * @group Math
 */
var Circle = /** @class */ (function () {
    function Circle(center, radius) {
        this.center = center.clone();
        this.radius = radius;
    }
    Circle.prototype.transform = function (tr, s) {
        return new Ellipse(this.center, this.radius, this.radius).transform(tr);
    };
    Circle.prototype.bbox = function () {
        return Rect.fromPoints(this.center.sub(vec2(this.radius)), this.center.add(vec2(this.radius)));
    };
    Circle.prototype.area = function () {
        return this.radius * this.radius * Math.PI;
    };
    Circle.prototype.clone = function () {
        return new Circle(this.center, this.radius);
    };
    Circle.prototype.collides = function (shape) {
        return testCircleShape(this, shape);
    };
    Circle.prototype.contains = function (point) {
        return this.collides(point);
    };
    Circle.prototype.raycast = function (origin, direction) {
        return raycastCircle(origin, direction, this);
    };
    Circle.prototype.random = function () {
        // TODO: Not uniform!!
        return this.center.add(Vec2_1.Vec2.fromAngle(rand(360)).scale(rand(this.radius)));
    };
    return Circle;
}());
exports.Circle = Circle;
/**
 * @group Math
 */
var Ellipse = /** @class */ (function () {
    function Ellipse(center, rx, ry, degrees) {
        if (degrees === void 0) { degrees = 0; }
        this.center = center.clone();
        this.radiusX = rx;
        this.radiusY = ry;
        this.angle = degrees;
    }
    Ellipse.fromMat2 = function (tr) {
        var inv = tr.inverse;
        var M = inv.transpose.mul(inv);
        var _a = M.eigenvalues, e1 = _a[0], e2 = _a[1];
        var _b = M.eigenvectors(e1, e2), v1 = _b[0], v2 = _b[1];
        var _c = [1 / Math.sqrt(e1), 1 / Math.sqrt(e2)], a = _c[0], b = _c[1];
        // Make sure we use the semi-major axis for the rotation
        if (a > b) {
            return new Ellipse(vec2(), a, b, rad2deg(Math.atan2(-v1[1], v1[0])));
        }
        else {
            return new Ellipse(vec2(), b, a, rad2deg(Math.atan2(-v2[1], v2[0])));
        }
    };
    Ellipse.prototype.toMat2 = function () {
        var a = deg2rad(this.angle);
        var c = Math.cos(a);
        var s = Math.sin(a);
        return new Mat2(c * this.radiusX, -s * this.radiusY, s * this.radiusX, c * this.radiusY);
    };
    Ellipse.prototype.transform = function (tr) {
        if (this.angle == 0 && tr.getRotation() == 0) {
            // No rotation, so we can just take the scale and translation
            return new Ellipse(tr.transformPointV(this.center, vec2()), tr.a * this.radiusX, tr.d * this.radiusY);
        }
        else {
            // Rotation. We can't just add angles, as the scale can squeeze the
            // ellipse and thus change the angle.
            // Get the transformation which maps the unit circle onto the ellipse
            var T = this.toMat2();
            // Transform the transformation matrix with the rotation+scale matrix
            var angle = tr.getRotation();
            var scale = tr.getScale();
            var M_1 = Mat3.fromMat2(T).scale(scale.x, scale.y).rotate(angle);
            T = M_1.toMat2();
            // Return the ellipse made from the transformed unit circle
            var ellipse = Ellipse.fromMat2(T);
            ellipse.center = tr.transformPointV(this.center, vec2());
            return ellipse;
        }
    };
    Ellipse.prototype.bbox = function () {
        if (this.angle == 0) {
            // No rotation, so the semi-major and semi-minor axis give the extends
            return Rect.fromPoints(this.center.sub(vec2(this.radiusX, this.radiusY)), this.center.add(vec2(this.radiusX, this.radiusY)));
        }
        else {
            // Rotation. We need to find the maximum x and y distance from the
            // center of the rotated ellipse
            var angle = deg2rad(this.angle);
            var c = Math.cos(angle);
            var s = Math.sin(angle);
            var ux = this.radiusX * c;
            var uy = this.radiusX * s;
            var vx = this.radiusY * s;
            var vy = this.radiusY * c;
            var halfwidth = Math.sqrt(ux * ux + vx * vx);
            var halfheight = Math.sqrt(uy * uy + vy * vy);
            return Rect.fromPoints(this.center.sub(vec2(halfwidth, halfheight)), this.center.add(vec2(halfwidth, halfheight)));
        }
    };
    Ellipse.prototype.area = function () {
        return this.radiusX * this.radiusY * Math.PI;
    };
    Ellipse.prototype.clone = function () {
        return new Ellipse(this.center, this.radiusX, this.radiusY, this.angle);
    };
    Ellipse.prototype.collides = function (shape) {
        return testEllipseShape(this, shape);
    };
    Ellipse.prototype.contains = function (point) {
        // Both methods work, but the second one is faster
        /*let T = this.toTransform()
        point = point.sub(this.center)
        point = T.inverse.transform(point)
        return testCirclePoint(new Circle(vec2(), 1), point)*/
        point = point.sub(this.center);
        var angle = deg2rad(this.angle);
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var vx = point.x * c + point.y * s;
        var vy = -point.x * s + point.y * c;
        return vx * vx / (this.radiusX * this.radiusX)
            + vy * vy / (this.radiusY * this.radiusY) < 1;
    };
    Ellipse.prototype.raycast = function (origin, direction) {
        return raycastEllipse(origin, direction, this);
    };
    Ellipse.prototype.random = function () {
        return this.center;
    };
    return Ellipse;
}());
exports.Ellipse = Ellipse;
function segmentLineIntersection(a, b, c, d) {
    var ab = b.sub(a);
    var cd = d.sub(c);
    var s = ab.cross(cd);
    if (s < 0.00001 && s > -0.00001)
        return null;
    var ac = c.sub(a);
    s = ac.cross(cd) / s;
    if (s < 0 || s > 1)
        return null;
    return a.add(ab.scale(s));
}
/**
 * @group Math
 */
var Polygon = /** @class */ (function () {
    function Polygon(pts) {
        if (pts.length < 3) {
            throw new Error("Polygons should have at least 3 vertices");
        }
        this.pts = pts;
    }
    Polygon.prototype.transform = function (m, s) {
        // TODO: resize existing pts array?
        if (s && s instanceof Polygon && s.pts.length == this.pts.length) {
            for (var i = 0; i < this.pts.length; i++) {
                m.transformPointV(this.pts[i], s.pts[i]);
            }
            return s;
        }
        return new Polygon(this.pts.map(function (pt) { return m.transformPointV(pt, vec2()); }));
    };
    Polygon.prototype.bbox = function () {
        var p1 = vec2(Number.MAX_VALUE);
        var p2 = vec2(-Number.MAX_VALUE);
        for (var _i = 0, _a = this.pts; _i < _a.length; _i++) {
            var pt = _a[_i];
            p1.x = Math.min(p1.x, pt.x);
            p2.x = Math.max(p2.x, pt.x);
            p1.y = Math.min(p1.y, pt.y);
            p2.y = Math.max(p2.y, pt.y);
        }
        return Rect.fromPoints(p1, p2);
    };
    Polygon.prototype.area = function () {
        var total = 0;
        var l = this.pts.length;
        for (var i = 0; i < l; i++) {
            var p1 = this.pts[i];
            var p2 = this.pts[(i + 1) % l];
            total += p1.x * p2.y * 0.5;
            total -= p2.x * p1.y * 0.5;
        }
        return Math.abs(total);
    };
    Polygon.prototype.clone = function () {
        return new Polygon(this.pts.map(function (pt) { return pt.clone(); }));
    };
    Polygon.prototype.collides = function (shape) {
        return testPolygonShape(this, shape);
    };
    Polygon.prototype.contains = function (point) {
        return this.collides(point);
    };
    Polygon.prototype.raycast = function (origin, direction) {
        return raycastPolygon(origin, direction, this);
    };
    Polygon.prototype.random = function () {
        /**
         * TODO:
         * - cut into triangles
         * - choose a random triangle with probability linked to surface area
         * - choose a random point in the triangle
         */
        return vec2();
    };
    Polygon.prototype.cut = function (a, b, srcUv, dstUv) {
        var surfaceLine = new Line(a, b);
        var left = [];
        var right = [];
        var ab = b.sub(a);
        var prev = this.pts[this.pts.length - 1];
        var ap = prev.sub(a);
        var wasLeft = ab.cross(ap) > 0;
        this.pts.forEach(function (p, index) {
            ap = p.sub(a);
            var isLeft = ab.cross(ap) > 0;
            if (wasLeft != isLeft) {
                // Since the points are on opposite sides of the line, we know they intersect
                var intersection = segmentLineIntersection(prev, p, a, b);
                left.push(intersection);
                right.push(intersection);
                if (srcUv && dstUv) {
                    var uv1 = srcUv[index === 0 ? srcUv.length - 1 : index - 1];
                    var uv2 = srcUv[index];
                    var ab_1 = p.sub(prev);
                    var ac = intersection.sub(prev);
                    var alpha = ac.dot(ab_1) / ab_1.dot(ab_1);
                    var uv = (0, lerp_1.lerp)(uv1, uv2, alpha);
                    dstUv[0].push(uv);
                    dstUv[1].push(uv);
                }
                wasLeft = isLeft;
            }
            (isLeft ? left : right).push(p);
            if (srcUv && dstUv) {
                (isLeft ? dstUv[0] : dstUv[1]).push(srcUv[index]);
            }
            prev = p;
        });
        return [
            left.length ? new Polygon(left) : null,
            right.length ? new Polygon(right) : null,
        ];
    };
    return Polygon;
}());
exports.Polygon = Polygon;
function evaluateQuadratic(pt1, pt2, pt3, t) {
    var t2 = t * t;
    var mt = 1 - t;
    var mt2 = mt * mt;
    return pt1.scale(mt2).add(pt2.scale(2 * mt * t)).add(pt3.scale(t2));
}
function evaluateQuadraticFirstDerivative(pt1, pt2, pt3, t) {
    var mt = 1 - t;
    return pt2.sub(pt1).scale(2 * mt).add(pt3.sub(pt2).scale(2 * t));
}
function evaluateQuadraticSecondDerivative(pt1, pt2, pt3, t) {
    return pt3.sub(pt2.scale(2)).add(pt1).scale(2);
}
function evaluateBezier(pt1, pt2, pt3, pt4, t) {
    var t2 = t * t;
    var t3 = t2 * t;
    var mt = 1 - t;
    var mt2 = mt * mt;
    var mt3 = mt2 * mt;
    return pt1.scale(mt3).add(pt2.scale(3 * mt2 * t)).add(pt3.scale(3 * mt * t2)).add(pt4.scale(t3));
}
function evaluateBezierFirstDerivative(pt1, pt2, pt3, pt4, t) {
    var t2 = t * t;
    var mt = 1 - t;
    var mt2 = mt * mt;
    return pt2.sub(pt1).scale(3 * mt2).add(pt3.sub(pt2).scale(6 * mt * t)).add(pt4.sub(pt3).scale(3 * t2));
}
function evaluateBezierSecondDerivative(pt1, pt2, pt3, pt4, t) {
    var mt = 1 - t;
    return pt3.sub(pt2.scale(2)).add(pt1).scale(6 * mt).add(pt4.sub(pt3.scale(2)).add(pt2).scale(6 * t));
}
function evaluateCatmullRom(pt1, pt2, pt3, pt4, t) {
    var A = 0.5 * (((-t + 2) * t - 1) * t);
    var B = 0.5 * (((3 * t - 5) * t) * t + 2);
    var C = 0.5 * (((-3 * t + 4) * t + 1) * t);
    var D = 0.5 * (((t - 1) * t) * t);
    return pt1.scale(A).add(pt2.scale(B)).add(pt3.scale(C)).add(pt4.scale(D));
}
function evaluateCatmullRomFirstDerivative(pt1, pt2, pt3, pt4, t) {
    var A = 0.5 * ((-3 * t + 4) * t - 1);
    var B = 0.5 * ((9 * t - 10) * t);
    var C = 0.5 * ((-9 * t + 8) * t + 1);
    var D = 0.5 * ((3 * t - 2) * t);
    return pt1.scale(A).add(pt2.scale(B)).add(pt3.scale(C)).add(pt4.scale(D));
}
function normalizedCurve(curve) {
    var curveLength = curveLengthApproximation(curve);
    var length = curveLength(1);
    return function (s) {
        var l = s * length;
        var t = curveLength(l, true);
        return curve(t);
    };
}
function curveLengthApproximation(curve, entries, detail) {
    if (entries === void 0) { entries = 10; }
    if (detail === void 0) { detail = 10; }
    var llut = [0];
    var tlut = [0];
    var dt = 1 / (entries - 1);
    var ddt = dt / detail;
    var length = 0;
    var pp = curve(0);
    var t = 0;
    for (var e = 1; e < entries; e++) {
        for (var d = 0; d < detail; d++) {
            t += ddt;
            var p = curve(t);
            var l = p.dist(pp);
            length += l;
            pp = p;
        }
        llut[e] = length;
        tlut[e] = t;
    }
    tlut[entries - 1] = 1;
    return function (t, inverse) {
        if (inverse === void 0) { inverse = false; }
        if (inverse) {
            var l = t;
            if (l <= 0)
                return 0;
            if (l >= length)
                return 1;
            var index = 0;
            while (llut[index + 1] < l)
                index++;
            var t1 = tlut[index];
            var t2 = tlut[index + 1];
            var l1 = llut[index];
            var l2 = llut[index + 1];
            var a = (l - l1) / (l2 - l1);
            return t1 + (t2 - t1) * a;
        }
        else {
            if (t <= 0)
                return 0;
            if (t >= 1)
                return llut[entries - 1];
            var index = 0;
            while (tlut[index + 1] < t)
                index++;
            var t1 = tlut[index];
            var t2 = tlut[index + 1];
            var l1 = llut[index];
            var l2 = llut[index + 1];
            var a = (t - t1) / (t2 - t1);
            return l1 + (l2 - l1) * a;
        }
    };
}
/**
 * A second order function returning an evaluator for the given 1D Hermite curve
 * @param pt1 - First point
 * @param m1 - First control point (tangent)
 * @param m2 - Second control point (tangent)
 * @param pt2 - Second point
 *
 * @returns A function which gives the value on the 1D Hermite curve at t
 */
function hermite(pt1, m1, m2, pt2) {
    var A = 2 * pt1 + m1 - 2 * pt2 + m2;
    var B = -3 * pt1 + 3 * pt2 - 2 * m1 - m2;
    var C = m1;
    var D = pt1;
    return function (t) {
        var t2 = t * t;
        var t3 = t2 * t;
        return A * t3 + B * t2 + C * t + D;
    };
}
/**
 * A second order function returning an evaluator for the given 2D Cardinal curve
 * @param pt1 - Previous point
 * @param pt2 - First point
 * @param pt3 - Second point
 * @param pt4 - Next point
 * @param tension - The tension of the curve, [0..1] from round to tight.
 * @param h - The hermite function or one of its derivatives.
 *
 * @returns A function which gives the value on the 2D Cardinal curve at t
 */
function cardinal(pt1, pt2, pt3, pt4, tension, h) {
    if (h === void 0) { h = hermite; }
    var hx = h(pt2.x, (1 - tension) * (pt3.x - pt1.x), (1 - tension) * (pt4.x - pt2.x), pt3.x);
    var hy = h(pt2.y, (1 - tension) * (pt3.y - pt1.y), (1 - tension) * (pt4.y - pt2.y), pt3.y);
    return function (t) {
        return new Vec2_1.Vec2(hx(t), hy(t));
    };
}
/**
 * A second order function returning an evaluator for the given 2D Catmull-Rom curve
 * @param pt1 - Previous point
 * @param pt2 - First point
 * @param pt3 - Second point
 * @param pt4 - Next point
 *
 * @returns A function which gives the value on the 2D Catmull-Rom curve at t
 */
function catmullRom(pt1, pt2, pt3, pt4, h) {
    if (h === void 0) { h = hermite; }
    // A Catmull-Rom curve is a Cardinal curve with as tension 0.5
    return cardinal(pt1, pt2, pt3, pt4, 0.5, h);
}
/**
 * A second order function returning an evaluator for the given 2D quadratic Bezier curve
 * @param pt1 - First point
 * @param pt2 - First control point
 * @param pt3 - Second control point
 * @param pt4 - Second point
 *
 * @returns A function which gives the value on the 2D quadratic Bezier curve at t
 */
function bezier(pt1, pt2, pt3, pt4, h) {
    if (h === void 0) { h = hermite; }
    // Convert the Bezier to a Catmull-Rom curve
    return catmullRom(pt4.add(pt1.sub(pt2).scale(6)), pt1, pt4, pt1.add(pt4.sub(pt3).scale(6)), h);
}
/**
 * A second order function returning an evaluator for the given 2D Kochanek–Bartels curve
 * @param pt1 - Previous point
 * @param pt2 - First point
 * @param pt3 - Second point
 * @param pt4 - Next point
 * @param tension - The tension of the curve, [-1..1] from round to tight.
 * @param continuity - The continuity of the curve, [-1..1] from box corners to inverted corners.
 * @param bias - The bias of the curve, [-1..1] from pre-shoot to post-shoot.
 *
 * @returns A function which gives the value on the 2D Kochanek–Bartels curve at t
 */
function kochanekBartels(pt1, pt2, pt3, pt4, tension, continuity, bias, h) {
    if (h === void 0) { h = hermite; }
    var hx = h(pt2.x, 0.5 * (1 - tension) * (1 + bias) * (1 + continuity) * (pt2.x - pt1.x)
        + 0.5 * (1 - tension) * (1 - bias) * (1 - continuity)
            * (pt3.x - pt2.x), 0.5 * (1 - tension) * (1 + bias) * (1 - continuity) * (pt3.x - pt2.x)
        + 0.5 * (1 - tension) * (1 - bias) * (1 + continuity)
            * (pt4.x - pt3.x), pt3.x);
    var hy = h(pt2.y, 0.5 * (1 - tension) * (1 + bias) * (1 + continuity) * (pt2.y - pt1.y)
        + 0.5 * (1 - tension) * (1 - bias) * (1 - continuity)
            * (pt3.y - pt2.y), 0.5 * (1 - tension) * (1 + bias) * (1 - continuity) * (pt3.y - pt2.y)
        + 0.5 * (1 - tension) * (1 - bias) * (1 + continuity)
            * (pt4.y - pt3.y), pt3.y);
    return function (t) {
        return new Vec2_1.Vec2(hx(t), hy(t));
    };
}
/**
 * A second order function returning an evaluator for the derivative of the given 1D Hermite curve
 * @param pt1 - First point
 * @param m1 - First control point (tangent)
 * @param m2 - Second control point (tangent)
 * @param pt2 - Second point
 *
 * @returns A function which gives the first derivative on the 1D Hermite curve at t
 */
function hermiteFirstDerivative(pt1, m1, m2, pt2) {
    var A = 2 * pt1 + m1 - 2 * pt2 + m2;
    var B = -3 * pt1 + 3 * pt2 - 2 * m1 + m2;
    var C = m1;
    return function (t) {
        var t2 = t * t;
        return 3 * A * t2 + 2 * B * t + C;
    };
}
// True if t is between 0 and 1
function inZeroOneDomain(t) {
    return 0 <= t && t <= 1;
}
// True if a and b are almost equal
function approximately(a, b) {
    return Math.abs(a - b) <= Number.EPSILON;
}
// Calculates the cube root ∛ of the given number
function cubeRoot(v) {
    if (v < 0) {
        return -Math.pow(-v, 1 / 3);
    }
    else {
        return Math.pow(v, 1 / 3);
    }
}
// Get all cubic roots of the given 1 dimensional bezier
function getCubicRoots(pa, pb, pc, pd) {
    var a = 3 * pa - 6 * pb + 3 * pc;
    var b = -3 * pa + 3 * pb;
    var c = pa;
    var d = -pa + 3 * pb - 3 * pc + pd;
    if (approximately(d, 0)) {
        if (approximately(a, 0)) {
            if (approximately(b, 0)) {
                return [];
            }
            return [-c / b].filter(inZeroOneDomain);
        }
        var q_1 = Math.sqrt(b * b - 4 * a * c);
        var a2 = 2 * a;
        return [(q_1 - b) / a2, (-b - q_1) / a2].filter(inZeroOneDomain);
    }
    a /= d;
    b /= d;
    c /= d;
    var p = (3 * b - a * a) / 3;
    var p3 = p / 3;
    var q = (2 * a * a * a - 9 * a * b + 27 * c) / 27;
    var q2 = q / 2;
    var discriminant = q2 * q2 + p3 * p3 * p3;
    if (discriminant < 0) {
        var mp3 = -p / 3;
        var mp33 = mp3 * mp3 * mp3;
        var r = Math.sqrt(mp33);
        var t = -q / (2 * r);
        var cosphi = t < -1 ? -1 : t > 1 ? 1 : t;
        var phi = Math.acos(cosphi);
        var crtr = cubeRoot(r);
        var t1 = 2 * crtr;
        var root1_1 = t1 * Math.cos(phi / 3) - a / 3;
        var root2 = t1 * Math.cos((phi + 2 * Math.PI) / 3) - a / 3;
        var root3 = t1 * Math.cos((phi + 4 * Math.PI) / 3) - a / 3;
        return [root1_1, root2, root3].filter(inZeroOneDomain);
    }
    if (discriminant === 0) {
        var u1_1 = q2 < 0 ? cubeRoot(-q2) : -cubeRoot(q2);
        var root1_2 = 2 * u1_1 - a / 3;
        var root2 = -u1_1 - a / 3;
        return [root1_2, root2].filter(inZeroOneDomain);
    }
    var sd = Math.sqrt(discriminant);
    var u1 = cubeRoot(sd - q2);
    var v1 = cubeRoot(sd + q2);
    var root1 = u1 - v1 - a / 3;
    return [root1].filter(inZeroOneDomain);
}
// Returns y for the given x on the cubic bezier by first calculating the t for the given x, then calculating y from t
function cubicBezierYforX(a, b, c, d, x) {
    // Get t for x
    var t = getCubicRoots(a.x - x, b.x - x, c.x - x, d.x - x);
    if (t.length > 0) {
        // Get y for t
        return evaluateBezier(a, b, c, d, t[0]).y;
    }
    return NaN;
}
function easingLinear(keys) {
    if (!keys || keys.length == 0) {
        throw new Error("Need at least one point for easingLinear.");
    }
    var len = keys.length;
    return function (x) {
        // Before start
        if (x <= 0 || keys.length == 1 || x <= keys[0].x) {
            return keys[0].y;
        }
        for (var i = 0; i < len; i++) {
            if (keys[i].x >= x) {
                // Linear map
                return map(x, keys[i - 1].x, keys[i].x, keys[i - 1].y, keys[i].y);
            }
        }
        // After end
        return keys[keys.length - 1].y;
    };
}
function easingCubicBezier(p1, p2) {
    return function (x) {
        return cubicBezierYforX(vec2(0, 0), p1, p2, vec2(1, 1), x);
    };
}
function easingSteps(steps, position) {
    if (position === void 0) { position = "jump-end"; }
    var xdist = 1 / steps;
    var jumpStart = position == "jump-start" || position == "jump-both";
    var jumpEnd = position == "jump-end" || position == "jump-both";
    var ydist = 1 / (steps + (jumpEnd ? 1 : 0));
    var startY = jumpStart ? ydist : 0;
    return function (x) {
        var step = Math.floor(x / xdist);
        return startY + step * ydist;
    };
}
// true if the angle is oriented counter clockwise
function isOrientedCcw(a, b, c) {
    // return det(b-a, c-a) >= 0
    return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) >= 0;
}
// true if the polygon is oriented counter clockwise
function isOrientedCcwPolygon(polygon) {
    var total = 0;
    var prev = polygon[polygon.length - 1];
    for (var i = 0; i < polygon.length; i++) {
        total += (polygon[i].x - prev.x) * (polygon[i].y + prev.y);
        prev = polygon[i];
    }
    return total < 0;
}
// true if a and b are on the same side of the line c->d
function onSameSide(a, b, c, d) {
    var px = d.x - c.x, py = d.y - c.y;
    // return det(p, a-c) * det(p, b-c) >= 0
    var l = px * (a.y - c.y) - py * (a.x - c.x);
    var m = px * (b.y - c.y) - py * (b.x - c.x);
    return l * m >= 0;
}
// true if p is contained in the triangle abc
function pointInTriangle(p, a, b, c) {
    return onSameSide(p, a, b, c) && onSameSide(p, b, a, c)
        && onSameSide(p, c, a, b);
}
// true if any vertex in the list `vertices' is in the triangle abc.
function someInTriangle(vertices, a, b, c) {
    for (var _i = 0, vertices_1 = vertices; _i < vertices_1.length; _i++) {
        var p = vertices_1[_i];
        if ((p !== a) && (p !== b) && (p !== c) && pointInTriangle(p, a, b, c)) {
            return true;
        }
    }
    return false;
}
// true if the triangle is an ear, which is whether it can be cut off from the polygon without leaving a hole behind
function isEar(a, b, c, vertices) {
    return isOrientedCcw(a, b, c) && !someInTriangle(vertices, a, b, c);
}
function triangulate(pts) {
    var _a;
    if (pts.length < 3) {
        return [];
    }
    if (pts.length == 3) {
        return [pts];
    }
    /* Create a list of indexes to the previous and next points of a given point
    prev_idx[i] gives the index to the previous point of the point at i */
    var nextIdx = [];
    var prevIdx = [];
    var idx = 0;
    for (var i = 0; i < pts.length; i++) {
        var lm = pts[idx];
        var pt = pts[i];
        if (pt.x < lm.x || (pt.x == lm.x && pt.y < lm.y)) {
            idx = idx;
        }
        nextIdx[i] = i + 1;
        prevIdx[i] = i - 1;
    }
    nextIdx[nextIdx.length - 1] = 0;
    prevIdx[0] = prevIdx.length - 1;
    // If the polygon is not counter clockwise, swap the lists, thus reversing the winding
    if (!isOrientedCcwPolygon(pts)) {
        _a = [prevIdx, nextIdx], nextIdx = _a[0], prevIdx = _a[1];
    }
    var concaveVertices = [];
    for (var i = 0; i < pts.length; ++i) {
        if (!isOrientedCcw(pts[prevIdx[i]], pts[i], pts[nextIdx[i]])) {
            concaveVertices.push(pts[i]);
        }
    }
    var triangles = [];
    var nVertices = pts.length;
    var current = 1;
    var skipped = 0;
    var next;
    var prev;
    while (nVertices > 3) {
        next = nextIdx[current];
        prev = prevIdx[current];
        var a = pts[prev];
        var b = pts[current];
        var c = pts[next];
        if (isEar(a, b, c, concaveVertices)) {
            triangles.push([a, b, c]);
            nextIdx[prev] = next;
            prevIdx[next] = prev;
            concaveVertices.splice(concaveVertices.indexOf(b), 1);
            --nVertices;
            skipped = 0;
        }
        else if (++skipped > nVertices) {
            return [];
        }
        current = next;
    }
    next = nextIdx[current];
    prev = prevIdx[current];
    triangles.push([pts[prev], pts[current], pts[next]]);
    return triangles;
}
function isConvex(pts) {
    if (pts.length < 3) {
        return false;
    }
    // a polygon is convex if all corners turn in the same direction
    // turning direction can be determined using the cross-product of
    // the forward difference vectors
    var i = pts.length - 2;
    var j = pts.length - 1;
    var k = 0;
    var p = pts[j].sub(pts[i]);
    var q = pts[k].sub(pts[j]);
    var winding = p.cross(q);
    while (k + 1 < pts.length) {
        i = j;
        j = k;
        k++;
        p = pts[j].sub(pts[i]);
        q = pts[k].sub(pts[j]);
        if (p.cross(q) * winding < 0) {
            return false;
        }
    }
    return true;
}

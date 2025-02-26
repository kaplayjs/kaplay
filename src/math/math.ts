import type { GameObj, LerpValue, RNGValue } from "../types";
import { Color, rgb } from "./color";

/**
 * Possible arguments for a Vec2.
 *
 * @group Math
 */
export type Vec2Args =
    | [number, number]
    | [number]
    | [Vec2]
    | [number | Vec2]
    | [];

export function deg2rad(deg: number): number {
    return deg * Math.PI / 180;
}

export function rad2deg(rad: number): number {
    return rad * 180 / Math.PI;
}

export function clamp(
    val: number,
    min: number,
    max: number,
): number {
    if (min > max) {
        return clamp(val, max, min);
    }
    return Math.min(Math.max(val, min), max);
}

export function lerp<V extends LerpValue>(
    a: V,
    b: V,
    t: number,
): V {
    if (typeof a === "number" && typeof b === "number") {
        return a + (b - a) * t as V;
    }
    else if (a instanceof Vec2 && b instanceof Vec2) {
        return a.lerp(b, t) as V;
    }
    else if (a instanceof Color && b instanceof Color) {
        return a.lerp(b, t) as V;
    }
    throw new Error(
        `Bad value for lerp(): ${a}, ${b}. Only number, Vec2 and Color is supported.`,
    );
}

export function map(
    v: number,
    l1: number,
    h1: number,
    l2: number,
    h2: number,
): number {
    return l2 + (v - l1) / (h1 - l1) * (h2 - l2);
}

export function mapc(
    v: number,
    l1: number,
    h1: number,
    l2: number,
    h2: number,
): number {
    return clamp(map(v, l1, h1, l2, h2), l2, h2);
}

export function step(edge: number, x: number) {
    return x < edge ? 0 : 1;
}

export function smoothstep(edge0: number, edge1: number, x: number) {
    x = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return x * x * (3.0 - 2.0 * x);
}

/**
 * A 2D vector.
 *
 * @group Math
 */
export class Vec2 {
    /** The x coordinate */
    x: number = 0;
    /** The y coordinate */
    y: number = 0;

    constructor(x: number = 0, y: number = x) {
        this.x = x;
        this.y = y;
    }

    /** Create a new Vec2 from an angle in degrees */
    static fromAngle(deg: number) {
        const angle = deg2rad(deg);
        return new Vec2(Math.cos(angle), Math.sin(angle));
    }

    /** Create a new Vec2 from an array */
    static fromArray(arr: Array<number>) {
        return new Vec2(arr[0], arr[1]);
    }

    /** An empty vector. (0, 0) */
    static ZERO = new Vec2(0, 0);
    /** A vector with both components of 1. (1, 1) */
    static ONE = new Vec2(1, 1);
    /** A vector signaling to the left. (-1, 0) */
    static LEFT = new Vec2(-1, 0);
    /** A vector signaling to the right. (1, 0) */
    static RIGHT = new Vec2(1, 0);
    /** A vector signaling up. (0, -1) */
    static UP = new Vec2(0, -1);
    /** A vector signaling down. (0, 1) */
    static DOWN = new Vec2(0, 1);

    /** Closest orthogonal direction: LEFT, RIGHT, UP, or DOWN */
    toAxis(): Vec2 {
        return Math.abs(this.x) > Math.abs(this.y)
            ? this.x < 0 ? Vec2.LEFT : Vec2.RIGHT
            : this.y < 0
                ? Vec2.UP
                : Vec2.DOWN;
    }

    /** Clone the vector */
    clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    static copy(v: Vec2, out: Vec2): Vec2 {
        out.x = v.x;
        out.y = v.y;
        return out;
    }

    /** Returns the sum with another vector. */
    add(...args: Vec2Args): Vec2 {
        const p2 = vec2(...args);
        return new Vec2(this.x + p2.x, this.y + p2.y);
    }

    static addScaled(v: Vec2, other: Vec2, s: number, out: Vec2): Vec2 {
        out.x = v.x + other.x * s;
        out.y = v.y + other.y * s;
        return out;
    }

    /**
     * Calculates the sum of the vectors
     * @param v The first term
     * @param x The x of the second term
     * @param y The y of the second term
     * @param out The vector sum
     * @returns The sum of the vectors
     */
    static addc(v: Vec2, x: number, y: number, out: Vec2): Vec2 {
        out.x = v.x + x;
        out.y = v.y + y;
        return out;
    }

    /**
     * Calculates the sum of the vectors
     * @param v The first term
     * @param other The second term
     * @param out The vector sum
     * @returns The sum of the vectors
     */
    static add(v: Vec2, other: Vec2, out: Vec2): Vec2 {
        out.x = v.x + other.x;
        out.y = v.y + other.y;
        return out;
    }

    /** Returns the difference with another vector. */
    sub(...args: Vec2Args): Vec2 {
        const p2 = vec2(...args);
        return new Vec2(this.x - p2.x, this.y - p2.y);
    }

    /**
     * Calculates the difference of the vectors
     * @param v The first term
     * @param x The x of the second term
     * @param y The y of the second term
     * @param out The vector difference
     * @returns The difference of the vectors
     */
    static subc(v: Vec2, x: number, y: number, out: Vec2): Vec2 {
        out.x = v.x - x;
        out.y = v.y - y;
        return out;
    }

    /**
     * Calculates the difference of the vectors
     * @param v The first term
     * @param other The second term
     * @param out The vector difference
     * @returns The difference of the vectors
     */
    static sub(v: Vec2, other: Vec2, out: Vec2): Vec2 {
        out.x = v.x - other.x;
        out.y = v.y - other.y;
        return out;
    }

    /** Scale by another vector. or a single number */
    scale(...args: Vec2Args): Vec2 {
        const s = vec2(...args);
        return new Vec2(this.x * s.x, this.y * s.y);
    }

    /**
     * Calculates the scale of the vector
     * @param v The vector
     * @param x The x scale
     * @param y The y scale
     * @param out The scaled vector
     * @returns The scale of the vector
     */
    static scale(v: Vec2, s: number, out: Vec2): Vec2 {
        out.x = v.x * s;
        out.y = v.y * s;
        return out;
    }

    /**
     * Calculates the scale of the vector
     * @param v The vector
     * @param x The x scale
     * @param y The y scale
     * @param out The scaled vector
     * @returns The scale of the vector
     */
    static scalec(v: Vec2, x: number, y: number, out: Vec2): Vec2 {
        out.x = v.x * x;
        out.y = v.y * y;
        return out;
    }

    /**
     * Calculates the scale of the vector
     * @param v The vector
     * @param other The scale
     * @param out The scaled vector
     * @returns The scale of the vector
     */
    static scalev(v: Vec2, other: Vec2, out: Vec2): Vec2 {
        out.x = v.x * other.x;
        out.y = v.y * other.y;
        return out;
    }

    /** Scale by the inverse of another vector. or a single number */
    invScale(...args: Vec2Args): Vec2 {
        const s = vec2(...args);
        return new Vec2(this.x / s.x, this.y / s.y);
    }

    /** Get distance between another vector */
    dist(...args: Vec2Args): number {
        const p2 = vec2(...args);
        return this.sub(p2).len();
    }

    /**
     * Calculates the distance between the vectors
     * @param v The vector
     * @param other The other vector
     * @returns The between the vectors
     */
    static dist(v: Vec2, other: Vec2): number {
        const x = v.x - other.x;
        const y = v.y - other.y;
        return Math.sqrt(x * x + y * y);
    }

    /** Get squared distance between another vector */
    sdist(...args: Vec2Args): number {
        const p2 = vec2(...args);
        return this.sub(p2).slen();
    }

    /**
     * Calculates the squared distance between the vectors
     * @param v The vector
     * @param other The other vector
     * @returns The distance between the vectors
     */
    static sdist(v: Vec2, other: Vec2): number {
        const x = v.x - other.x;
        const y = v.y - other.y;
        return x * x + y * y;
    }

    /**
     * Get length of the vector
     *
     * @since v3000.0
     */
    len(): number {
        return Math.sqrt(this.dot(this));
    }

    /**
     * Calculates the length of the vector
     * @param v The vector
     * @returns The length of the vector
     */
    static len(v: Vec2) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    /**
     * Get squared length of the vector
     *
     * @since v3000.0
     */
    slen(): number {
        return this.dot(this);
    }

    /**
     * Calculates the squared length of the vector
     * @param v The vector
     * @returns The squared length of the vector
     */
    static slen(v: Vec2) {
        return v.x * v.x + v.y * v.y;
    }

    /**
     * Get the unit vector (length of 1).
     */
    unit(): Vec2 {
        const len = this.len();
        return len === 0 ? new Vec2(0) : this.scale(1 / len);
    }

    static unit(v: Vec2, out: Vec2): Vec2 {
        const len = Vec2.len(v);
        out.x = v.x / len;
        out.y = v.y / len;
        return out;
    }

    /**
     * Get the perpendicular vector.
     */
    normal(): Vec2 {
        return new Vec2(this.y, -this.x);
    }

    static normal(v: Vec2, out: Vec2): Vec2 {
        out.x = v.y;
        out.y = -v.x;
        return out;
    }

    /**
     * Get the reflection of a vector with a normal.
     *
     * @since v3000.0
     */
    reflect(normal: Vec2) {
        return this.sub(normal.scale(2 * this.dot(normal)));
    }

    /**
     * Get the projection of a vector onto another vector.
     *
     * @since v3000.0
     */
    project(on: Vec2) {
        return on.scale(on.dot(this) / on.len());
    }

    /**
     * Get the rejection of a vector onto another vector.
     *
     * @since v3000.0
     */
    reject(on: Vec2) {
        return this.sub(this.project(on));
    }

    rotate(vecOrAngle: Vec2 | number) {
        if (vecOrAngle instanceof Vec2) {
            return new Vec2(
                this.x * vecOrAngle.x - this.y * vecOrAngle.y,
                this.x * vecOrAngle.y + this.y * vecOrAngle.x,
            );
        }
        else {
            const angle = deg2rad(vecOrAngle);
            const c = Math.cos(angle);
            const s = Math.sin(angle);
            return new Vec2(
                this.x * c - this.y * s,
                this.x * s + this.y * c,
            );
        }
    }

    /**
     * Calculates the rotated vector
     * @param v The vector
     * @param dir The rotation vector
     * @param out The rotated vector
     * @returns The rotated vector
     */
    static rotate(v: Vec2, dir: Vec2, out: Vec2): Vec2 {
        const tmp = v.x;
        out.x = v.x * dir.x - v.y * dir.y;
        out.y = tmp * dir.y + v.y * dir.x;
        return out;
    }

    /**
     * Calculates the rotated vector
     * @param v The vector
     * @param angle The angle in radians
     * @param out The rotated vector
     * @returns The rotated vector
     */
    static rotateByAngle(v: Vec2, angle: number, out: Vec2): Vec2 {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const tmp = v.x;
        out.x = v.x * c - v.y * s;
        out.y = tmp * s + v.y * c;
        return out;
    }

    invRotate(vecOrAngle: Vec2 | number) {
        if (vecOrAngle instanceof Vec2) {
            return this.rotate(new Vec2(vecOrAngle.x, -vecOrAngle.y));
        }
        else {
            return this.rotate(-vecOrAngle);
        }
    }

    /**
     * Calculates the inverse rotated vector
     * @param v The vector
     * @param dir The rotation vector
     * @param out The rotated vector
     * @returns The rotated vector
     */
    static inverseRotate(v: Vec2, dir: Vec2, out: Vec2): Vec2 {
        const tmp = v.x;
        out.x = v.x * dir.x + v.y * dir.y;
        out.y = -tmp * dir.y + v.y * dir.x;
        return out;
    }

    /**
     * Get the dot product with another vector.
     */
    dot(p2: Vec2): number {
        return this.x * p2.x + this.y * p2.y;
    }

    /**
     * Get the dot product between 2 vectors.
     *
     * @since v3000.0
     */
    static dot(v: Vec2, other: Vec2): number {
        return v.x * v.x + v.y * v.y;
    }

    /**
     * Get the cross product with another vector.
     *
     * @since v3000.0
     */
    cross(p2: Vec2): number {
        return this.x * p2.y - this.y * p2.x;
    }

    /**
     * Get the cross product between 2 vectors.
     *
     * @since v3000.0
     */
    static cross(v: Vec2, other: Vec2): number {
        return v.x * other.y - v.y * other.x;
    }

    /**
     * Get the angle of the vector in degrees.
     */
    angle(...args: Vec2Args): number {
        const p2 = vec2(...args);
        return rad2deg(Math.atan2(this.y - p2.y, this.x - p2.x));
    }

    /**
     * Calculates the angle represented by the vector in radians
     * @param v The vector
     * @returns Angle represented by the vector in radians
     */
    static toAngle(v: Vec2) {
        return Math.atan2(v.y, v.x);
    }

    /**
     * Get the angle between this vector and another vector.
     *
     * @since v3000.0
     */
    angleBetween(...args: Vec2Args): number {
        const p2 = vec2(...args);
        return rad2deg(Math.atan2(this.cross(p2), this.dot(p2)));
    }

    /**
     * Calculates the angle between the vectors in radians
     * @param v First vector
     * @param other Second vector
     * @returns Angle between the vectors in radians
     */
    static angleBetween(v: Vec2, other: Vec2) {
        return Math.atan2(Vec2.cross(v, other), Vec2.dot(v, other));
    }

    /**
     * Linear interpolate to a destination vector (for positions).
     */
    lerp(dest: Vec2, t: number): Vec2 {
        return new Vec2(lerp(this.x, dest.x, t), lerp(this.y, dest.y, t));
    }

    /**
     * Linear interpolate src and dst by t
     * @param src First vector
     * @param dst Second vector
     * @param t Percentage
     * @param out The linear interpolation between src and dst by t
     * @returns The linear interpolation between src and dst by t
     */
    static lerp(src: Vec2, dst: Vec2, t: number, out: Vec2): Vec2 {
        out.x = src.x * (dst.x - src.x) * t;
        out.y = src.y * (dst.y - src.y) * t;
        return out;
    }

    /**
     * Spherical linear interpolate to a destination vector (for rotations).
     *
     * @since v3000.0
     */
    slerp(dest: Vec2, t: number): Vec2 {
        const cos = this.dot(dest);
        const sin = this.cross(dest);
        const angle = Math.atan2(sin, cos);
        return this
            .scale(Math.sin((1 - t) * angle))
            .add(dest.scale(Math.sin(t * angle)))
            .scale(1 / sin);
    }

    /**
     * Spherical interpolate src and dst by t
     * @param src First vector
     * @param dst Second vector
     * @param t Percentage
     * @param out The spherical interpolation between src and dst by t
     * @returns The spherical interpolation between src and dst by t
     */
    static slerp(src: Vec2, dst: Vec2, t: number, out: Vec2): Vec2 {
        const cos = Vec2.dot(src, dst);
        const sin = Vec2.cross(src, dst);
        const angle = Math.atan2(sin, cos);
        const t1 = Math.sin((1 - t) * angle);
        const t2 = Math.sin(t * angle);
        const invSin = 1 / sin;
        out.x = (src.x * t1 + dst.x * t2) * invSin;
        out.y = (src.y * t1 + dst.y * t2) * invSin;
        return out;
    }

    /**
     * If the vector (x, y) is zero.
     *
     * @since v3000.0
     */
    isZero(): boolean {
        return this.x === 0 && this.y === 0;
    }

    /**
     * To n precision floating point.
     */
    toFixed(n: number): Vec2 {
        return new Vec2(Number(this.x.toFixed(n)), Number(this.y.toFixed(n)));
    }

    /**
     * Multiply by a Mat4.
     *
     * @since v3000.0
     */
    transform(m: Mat4): Vec2 {
        return m.multVec2(this);
    }

    /**
     * See if one vector is equal to another.
     *
     * @since v3000.0
     */
    eq(other: Vec2): boolean {
        return this.x === other.x && this.y === other.y;
    }

    /** Converts the vector to a {@link Rect `Rect()`} with the vector as the origin.
     * @since v3000.0.
     */
    bbox(): Rect {
        return new Rect(this, 0, 0);
    }

    /** Converts the vector to a readable string. */
    toString(): string {
        return `vec2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    /** Converts the vector to an array.
     * @since v3001.0
     */
    toArray(): Array<number> {
        return [this.x, this.y];
    }
}

export function vec2(...args: Vec2Args): Vec2 {
    if (args.length === 1) {
        if (args[0] instanceof Vec2) {
            return new Vec2(args[0].x, args[0].y);
        }
        else if (Array.isArray(args[0]) && args[0].length === 2) {
            return new Vec2(...args[0]);
        }
    }
    // @ts-ignore
    return new Vec2(...args);
}

/**
 * @group Math
 */
export class Quad {
    x: number = 0;
    y: number = 0;
    w: number = 1;
    h: number = 1;
    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    scale(other: Quad): Quad {
        return new Quad(
            this.x + this.w * other.x,
            this.y + this.h * other.y,
            this.w * other.w,
            this.h * other.h,
        );
    }
    pos() {
        return new Vec2(this.x, this.y);
    }
    clone(): Quad {
        return new Quad(this.x, this.y, this.w, this.h);
    }
    eq(other: Quad): boolean {
        return this.x === other.x
            && this.y === other.y
            && this.w === other.w
            && this.h === other.h;
    }
    toString(): string {
        return `quad(${this.x}, ${this.y}, ${this.w}, ${this.h})`;
    }
}

export function quad(x: number, y: number, w: number, h: number): Quad {
    return new Quad(x, y, w, h);
}

// Internal class
class Mat2 {
    // 2x2 matrix
    a: number;
    b: number;
    c: number;
    d: number;

    constructor(a: number, b: number, c: number, d: number) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }

    mul(other: Mat2) {
        return new Mat2(
            this.a * other.a + this.b * other.c,
            this.a * other.b + this.b * other.d,
            this.c * other.a + this.d * other.c,
            this.c * other.b + this.d * other.d,
        );
    }

    transform(point: Vec2): Vec2 {
        return vec2(
            this.a * point.x + this.b * point.y,
            this.c * point.x + this.d * point.y,
        );
    }

    get inverse() {
        const det = this.det;
        return new Mat2(
            this.d / det,
            -this.b / det,
            -this.c / det,
            this.a / det,
        );
    }

    get transpose() {
        return new Mat2(
            this.a,
            this.c,
            this.b,
            this.d,
        );
    }

    get eigenvalues() {
        const m = this.trace / 2;
        const d = this.det;
        const e1 = m + Math.sqrt(m * m - d);
        const e2 = m - Math.sqrt(m * m - d);
        return [e1, e2];
    }

    eigenvectors(e1: number, e2: number) {
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
    }

    get det() {
        return this.a * this.d - this.b * this.c;
    }

    get trace() {
        return this.a + this.d;
    }

    static rotation(radians: number) {
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        return new Mat2(
            c,
            s,
            -s,
            c,
        );
    }

    static scale(x: number, y: number) {
        return new Mat2(x, 0, 0, y);
    }
}

// Internal class
export class Mat23 {
    // 2x3 matrix, since the last column is always (0, 0, 1)
    a: number;
    b: number; // 0
    c: number;
    d: number; // 0
    e: number;
    f: number; // 1
    constructor(
        a: number = 1,
        b: number = 0,
        c: number = 0,
        d: number = 1,
        e: number = 0,
        f: number = 0,
    ) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
    }
    static fromMat2(m: Mat2) {
        return new Mat23(
            m.a,
            m.b,
            m.c,
            m.d,
            0,
            0,
        );
    }
    toMat2() {
        return new Mat2(
            this.a,
            this.b,
            this.c,
            this.d,
        );
    }
    static fromTranslation(t: Vec2) {
        return new Mat23(
            1,
            0,
            0,
            1,
            t.x,
            t.y,
        );
    }
    static fromRotation(radians: number) {
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        return new Mat23(
            c,
            s,
            -s,
            c,
            0,
            0,
        );
    }
    static fromScale(s: Vec2): Mat23 {
        return new Mat23(
            s.x,
            0,
            0,
            s.y,
            0,
            0,
        );
    }
    clone() {
        return new Mat23(
            this.a,
            this.b,
            this.c,
            this.d,
            this.e,
            this.f,
        );
    }
    setMat23(m: Mat23) {
        this.a = m.a;
        this.b = m.b;
        this.c = m.c;
        this.d = m.d;
        this.e = m.e;
        this.f = m.f;
        return this;
    }
    setIdentity() {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
        return this;
    }
    mul(other: Mat23): Mat23 {
        return new Mat23(
            other.a * this.a + other.b * this.c,
            other.a * this.b + other.b * this.d,
            other.c * this.a + other.d * this.c,
            other.c * this.b + other.d * this.d,
            other.e * this.a + other.f * this.c + this.e,
            other.e * this.b + other.f * this.d + this.f,
        );
    }
    translateSelfV(t: Vec2): Mat23 {
        this.e += t.x * this.a + t.y * this.c;
        this.f += t.x * this.b + t.y * this.d;
        return this;
    }
    translateSelf(x: number, y: number): Mat23 {
        this.e += x * this.a + y * this.c;
        this.f += x * this.b + y * this.d;
        return this;
    }
    rotateSelf(degrees: number): Mat23 {
        const radians = deg2rad(degrees);
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        const oldA = this.a;
        const oldB = this.b;
        this.a = c * this.a + s * this.c;
        this.b = c * this.b + s * this.d;
        this.c = c * this.c - s * oldA;
        this.d = c * this.d - s * oldB;
        return this;
    }
    scaleSelfV(s: Vec2): Mat23 {
        this.a *= s.x;
        this.b *= s.x;
        this.c *= s.y;
        this.d *= s.y;
        return this;
    }
    scaleSelf(x: number, y: number): Mat23 {
        this.a *= x;
        this.b *= x;
        this.c *= y;
        this.d *= y;
        return this;
    }
    mulSelf(other: Mat23) {
        const a = other.a * this.a + other.b * this.c;
        const b = other.a * this.b + other.b * this.d;
        const c = other.c * this.a + other.d * this.c;
        const d = other.c * this.b + other.d * this.d;
        const e = other.e * this.a + other.f * this.c + this.e;
        const f = other.e * this.b + other.f * this.d + this.f;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
    }
    transform(p: Vec2) {
        return vec2(
            this.a * p.x + this.c * p.y + this.e,
            this.b * p.x + this.d * p.y + this.f,
        );
    }
    transformPoint(p: Vec2, o: Vec2): Vec2 {
        const tmp = p.x;
        o.x = this.a * p.x + this.c * p.y + this.e;
        o.y = this.b * tmp + this.d * p.y + this.f;
        return o;
    }
    transformVector(v: Vec2, o: Vec2): Vec2 {
        const tmp = v.x;
        o.x = this.a * v.x + this.c * v.y;
        o.y = this.b * tmp + this.d * v.y;
        return o;
    }

    get det() {
        return this.a * this.d - this.b * this.c;
    }

    get inverse() {
        const det = this.det;
        return new Mat23(
            this.d / det,
            -this.b / det,
            -this.c / det,
            this.a / det,
            (this.c * this.f - this.d * this.e) / det,
            (this.b * this.e - this.a * this.f) / det,
        );
    }
    getTranslation() {
        return new Vec2(this.e, this.f);
    }
    get hasTranslation() {
        return this.e != 0 || this.f != 0;
    }
    getRotation() {
        return rad2deg(
            Math.atan2(-this.c, this.a),
        );
    }
    get hasRotation() {
        return Math.abs(Math.atan2(-this.c, this.a)) > Number.EPSILON;
    }
    getScale() {
        return new Vec2(
            Math.sqrt(this.a * this.a + this.c * this.c),
            Math.sqrt(this.b * this.b + this.d * this.d),
        );
    }
    get hasScale() {
        return this.a * this.a + this.c * this.c > Number.EPSILON || this.b * this.b + this.d * this.d > Number.EPSILON;
    }
    get hasRotationOrSkew() {
        return this.b > Number.EPSILON || this.c > Number.EPSILON;
    }
}

// Internal class
class Mat3 {
    // m11 m12 m13
    // m21 m22 m23
    // m31 m32 m33
    m11: number;
    m12: number;
    m13: number;
    m21: number;
    m22: number;
    m23: number;
    m31: number;
    m32: number;
    m33: number;

    constructor(
        m11: number,
        m12: number,
        m13: number,
        m21: number,
        m22: number,
        m23: number,
        m31: number,
        m32: number,
        m33: number,
    ) {
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

    static fromMat2(m: Mat2) {
        return new Mat3(
            m.a,
            m.b,
            0,
            m.c,
            m.d,
            0,
            0,
            0,
            1,
        );
    }

    toMat2() {
        return new Mat2(
            this.m11,
            this.m12,
            this.m21,
            this.m22,
        );
    }

    mul(other: Mat3): Mat3 {
        return new Mat3(
            this.m11 * other.m11 + this.m12 * other.m21 + this.m13 * other.m31,
            this.m11 * other.m12 + this.m12 * other.m22 + this.m13 * other.m32,
            this.m11 * other.m13 + this.m12 * other.m23 + this.m13 * other.m33,
            this.m21 * other.m11 + this.m22 * other.m21 + this.m23 * other.m31,
            this.m21 * other.m12 + this.m22 * other.m22 + this.m23 * other.m32,
            this.m21 * other.m13 + this.m22 * other.m23 + this.m23 * other.m33,
            this.m31 * other.m11 + this.m32 * other.m21 + this.m33 * other.m31,
            this.m31 * other.m12 + this.m32 * other.m22 + this.m33 * other.m32,
            this.m31 * other.m13 + this.m32 * other.m23 + this.m33 * other.m33,
        );
    }

    get det(): number {
        return this.m11 * this.m22 * this.m33 + this.m12 * this.m23 * this.m31
            + this.m13 * this.m21 * this.m32 - this.m13 * this.m22 * this.m31
            - this.m12 * this.m21 * this.m33 - this.m11 * this.m23 * this.m32;
    }

    rotate(radians: number) {
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        const oldA = this.m11;
        const oldB = this.m12;
        this.m11 = c * this.m11 + s * this.m21;
        this.m12 = c * this.m12 + s * this.m22;
        this.m21 = c * this.m21 - s * oldA;
        this.m22 = c * this.m22 - s * oldB;
        return this;
    }

    scale(x: number, y: number) {
        this.m11 *= x;
        this.m12 *= x;
        this.m21 *= y;
        this.m22 *= y;
        return this;
    }

    get inverse(): Mat3 {
        const det = this.det;
        return new Mat3(
            (this.m22 * this.m33 - this.m23 * this.m32) / det,
            (this.m13 * this.m32 - this.m12 * this.m33) / det,
            (this.m12 * this.m23 - this.m13 * this.m22) / det,
            (this.m23 * this.m31 - this.m21 * this.m33) / det,
            (this.m11 * this.m33 - this.m13 * this.m31) / det,
            (this.m13 * this.m21 - this.m11 * this.m23) / det,
            (this.m21 * this.m32 - this.m22 * this.m31) / det,
            (this.m12 * this.m31 - this.m11 * this.m32) / det,
            (this.m11 * this.m22 - this.m12 * this.m21) / det,
        );
    }

    get transpose(): Mat3 {
        return new Mat3(
            this.m11,
            this.m21,
            this.m31,
            this.m12,
            this.m22,
            this.m32,
            this.m13,
            this.m23,
            this.m33,
        );
    }
}

/**
 * @group Math
 */
export class Mat4 {
    m: number[] = [
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

    constructor(m?: number[]) {
        if (m) {
            this.m = m;
        }
    }

    static translate(p: Vec2): Mat4 {
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
    }

    static scale(s: Vec2): Mat4 {
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
    }

    static rotateX(a: number): Mat4 {
        a = deg2rad(-a);
        const c = Math.cos(a);
        const s = Math.sin(a);
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
    }

    static rotateY(a: number): Mat4 {
        a = deg2rad(-a);
        const c = Math.cos(a);
        const s = Math.sin(a);
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
    }

    static rotateZ(a: number): Mat4 {
        a = deg2rad(-a);
        const c = Math.cos(a);
        const s = Math.sin(a);
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
    }

    translate(p: Vec2) {
        this.m[12] += this.m[0] * p.x + this.m[4] * p.y;
        this.m[13] += this.m[1] * p.x + this.m[5] * p.y;
        this.m[14] += this.m[2] * p.x + this.m[6] * p.y;
        this.m[15] += this.m[3] * p.x + this.m[7] * p.y;
        return this;
    }

    scale(p: Vec2) {
        this.m[0] *= p.x;
        this.m[4] *= p.y;
        this.m[1] *= p.x;
        this.m[5] *= p.y;
        this.m[2] *= p.x;
        this.m[6] *= p.y;
        this.m[3] *= p.x;
        this.m[7] *= p.y;
        return this;
    }

    rotate(a: number): Mat4 {
        a = deg2rad(-a);
        const c = Math.cos(a);
        const s = Math.sin(a);
        const m0 = this.m[0];
        const m1 = this.m[1];
        const m4 = this.m[4];
        const m5 = this.m[5];
        this.m[0] = m0 * c + m1 * s;
        this.m[1] = -m0 * s + m1 * c;
        this.m[4] = m4 * c + m5 * s;
        this.m[5] = -m4 * s + m5 * c;
        return this;
    }

    // TODO: in-place variant
    mult(other: Mat4): Mat4 {
        const out = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                out[i * 4 + j] = this.m[0 * 4 + j] * other.m[i * 4 + 0]
                    + this.m[1 * 4 + j] * other.m[i * 4 + 1]
                    + this.m[2 * 4 + j] * other.m[i * 4 + 2]
                    + this.m[3 * 4 + j] * other.m[i * 4 + 3];
            }
        }
        return new Mat4(out);
    }

    multVec2(p: Vec2): Vec2 {
        return new Vec2(
            p.x * this.m[0] + p.y * this.m[4] + this.m[12],
            p.x * this.m[1] + p.y * this.m[5] + this.m[13],
        );
    }

    getTranslation() {
        return new Vec2(this.m[12], this.m[13]);
    }

    getScale() {
        if (this.m[0] != 0 || this.m[1] != 0) {
            const det = this.m[0] * this.m[5] - this.m[1] * this.m[4];
            const r = Math.sqrt(this.m[0] * this.m[0] + this.m[1] * this.m[1]);
            return new Vec2(r, det / r);
        }
        else if (this.m[4] != 0 || this.m[5] != 0) {
            const det = this.m[0] * this.m[5] - this.m[1] * this.m[4];
            const s = Math.sqrt(this.m[4] * this.m[4] + this.m[5] * this.m[5]);
            return new Vec2(det / s, s);
        }
        else {
            return new Vec2(0, 0);
        }
    }

    getRotation() {
        if (this.m[0] != 0 || this.m[1] != 0) {
            const r = Math.sqrt(this.m[0] * this.m[0] + this.m[1] * this.m[1]);
            return rad2deg(
                this.m[1] > 0
                    ? Math.acos(this.m[0] / r)
                    : -Math.acos(this.m[0] / r),
            );
        }
        else if (this.m[4] != 0 || this.m[5] != 0) {
            const s = Math.sqrt(this.m[4] * this.m[4] + this.m[5] * this.m[5]);
            return rad2deg(
                Math.PI / 2 - (this.m[5] > 0
                    ? Math.acos(-this.m[4] / s)
                    : -Math.acos(this.m[4] / s)),
            );
        }
        else {
            return 0;
        }
    }

    getSkew() {
        if (this.m[0] != 0 || this.m[1] != 0) {
            const r = Math.sqrt(this.m[0] * this.m[0] + this.m[1] * this.m[1]);
            return new Vec2(
                Math.atan(this.m[0] * this.m[4] + this.m[1] * this.m[5])
                / (r * r),
                0,
            );
        }
        else if (this.m[4] != 0 || this.m[5] != 0) {
            const s = Math.sqrt(this.m[4] * this.m[4] + this.m[5] * this.m[5]);
            return new Vec2(
                0,
                Math.atan(this.m[0] * this.m[4] + this.m[1] * this.m[5])
                / (s * s),
            );
        }
        else {
            return new Vec2(0, 0);
        }
    }

    invert(): Mat4 {
        const out = [];

        const f00 = this.m[10] * this.m[15] - this.m[14] * this.m[11];
        const f01 = this.m[9] * this.m[15] - this.m[13] * this.m[11];
        const f02 = this.m[9] * this.m[14] - this.m[13] * this.m[10];
        const f03 = this.m[8] * this.m[15] - this.m[12] * this.m[11];
        const f04 = this.m[8] * this.m[14] - this.m[12] * this.m[10];
        const f05 = this.m[8] * this.m[13] - this.m[12] * this.m[9];
        const f06 = this.m[6] * this.m[15] - this.m[14] * this.m[7];
        const f07 = this.m[5] * this.m[15] - this.m[13] * this.m[7];
        const f08 = this.m[5] * this.m[14] - this.m[13] * this.m[6];
        const f09 = this.m[4] * this.m[15] - this.m[12] * this.m[7];
        const f10 = this.m[4] * this.m[14] - this.m[12] * this.m[6];
        const f11 = this.m[5] * this.m[15] - this.m[13] * this.m[7];
        const f12 = this.m[4] * this.m[13] - this.m[12] * this.m[5];
        const f13 = this.m[6] * this.m[11] - this.m[10] * this.m[7];
        const f14 = this.m[5] * this.m[11] - this.m[9] * this.m[7];
        const f15 = this.m[5] * this.m[10] - this.m[9] * this.m[6];
        const f16 = this.m[4] * this.m[11] - this.m[8] * this.m[7];
        const f17 = this.m[4] * this.m[10] - this.m[8] * this.m[6];
        const f18 = this.m[4] * this.m[9] - this.m[8] * this.m[5];

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

        const det = this.m[0] * out[0]
            + this.m[1] * out[4]
            + this.m[2] * out[8]
            + this.m[3] * out[12];

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                out[i * 4 + j] *= 1.0 / det;
            }
        }

        return new Mat4(out);
    }

    clone(): Mat4 {
        return new Mat4([...this.m]);
    }

    toString(): string {
        return this.m.toString();
    }
}

export function wave(
    lo: number,
    hi: number,
    t: number,
    f = (t: number) => -Math.cos(t),
): number {
    return lo + (f(t) + 1) / 2 * (hi - lo);
}

// basic ANSI C LCG
const A = 1103515245;
const C = 12345;
const M = 2147483648;

/**
 * @group Math
 */
export class RNG {
    seed: number;
    constructor(seed: number) {
        this.seed = seed;
    }
    gen(): number {
        this.seed = (A * this.seed + C) % M;
        return this.seed / M;
    }
    genNumber(a: number, b: number): number {
        return a + this.gen() * (b - a);
    }
    genVec2(a: Vec2, b: Vec2): Vec2 {
        return new Vec2(
            this.genNumber(a.x, b.x),
            this.genNumber(a.y, b.y),
        );
    }
    genColor(a: Color, b: Color): Color {
        return new Color(
            this.genNumber(a.r, b.r),
            this.genNumber(a.g, b.g),
            this.genNumber(a.b, b.b),
        );
    }
    genAny<T = RNGValue>(...args: [] | [T] | [T, T]): T {
        if (args.length === 0) {
            return this.gen() as T;
        }
        else if (args.length === 1) {
            if (typeof args[0] === "number") {
                return this.genNumber(0, args[0]) as T;
            }
            else if (args[0] instanceof Vec2) {
                return this.genVec2(vec2(0, 0), args[0]) as T;
            }
            else if (args[0] instanceof Color) {
                return this.genColor(rgb(0, 0, 0), args[0]) as T;
            }
        }
        else if (args.length === 2) {
            if (typeof args[0] === "number" && typeof args[1] === "number") {
                return this.genNumber(args[0], args[1]) as T;
            }
            else if (args[0] instanceof Vec2 && args[1] instanceof Vec2) {
                return this.genVec2(args[0], args[1]) as T;
            }
            else if (args[0] instanceof Color && args[1] instanceof Color) {
                return this.genColor(args[0], args[1]) as T;
            }
        }

        throw new Error("More than 2 arguments not supported");
    }
}

// TODO: let user pass seed
const defRNG = new RNG(Date.now());

export function randSeed(seed?: number): number {
    if (seed != null) {
        defRNG.seed = seed;
    }
    return defRNG.seed;
}

export function rand<T = number>(...args: [] | [T] | [T, T]) {
    return defRNG.genAny(...args);
}

export function randi(...args: [] | [number] | [number, number]) {
    return Math.floor(rand(...(args.length > 0 ? args : [2])));
}

export function chance(p: number): boolean {
    return rand() <= p;
}

export function shuffle<T>(list: T[]): T[] {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}

export function chooseMultiple<T>(list: T[], count: number): T[] {
    return list.length <= count
        ? list.slice()
        : shuffle(list.slice()).slice(0, count);
}

export function choose<T>(list: T[]): T {
    return list[randi(list.length)];
}

// TODO: better name
export function testRectRect2(r1: Rect, r2: Rect): boolean {
    return r1.pos.x + r1.width >= r2.pos.x
        && r1.pos.x <= r2.pos.x + r2.width
        && r1.pos.y + r1.height >= r2.pos.y
        && r1.pos.y <= r2.pos.y + r2.height;
}

export function testRectRect(r1: Rect, r2: Rect): boolean {
    return r1.pos.x + r1.width > r2.pos.x
        && r1.pos.x < r2.pos.x + r2.width
        && r1.pos.y + r1.height > r2.pos.y
        && r1.pos.y < r2.pos.y + r2.height;
}

// TODO: better name
export function testLineLineT(l1: Line, l2: Line): number | null {
    if (
        (l1.p1.x === l1.p2.x && l1.p1.y === l1.p2.y)
        || (l2.p1.x === l2.p2.x && l2.p1.y === l2.p2.y)
    ) {
        return null;
    }

    const denom = (l2.p2.y - l2.p1.y) * (l1.p2.x - l1.p1.x)
        - (l2.p2.x - l2.p1.x) * (l1.p2.y - l1.p1.y);

    // parallel
    if (denom === 0) {
        return null;
    }

    const ua = ((l2.p2.x - l2.p1.x) * (l1.p1.y - l2.p1.y)
        - (l2.p2.y - l2.p1.y) * (l1.p1.x - l2.p1.x)) / denom;
    const ub = ((l1.p2.x - l1.p1.x) * (l1.p1.y - l2.p1.y)
        - (l1.p2.y - l1.p1.y) * (l1.p1.x - l2.p1.x)) / denom;

    // is the intersection on the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return null;
    }

    return ua;
}

export function testLineLine(l1: Line, l2: Line): Vec2 | null {
    const t = testLineLineT(l1, l2);
    if (!t) return null;
    return vec2(
        l1.p1.x + t * (l1.p2.x - l1.p1.x),
        l1.p1.y + t * (l1.p2.y - l1.p1.y),
    );
}

export function clipLineToRect(r: Rect, l: Line, result: Line): boolean {
    const dir = l.p2.sub(l.p1);
    let tmin = Number.NEGATIVE_INFINITY, tmax = Number.POSITIVE_INFINITY;

    if (dir.x != 0.0) {
        const tx1 = (r.pos.x - l.p1.x) / dir.x;
        const tx2 = (r.pos.x + r.width - l.p1.x) / dir.x;

        tmin = Math.max(tmin, Math.min(tx1, tx2));
        tmax = Math.min(tmax, Math.max(tx1, tx2));
    }
    else {
        if (l.p1.x < r.pos.x || l.p1.x > r.pos.x + r.width) {
            return false;
        }
    }

    if (dir.y != 0.0) {
        const ty1 = (r.pos.y - l.p1.y) / dir.y;
        const ty2 = (r.pos.y + r.height - l.p1.y) / dir.y;

        tmin = Math.max(tmin, Math.min(ty1, ty2));
        tmax = Math.min(tmax, Math.max(ty1, ty2));
    }
    else {
        if (l.p1.y < r.pos.y || l.p1.y > r.pos.y + r.height) {
            return false;
        }
    }

    if (tmax >= tmin && tmax >= 0 && tmin <= 1) {
        Vec2.addScaled(l.p1, dir, Math.max(tmin, 0), result.p1);
        Vec2.addScaled(l.p1, dir, Math.min(tmax, 1), result.p2);
        return true;
    }
    else {
        return false;
    }
}

export function testRectLine(r: Rect, l: Line): boolean {
    const dir = l.p2.sub(l.p1);
    let tmin = Number.NEGATIVE_INFINITY, tmax = Number.POSITIVE_INFINITY;

    if (dir.x != 0.0) {
        const tx1 = (r.pos.x - l.p1.x) / dir.x;
        const tx2 = (r.pos.x + r.width - l.p1.x) / dir.x;

        tmin = Math.max(tmin, Math.min(tx1, tx2));
        tmax = Math.min(tmax, Math.max(tx1, tx2));
    }
    else {
        if (l.p1.x < r.pos.x || l.p1.x > r.pos.x + r.width) {
            return false;
        }
    }

    if (dir.y != 0.0) {
        const ty1 = (r.pos.y - l.p1.y) / dir.y;
        const ty2 = (r.pos.y + r.height - l.p1.y) / dir.y;

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

export function testRectPoint2(r: Rect, pt: Vec2): boolean {
    return pt.x >= r.pos.x
        && pt.x <= r.pos.x + r.width
        && pt.y >= r.pos.y
        && pt.y <= r.pos.y + r.height;
}

export function testRectPoint(r: Rect, pt: Vec2): boolean {
    return pt.x > r.pos.x
        && pt.x < r.pos.x + r.width
        && pt.y > r.pos.y
        && pt.y < r.pos.y + r.height;
}

export function testRectCircle(r: Rect, c: Circle): boolean {
    const nx = Math.max(r.pos.x, Math.min(c.center.x, r.pos.x + r.width));
    const ny = Math.max(r.pos.y, Math.min(c.center.y, r.pos.y + r.height));
    const nearestPoint = vec2(nx, ny);
    return nearestPoint.sdist(c.center) <= c.radius * c.radius;
}

export function testRectPolygon(r: Rect, p: Polygon): boolean {
    return testPolygonPolygon(p, new Polygon(r.points()));
}

export function testLinePoint(l: Line, pt: Vec2): boolean {
    const v1 = pt.sub(l.p1);
    const v2 = l.p2.sub(l.p1);

    // Check if sine is 0, in that case lines are parallel.
    // If not parallel, the point cannot lie on the line.
    if (Math.abs(v1.cross(v2)) > Number.EPSILON) {
        return false;
    }

    // Scalar projection of v1 on v2
    const t = v1.dot(v2) / v2.dot(v2);
    // Since t is percentual distance of pt from line.p1 on the line,
    // it should be between 0% and 100%
    return t >= 0 && t <= 1;
}

export function clipLineToCircle(
    circle: Circle,
    l: Line,
    result: Line,
): boolean {
    const v = l.p2.sub(l.p1);
    const a = v.dot(v);
    const centerToOrigin = l.p1.sub(circle.center);
    const b = 2 * v.dot(centerToOrigin);
    const c = centerToOrigin.dot(centerToOrigin)
        - circle.radius * circle.radius;
    // Calculate the discriminant of ax^2 + bx + c
    const dis = b * b - 4 * a * c;

    // No root
    if ((a <= Number.EPSILON) || (dis < 0)) {
        return false;
    }
    // One possible root
    else if (dis == 0) {
        const t = -b / (2 * a);
        if (t >= 0 && t <= 1) {
            if (testCirclePoint(circle, l.p1)) {
                Vec2.copy(l.p1, result.p1);
                Vec2.addScaled(l.p1, v, t, result.p2);
            }
            else {
                Vec2.addScaled(l.p1, v, t, result.p1);
                Vec2.copy(l.p2, result.p2);
            }
            return true;
        }
    }
    // Two possible roots
    else {
        const t1 = (-b + Math.sqrt(dis)) / (2 * a);
        const t2 = (-b - Math.sqrt(dis)) / (2 * a);
        const b1 = t1 >= 0 && t1 <= 1;
        const b2 = t2 >= 0 && t2 <= 1;
        if (b1 && b2) {
            Vec2.addScaled(l.p1, v, t1, result.p1);
            Vec2.addScaled(l.p1, v, t2, result.p2);
            return true;
        }
        else if (b1 || b2) {
            const t = b1 ? t1 : t2;
            if (testCirclePoint(circle, l.p1)) {
                Vec2.copy(l.p1, result.p1);
                Vec2.addScaled(l.p1, v, t, result.p2);
            }
            else {
                Vec2.addScaled(l.p1, v, t, result.p1);
                Vec2.copy(l.p2, result.p2);
            }
            return true;
        }
    }

    // Check if line is completely within the circle
    // We only need to check one point, since the line didn't cross the circle
    if (testCirclePoint(circle, l.p1)) {
        Vec2.copy(l.p1, result.p1);
        Vec2.copy(l.p2, result.p2);
        return true;
    }
    else {
        return false;
    }
}

export function testLineCircle(l: Line, circle: Circle): boolean {
    const v = l.p2.sub(l.p1);
    const a = v.dot(v);
    const centerToOrigin = l.p1.sub(circle.center);
    const b = 2 * v.dot(centerToOrigin);
    const c = centerToOrigin.dot(centerToOrigin)
        - circle.radius * circle.radius;
    // Calculate the discriminant of ax^2 + bx + c
    const dis = b * b - 4 * a * c;

    // No root
    if ((a <= Number.EPSILON) || (dis < 0)) {
        return false;
    }
    // One possible root
    else if (dis == 0) {
        const t = -b / (2 * a);
        if (t >= 0 && t <= 1) {
            return true;
        }
    }
    // Two possible roots
    else {
        const t1 = (-b + Math.sqrt(dis)) / (2 * a);
        const t2 = (-b - Math.sqrt(dis)) / (2 * a);
        if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) {
            return true;
        }
    }

    // Check if line is completely within the circle
    // We only need to check one point, since the line didn't cross the circle
    return testCirclePoint(circle, l.p1);
}

export function testLinePolygon(l: Line, p: Polygon): boolean {
    // test if line is inside
    if (testPolygonPoint(p, l.p1) || testPolygonPoint(p, l.p2)) {
        return true;
    }

    // test each line
    for (let i = 0; i < p.pts.length; i++) {
        const p1 = p.pts[i];
        const p2 = p.pts[(i + 1) % p.pts.length];
        if (testLineLine(l, new Line(p1, p2))) {
            return true;
        }
    }

    return false;
}

export function testCirclePoint(c: Circle, p: Vec2): boolean {
    return c.center.sdist(p) < c.radius * c.radius;
}

export function testCircleCircle(c1: Circle, c2: Circle): boolean {
    return c1.center.sdist(c2.center)
        < (c1.radius + c2.radius) * (c1.radius + c2.radius);
}

export function testCirclePolygon(c: Circle, p: Polygon): boolean {
    // For each edge check for intersection
    let prev = p.pts[p.pts.length - 1];
    for (const cur of p.pts) {
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

export function testPolygonPolygon(p1: Polygon, p2: Polygon): boolean {
    for (let i = 0; i < p1.pts.length; i++) {
        if (
            testLinePolygon(
                new Line(p1.pts[i], p1.pts[(i + 1) % p1.pts.length]),
                p2,
            )
        ) {
            return true;
        }
    }
    // Check if any of the points of the polygon lie in the other polygon
    if (
        p1.pts.some(p => testPolygonPoint(p2, p))
        || p2.pts.some(p => testPolygonPoint(p1, p))
    ) {
        return true;
    }
    return false;
}

// https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
export function testPolygonPoint(poly: Polygon, pt: Vec2): boolean {
    let c = false;
    const p = poly.pts;

    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
        if (
            ((p[i].y > pt.y) != (p[j].y > pt.y))
            && (pt.x
                < (p[j].x - p[i].x) * (pt.y - p[i].y) / (p[j].y - p[i].y)
                + p[i].x)
        ) {
            c = !c;
        }
    }

    return c;
}

export function testEllipsePoint(ellipse: Ellipse, pt: Vec2): boolean {
    // Transform the point into the ellipse's unrotated coordinate system at the origin
    pt = pt.sub(ellipse.center);
    const angle = deg2rad(ellipse.angle);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const vx = pt.x * c + pt.y * s;
    const vy = -pt.x * s + pt.y * c;
    return vx * vx / (ellipse.radiusX * ellipse.radiusX)
        + vy * vy / (ellipse.radiusY * ellipse.radiusY) < 1;
}

export function testEllipseCircle(ellipse: Ellipse, circle: Circle): boolean {
    // This is an approximation, because the parallel curve of an ellipse is an octic algebraic curve, not just a larger ellipse.
    // Transform the circle's center into the ellipse's unrotated coordinate system at the origin
    const center = circle.center.sub(ellipse.center);
    const angle = deg2rad(ellipse.angle);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const cx = center.x * c + center.y * s;
    const cy = -center.x * s + center.y * c;
    // Test with an approximate Minkowski sum of the ellipse and the circle
    return testEllipsePoint(
        new Ellipse(
            vec2(),
            ellipse.radiusX + circle.radius,
            ellipse.radiusY + circle.radius,
            0,
        ),
        vec2(cx, cy),
    );
}

export function testEllipseLine(ellipse: Ellipse, line: Line): boolean {
    // Transform the line to the coordinate system where the ellipse is a unit circle
    const T = ellipse.toMat2().inverse;
    line = new Line(
        T.transform(line.p1.sub(ellipse.center)),
        T.transform(line.p2.sub(ellipse.center)),
    );
    return testLineCircle(line, new Circle(vec2(), 1));
}

export function testEllipseEllipse(
    ellipse1: Ellipse,
    ellipse2: Ellipse,
): boolean {
    // First check if one of the ellipses isn't secretly a circle
    if (ellipse1.radiusX === ellipse1.radiusY) {
        return testEllipseCircle(
            ellipse2,
            new Circle(ellipse1.center, ellipse1.radiusX),
        );
    }
    else if (ellipse2.radiusX === ellipse2.radiusY) {
        return testEllipseCircle(
            ellipse1,
            new Circle(ellipse2.center, ellipse2.radiusX),
        );
    }
    // No luck, we need to solve the equation
    /*
    Etayo, Fernando, Laureano Gonzalez-Vega, and Natalia del Rio. "A new approach to characterizing the relative position of two ellipses depending on one parameter." Computer aided geometric design 23, no. 4 (2006): 324-350.
    */
    const A1 = new Mat3(
        1 / ellipse1.radiusX ** 2,
        0,
        0,
        0,
        1 / ellipse1.radiusY ** 2,
        0,
        0,
        0,
        -1,
    );
    const A2 = new Mat3(
        1 / ellipse2.radiusX ** 2,
        0,
        0,
        0,
        1 / ellipse2.radiusY ** 2,
        0,
        0,
        0,
        -1,
    );

    const x1 = ellipse1.center.x;
    const y1 = ellipse1.center.y;
    const x2 = ellipse2.center.x;
    const y2 = ellipse2.center.y;
    const theta1 = deg2rad(ellipse1.angle);
    const theta2 = deg2rad(ellipse2.angle);

    const M1 = new Mat3(
        Math.cos(theta1),
        -Math.sin(theta1),
        x1,
        Math.sin(theta1),
        Math.cos(theta1),
        y1,
        0,
        0,
        1,
    );
    const M2 = new Mat3(
        Math.cos(theta2),
        -Math.sin(theta2),
        x2,
        Math.sin(theta2),
        Math.cos(theta2),
        y2,
        0,
        0,
        1,
    );
    const M1inv = M1.inverse;
    const M2inv = M2.inverse;

    const A = M1inv.transpose.mul(A1).mul(M1inv);
    const B = M2inv.transpose.mul(A2).mul(M2inv);

    const a11 = A.m11;
    const a12 = A.m12;
    const a13 = A.m13;
    const a21 = A.m21;
    const a22 = A.m22;
    const a23 = A.m23;
    const a31 = A.m31;
    const a32 = A.m32;
    const a33 = A.m33;

    const b11 = B.m11;
    const b12 = B.m12;
    const b13 = B.m13;
    const b21 = B.m21;
    const b22 = B.m22;
    const b23 = B.m23;
    const b31 = B.m31;
    const b32 = B.m32;
    const b33 = B.m33;

    const factor = a11 * a22 * a33 - a11 * a23 * a32 - a12 * a21 * a33
        + a12 * a23 * a31 + a13 * a21 * a32 - a13 * a22 * a31;
    const a =
        (a11 * a22 * b33 - a11 * a23 * b32 - a11 * a32 * b23 + a11 * a33 * b22
            - a12 * a21 * b33 + a12 * a23 * b31 + a12 * a31 * b23
            - a12 * a33 * b21 + a13 * a21 * b32 - a13 * a22 * b31
            - a13 * a31 * b22 + a13 * a32 * b21 + a21 * a32 * b13
            - a21 * a33 * b12 - a22 * a31 * b13 + a22 * a33 * b11
            + a23 * a31 * b12 - a23 * a32 * b11) / factor;
    const b =
        (a11 * b22 * b33 - a11 * b23 * b32 - a12 * b21 * b33 + a12 * b23 * b31
            + a13 * b21 * b32 - a13 * b22 * b31 - a21 * b12 * b33
            + a21 * b13 * b32 + a22 * b11 * b33 - a22 * b13 * b31
            - a23 * b11 * b32 + a23 * b12 * b31 + a31 * b12 * b23
            - a31 * b13 * b22 - a32 * b11 * b23 + a32 * b13 * b21
            + a33 * b11 * b22 - a33 * b12 * b21) / factor;
    const c =
        (b11 * b22 * b33 - b11 * b23 * b32 - b12 * b21 * b33 + b12 * b23 * b31
            + b13 * b21 * b32 - b13 * b22 * b31) / factor;

    if (a >= 0) {
        const condition1 = -3 * b + a ** 2;
        const condition2 = 3 * a * c + b * a ** 2 - 4 * b ** 2;
        const condition3 = -27 * c ** 2 + 18 * c * a * b + a ** 2 * b ** 2
            - 4 * a ** 3 * c - 4 * b ** 3;
        if (condition1 > 0 && condition2 < 0 && condition3 > 0) {
            return false;
        }
        else {
            return true;
        }
    }
    else {
        const condition1 = -3 * b + a ** 2;
        const condition2 = -27 * c ** 2 + 18 * c * a * b + a ** 2 * b ** 2
            - 4 * a ** 3 * c - 4 * b ** 3;
        if (condition1 > 0 && condition2 > 0) {
            return false;
        }
        else {
            return true;
        }
    }
}

export function testEllipseRect(ellipse: Ellipse, rect: Rect): boolean {
    return testEllipsePolygon(ellipse, new Polygon(rect.points()));
}

export function testEllipsePolygon(ellipse: Ellipse, poly: Polygon): boolean {
    // Transform the polygon to the coordinate system where the ellipse is a unit circle
    const T = ellipse.toMat2().inverse;
    poly = new Polygon(poly.pts.map(p => T.transform(p.sub(ellipse.center))));
    return testCirclePolygon(new Circle(vec2(), 1), poly);
}

export function testPointPoint(p1: Vec2, p2: Vec2): boolean {
    return p1.x === p2.x && p1.y === p2.y;
}

/**
 * @group Math
 */
export type ShapeType = Point | Circle | Line | Rect | Polygon | Ellipse;

export function testPointShape(point: Point, shape: ShapeType): boolean {
    if (shape instanceof Vec2) {
        return testPointPoint(shape as Vec2, point.pt);
    }
    else if (shape instanceof Circle) {
        return testCirclePoint(shape as Circle, point.pt);
    }
    else if (shape instanceof Line) {
        return testLinePoint(shape as Line, point.pt);
    }
    else if (shape instanceof Rect) {
        return testRectPoint(shape as Rect, point.pt);
    }
    else if (shape instanceof Polygon) {
        return testPolygonPoint(shape as Polygon, point.pt);
    }
    else if (shape instanceof Ellipse) {
        return testEllipsePoint(shape as Ellipse, point.pt);
    }
    else {
        return false;
    }
}

export function testLineShape(line: Line, shape: ShapeType | Vec2): boolean {
    if (shape instanceof Vec2) {
        return testLinePoint(line, shape as Vec2);
    }
    else if (shape instanceof Circle) {
        return testLineCircle(line, shape as Circle);
    }
    else if (shape instanceof Line) {
        return testLineLine(line, shape as Line) != null;
    }
    else if (shape instanceof Rect) {
        return testRectLine(shape as Rect, line);
    }
    else if (shape instanceof Polygon) {
        return testLinePolygon(line, shape as Polygon);
    }
    else if (shape instanceof Ellipse) {
        return testEllipseLine(shape as Ellipse, line);
    }
    else {
        return false;
    }
}

export function testCircleShape(
    circle: Circle,
    shape: ShapeType | Vec2,
): boolean {
    if (shape instanceof Vec2) {
        return testCirclePoint(circle, shape as Vec2);
    }
    else if (shape instanceof Circle) {
        return testCircleCircle(circle, shape as Circle);
    }
    else if (shape instanceof Line) {
        return testLineCircle(shape as Line, circle);
    }
    else if (shape instanceof Rect) {
        return testRectCircle(shape as Rect, circle);
    }
    else if (shape instanceof Polygon) {
        return testCirclePolygon(circle, shape as Polygon);
    }
    else if (shape instanceof Ellipse) {
        return testEllipseCircle(shape as Ellipse, circle);
    }
    else {
        return false;
    }
}

export function testRectShape(rect: Rect, shape: ShapeType | Vec2): boolean {
    if (shape instanceof Vec2) {
        return testRectPoint(rect, shape as Vec2);
    }
    else if (shape instanceof Circle) {
        return testRectCircle(rect, shape as Circle);
    }
    else if (shape instanceof Line) {
        return testRectLine(rect, shape as Line);
    }
    else if (shape instanceof Rect) {
        return testRectRect(rect, shape as Rect);
    }
    else if (shape instanceof Polygon) {
        return testRectPolygon(rect, shape as Polygon);
    }
    else if (shape instanceof Ellipse) {
        return testEllipseRect(shape as Ellipse, rect);
    }
    else {
        return false;
    }
}

export function testPolygonShape(
    polygon: Polygon,
    shape: ShapeType | Vec2,
): boolean {
    if (shape instanceof Vec2) {
        return testPolygonPoint(polygon, shape as Vec2);
    }
    else if (shape instanceof Circle) {
        return testCirclePolygon(shape as Circle, polygon);
    }
    else if (shape instanceof Line) {
        return testLinePolygon(shape as Line, polygon);
    }
    else if (shape instanceof Rect) {
        return testRectPolygon(shape as Rect, polygon);
    }
    else if (shape instanceof Polygon) {
        return testPolygonPolygon(shape as Polygon, polygon);
    }
    else if (shape instanceof Ellipse) {
        return testEllipsePolygon(shape as Ellipse, polygon);
    }
    else {
        return false;
    }
}

export function testEllipseShape(ellipse: Ellipse, shape: ShapeType): boolean {
    if (shape instanceof Vec2) {
        return testEllipsePoint(ellipse, shape as Vec2);
    }
    else if (shape instanceof Circle) {
        return testEllipseCircle(ellipse, shape as Circle);
    }
    else if (shape instanceof Line) {
        return testEllipseLine(ellipse, shape as Line);
    }
    else if (shape instanceof Rect) {
        return testEllipseRect(ellipse, shape as Rect);
    }
    else if (shape instanceof Polygon) {
        return testEllipsePolygon(ellipse, shape as Polygon);
    }
    else if (shape instanceof Ellipse) {
        return testEllipseEllipse(shape as Ellipse, ellipse);
    }
    else {
        return false;
    }
}

export function testShapeShape(shape1: ShapeType, shape2: ShapeType): boolean {
    if (shape1 instanceof Vec2) {
        return testPointShape(new Point(shape1), shape2);
    }
    else if (shape1 instanceof Circle) {
        return testCircleShape(shape1 as Circle, shape2);
    }
    else if (shape1 instanceof Line) {
        return testLineShape(shape1 as Line, shape2);
    }
    else if (shape1 instanceof Rect) {
        return testRectShape(shape1 as Rect, shape2);
    }
    else if (shape1 instanceof Polygon) {
        return testPolygonShape(shape1 as Polygon, shape2);
    }
    else if (shape1 instanceof Ellipse) {
        return testEllipseShape(shape1 as Ellipse, shape2);
    }
    else {
        return false;
    }
}

/**
 * @group Math
 */
export type RaycastHit = {
    fraction: number;
    normal: Vec2;
    point: Vec2;
    gridPos?: Vec2;
    object?: GameObj;
};

/**
 * @group Math
 */
export type RaycastResult = RaycastHit | null;

function raycastLine(origin: Vec2, direction: Vec2, line: Line): RaycastResult {
    const a = origin;
    const c = line.p1;
    const d = line.p2;
    const ab = direction;
    const cd = d.sub(c);
    const abxcd = ab.cross(cd);
    // If parallel, no intersection
    if (Math.abs(abxcd) < Number.EPSILON) {
        return null;
    }
    const ac = c.sub(a);
    const s = ac.cross(cd) / abxcd;
    // Outside the ray
    if (s <= 0 || s >= 1) {
        return null;
    }
    // Outside the line
    const t = ac.cross(ab) / abxcd;
    if (t <= 0 || t >= 1) {
        return null;
    }

    const normal = cd.normal().unit();
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

function raycastRect(origin: Vec2, direction: Vec2, rect: Rect) {
    let tmin = Number.NEGATIVE_INFINITY, tmax = Number.POSITIVE_INFINITY;
    let normal;

    if (origin.x != 0.0) {
        const tx1 = (rect.pos.x - origin.x) / direction.x;
        const tx2 = (rect.pos.x + rect.width - origin.x) / direction.x;

        normal = vec2(-Math.sign(direction.x), 0);

        tmin = Math.max(tmin, Math.min(tx1, tx2));
        tmax = Math.min(tmax, Math.max(tx1, tx2));
    }

    if (origin.y != 0.0) {
        const ty1 = (rect.pos.y - origin.y) / direction.y;
        const ty2 = (rect.pos.y + rect.height - origin.y) / direction.y;

        if (Math.min(ty1, ty2) > tmin) {
            normal = vec2(0, -Math.sign(direction.y));
        }

        tmin = Math.max(tmin, Math.min(ty1, ty2));
        tmax = Math.min(tmax, Math.max(ty1, ty2));
    }

    if (tmax >= tmin && tmin >= 0 && tmin <= 1) {
        const point = origin.add(direction.scale(tmin));

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

function raycastCircle(
    origin: Vec2,
    direction: Vec2,
    circle: Circle,
): RaycastResult {
    const a = origin;
    const c = circle.center;
    const ab = direction;
    const A = ab.dot(ab);
    const centerToOrigin = a.sub(c);
    const B = 2 * ab.dot(centerToOrigin);
    const C = centerToOrigin.dot(centerToOrigin)
        - circle.radius * circle.radius;
    // Calculate the discriminant of ax^2 + bx + c
    const disc = B * B - 4 * A * C;
    // No root
    if ((A <= Number.EPSILON) || (disc < 0)) {
        return null;
    }
    // One possible root
    else if (disc == 0) {
        const t = -B / (2 * A);
        if (t >= 0 && t <= 1) {
            const point = a.add(ab.scale(t));
            return {
                point: point,
                normal: point.sub(c),
                fraction: t,
            };
        }
    }
    // Two possible roots
    else {
        const t1 = (-B + Math.sqrt(disc)) / (2 * A);
        const t2 = (-B - Math.sqrt(disc)) / (2 * A);
        let t = null;
        if (t1 >= 0 && t1 <= 1) {
            t = t1;
        }
        if (t2 >= 0 && t2 <= 1) {
            t = Math.min(t2, t ?? t2);
        }
        if (t != null) {
            const point = a.add(ab.scale(t));
            return {
                point: point,
                normal: point.sub(c).unit(),
                fraction: t,
            };
        }
    }

    return null;
}

function raycastPolygon(
    origin: Vec2,
    direction: Vec2,
    polygon: Polygon,
): RaycastResult {
    const points = polygon.pts;
    let minHit = null;

    let prev = points[points.length - 1];
    for (let i = 0; i < points.length; i++) {
        const cur = points[i];
        const hit = raycastLine(origin, direction, new Line(prev, cur));
        if (hit && (!minHit || minHit.fraction > hit.fraction)) {
            minHit = hit;
        }
        prev = cur;
    }

    return minHit;
}

function raycastEllipse(
    origin: Vec2,
    direction: Vec2,
    ellipse: Ellipse,
): RaycastResult {
    // Transforms from unit circle to rotated ellipse
    const T = ellipse.toMat2();
    // Transforms from rotated ellipse to unit circle
    const TI = T.inverse;
    // Transform both origin and direction into the unit circle coordinate system
    const Torigin = TI.transform(origin.sub(ellipse.center));
    const Tdirection = TI.transform(direction);
    // Raycast as if we have a circle
    const result = raycastCircle(Torigin, Tdirection, new Circle(vec2(), 1));
    if (result) {
        const R = Mat2.rotation(deg2rad(-ellipse.angle));
        const S = Mat2.scale(ellipse.radiusX, ellipse.radiusY);
        // Scale the point so we have a point on the unrotated ellipse
        const p = S.transform(result.point);
        // transform the result point to the coordinate system of the rotated ellipse
        const point = T.transform(result.point).add(ellipse.center);
        const fraction = point.dist(origin) / direction.len();
        return {
            point: point,
            // Calculate the normal at the unrotated ellipse, then rotate the normal to the rotated ellipse
            normal: R.transform(
                vec2(ellipse.radiusY ** 2 * p.x, ellipse.radiusX ** 2 * p.y),
            ).unit(),
            fraction,
        };
    }
    return result;
}

export function raycastGrid(
    origin: Vec2,
    direction: Vec2,
    gridPosHit: (gridPos: Vec2) => boolean | RaycastResult,
    maxDistance: number = 64,
): RaycastResult | null {
    const pos = origin;
    const len = direction.len();
    const dir = direction.scale(1 / len);
    let t = 0;
    const gridPos = vec2(Math.floor(origin.x), Math.floor(origin.y));
    const step = vec2(dir.x > 0 ? 1 : -1, dir.y > 0 ? 1 : -1);
    const tDelta = vec2(Math.abs(1 / dir.x), Math.abs(1 / dir.y));
    const dist = vec2(
        (step.x > 0) ? (gridPos.x + 1 - origin.x) : (origin.x - gridPos.x),
        (step.y > 0) ? (gridPos.y + 1 - origin.y) : (origin.y - gridPos.y),
    );
    const tMax = vec2(
        (tDelta.x < Infinity) ? tDelta.x * dist.x : Infinity,
        (tDelta.y < Infinity) ? tDelta.y * dist.y : Infinity,
    );
    let steppedIndex = -1;
    while (t <= maxDistance) {
        const hit = gridPosHit(gridPos);
        if (hit === true) {
            return {
                point: pos.add(dir.scale(t)),
                normal: vec2(
                    steppedIndex === 0 ? -step.x : 0,
                    steppedIndex === 1 ? -step.y : 0,
                ),
                fraction: t / len, // Since dir is normalized, t is len times too large
                gridPos,
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

export class Point {
    pt: Vec2;
    constructor(pt: Vec2) {
        this.pt = pt.clone();
    }
    transform(m: Mat23): Point {
        return new Point(m.transformPoint(this.pt, vec2()));
    }
    bbox(): Rect {
        return new Rect(this.pt, 0, 0);
    }
    area(): number {
        return 0;
    }
    clone(): Point {
        return new Point(this.pt);
    }
    collides(shape: ShapeType): boolean {
        return testPointShape(this, shape);
    }
    contains(point: Vec2): boolean {
        return this.pt.eq(point);
    }
    raycast(origin: Vec2, direction: Vec2): RaycastResult {
        return null;
    }
    random(): Vec2 {
        return this.pt.clone();
    }
}

/**
 * @group Math
 */
export class Line {
    p1: Vec2;
    p2: Vec2;
    constructor(p1: Vec2, p2: Vec2) {
        this.p1 = p1.clone();
        this.p2 = p2.clone();
    }
    transform(m: Mat23): Line {
        return new Line(
            m.transformPoint(this.p1, vec2()),
            m.transformPoint(this.p2, vec2()),
        );
    }
    bbox(): Rect {
        return Rect.fromPoints(this.p1, this.p2);
    }
    area(): number {
        return this.p1.dist(this.p2);
    }
    clone(): Line {
        return new Line(this.p1, this.p2);
    }
    collides(shape: ShapeType | Vec2): boolean {
        return testLineShape(this, shape);
    }
    contains(point: Vec2): boolean {
        return this.collides(point);
    }
    raycast(origin: Vec2, direction: Vec2): RaycastResult {
        return raycastLine(origin, direction, this);
    }
    random(): Vec2 {
        return this.p1.add(this.p2.sub(this.p1).scale(rand(1)));
    }
}

// TODO: use x: number y: number (x, y, width, height)
/**
 * @group Math
 */
export class Rect {
    pos: Vec2;
    width: number;
    height: number;
    constructor(pos: Vec2, width: number, height: number) {
        this.pos = pos.clone();
        this.width = width;
        this.height = height;
    }
    static fromPoints(p1: Vec2, p2: Vec2): Rect {
        return new Rect(p1.clone(), p2.x - p1.x, p2.y - p1.y);
    }
    center(): Vec2 {
        return new Vec2(
            this.pos.x + this.width / 2,
            this.pos.y + this.height / 2,
        );
    }
    points(): [Vec2, Vec2, Vec2, Vec2] {
        return [
            this.pos,
            this.pos.add(this.width, 0),
            this.pos.add(this.width, this.height),
            this.pos.add(0, this.height),
        ];
    }
    transform(m: Mat23): Rect | Polygon {
        if (m.hasRotationOrSkew) {
            return new Polygon(
                this.points().map((pt) => m.transformPoint(pt, vec2())),
            );
        }
        else {
            const scale = m.getScale();
            return new Rect(this.pos.add(m.getTranslation()), this.width * scale.x, this.height * scale.y);
        }
    }
    bbox(): Rect {
        return this.clone();
    }
    area(): number {
        return this.width * this.height;
    }
    clone(): Rect {
        return new Rect(this.pos.clone(), this.width, this.height);
    }
    distToPoint(p: Vec2): number {
        return Math.sqrt(this.sdistToPoint(p));
    }
    sdistToPoint(p: Vec2): number {
        const min = this.pos;
        const max = this.pos.add(this.width, this.height);
        const dx = Math.max(min.x - p.x, 0, p.x - max.x);
        const dy = Math.max(min.y - p.y, 0, p.y - max.y);
        return dx * dx + dy * dy;
    }
    collides(shape: ShapeType | Vec2): boolean {
        return testRectShape(this, shape);
    }
    contains(point: Vec2): boolean {
        return this.collides(point);
    }
    raycast(origin: Vec2, direction: Vec2): RaycastResult {
        // Further type checking is needed here @mflerackers
        // @ts-ignore
        return raycastRect(origin, direction, this);
    }
    random(): Vec2 {
        return this.pos.add(rand(this.width), rand(this.height));
    }
}

/**
 * @group Math
 */
export class Circle {
    center: Vec2;
    radius: number;
    constructor(center: Vec2, radius: number) {
        this.center = center.clone();
        this.radius = radius;
    }
    transform(tr: Mat23): Ellipse {
        return new Ellipse(this.center, this.radius, this.radius).transform(tr);
    }
    bbox(): Rect {
        return Rect.fromPoints(
            this.center.sub(vec2(this.radius)),
            this.center.add(vec2(this.radius)),
        );
    }
    area(): number {
        return this.radius * this.radius * Math.PI;
    }
    clone(): Circle {
        return new Circle(this.center, this.radius);
    }
    collides(shape: ShapeType | Vec2): boolean {
        return testCircleShape(this, shape);
    }
    contains(point: Vec2): boolean {
        return this.collides(point);
    }
    raycast(origin: Vec2, direction: Vec2): RaycastResult {
        return raycastCircle(origin, direction, this);
    }
    random(): Vec2 {
        // TODO: Not uniform!!
        return this.center.add(
            Vec2.fromAngle(rand(360)).scale(rand(this.radius)),
        );
    }
}

/**
 * @group Math
 */
export class Ellipse {
    center: Vec2;
    radiusX: number;
    radiusY: number;
    angle: number;
    constructor(center: Vec2, rx: number, ry: number, degrees: number = 0) {
        this.center = center.clone();
        this.radiusX = rx;
        this.radiusY = ry;
        this.angle = degrees;
    }
    static fromMat2(tr: Mat2): Ellipse {
        const inv = tr.inverse;
        const M = inv.transpose.mul(inv);
        const [e1, e2] = M.eigenvalues;
        const [v1, v2] = M.eigenvectors(e1, e2);

        const [a, b] = [1 / Math.sqrt(e1), 1 / Math.sqrt(e2)];

        // Make sure we use the semi-major axis for the rotation
        if (a > b) {
            return new Ellipse(
                vec2(),
                a,
                b,
                rad2deg(Math.atan2(-v1[1], v1[0])),
            );
        }
        else {
            return new Ellipse(
                vec2(),
                b,
                a,
                rad2deg(Math.atan2(-v2[1], v2[0])),
            );
        }
    }
    toMat2(): Mat2 {
        const a = deg2rad(this.angle);
        const c = Math.cos(a);
        const s = Math.sin(a);
        return new Mat2(
            c * this.radiusX,
            -s * this.radiusY,
            s * this.radiusX,
            c * this.radiusY,
        );
    }
    transform(tr: Mat23): Ellipse {
        if (this.angle == 0 && tr.getRotation() == 0) {
            // No rotation, so we can just take the scale and translation
            return new Ellipse(
                tr.transformPoint(this.center, vec2()),
                tr.a * this.radiusX,
                tr.d * this.radiusY,
            );
        }
        else {
            // Rotation. We can't just add angles, as the scale can squeeze the
            // ellipse and thus change the angle.
            // Get the transformation which maps the unit circle onto the ellipse
            let T = this.toMat2();
            // Transform the transformation matrix with the rotation+scale matrix
            const angle = tr.getRotation();
            const scale = tr.getScale();
            const M = Mat3.fromMat2(T).scale(scale.x, scale.y).rotate(angle);
            T = M.toMat2();
            // Return the ellipse made from the transformed unit circle
            const ellipse = Ellipse.fromMat2(T);
            ellipse.center = tr.transformPoint(this.center, vec2());
            return ellipse;
        }
    }
    bbox(): Rect {
        if (this.angle == 0) {
            // No rotation, so the semi-major and semi-minor axis give the extends
            return Rect.fromPoints(
                this.center.sub(vec2(this.radiusX, this.radiusY)),
                this.center.add(vec2(this.radiusX, this.radiusY)),
            );
        }
        else {
            // Rotation. We need to find the maximum x and y distance from the
            // center of the rotated ellipse
            const angle = deg2rad(this.angle);
            const c = Math.cos(angle);
            const s = Math.sin(angle);
            const ux = this.radiusX * c;
            const uy = this.radiusX * s;
            const vx = this.radiusY * s;
            const vy = this.radiusY * c;

            const halfwidth = Math.sqrt(ux * ux + vx * vx);
            const halfheight = Math.sqrt(uy * uy + vy * vy);

            return Rect.fromPoints(
                this.center.sub(vec2(halfwidth, halfheight)),
                this.center.add(vec2(halfwidth, halfheight)),
            );
        }
    }
    area(): number {
        return this.radiusX * this.radiusY * Math.PI;
    }
    clone(): Ellipse {
        return new Ellipse(this.center, this.radiusX, this.radiusY, this.angle);
    }
    collides(shape: ShapeType): boolean {
        return testEllipseShape(this, shape);
    }
    contains(point: Vec2): boolean {
        // Both methods work, but the second one is faster
        /*let T = this.toTransform()
        point = point.sub(this.center)
        point = T.inverse.transform(point)
        return testCirclePoint(new Circle(vec2(), 1), point)*/
        point = point.sub(this.center);
        const angle = deg2rad(this.angle);
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const vx = point.x * c + point.y * s;
        const vy = -point.x * s + point.y * c;
        return vx * vx / (this.radiusX * this.radiusX)
            + vy * vy / (this.radiusY * this.radiusY) < 1;
    }
    raycast(origin: Vec2, direction: Vec2): RaycastResult {
        return raycastEllipse(origin, direction, this);
    }
    random(): Vec2 {
        return this.center;
    }
}

function segmentLineIntersection(a: Vec2, b: Vec2, c: Vec2, d: Vec2) {
    const ab = b.sub(a);
    const cd = d.sub(c);
    let s = ab.cross(cd);
    if (s < 0.00001 && s > -0.00001) return null;
    const ac = c.sub(a);
    s = ac.cross(cd) / s;
    if (s < 0 || s > 1) return null;
    return a.add(ab.scale(s));
}

/**
 * @group Math
 */
export class Polygon {
    pts: Vec2[];
    constructor(pts: Vec2[]) {
        if (pts.length < 3) {
            throw new Error("Polygons should have at least 3 vertices");
        }
        this.pts = pts;
    }
    transform(m: Mat23): Polygon {
        return new Polygon(this.pts.map((pt) => m.transformPoint(pt, vec2())));
    }
    bbox(): Rect {
        const p1 = vec2(Number.MAX_VALUE);
        const p2 = vec2(-Number.MAX_VALUE);
        for (const pt of this.pts) {
            p1.x = Math.min(p1.x, pt.x);
            p2.x = Math.max(p2.x, pt.x);
            p1.y = Math.min(p1.y, pt.y);
            p2.y = Math.max(p2.y, pt.y);
        }
        return Rect.fromPoints(p1, p2);
    }
    area(): number {
        let total = 0;
        const l = this.pts.length;
        for (let i = 0; i < l; i++) {
            const p1 = this.pts[i];
            const p2 = this.pts[(i + 1) % l];
            total += p1.x * p2.y * 0.5;
            total -= p2.x * p1.y * 0.5;
        }
        return Math.abs(total);
    }
    clone(): Polygon {
        return new Polygon(this.pts.map((pt) => pt.clone()));
    }
    collides(shape: ShapeType | Vec2): boolean {
        return testPolygonShape(this, shape);
    }
    contains(point: Vec2): boolean {
        return this.collides(point);
    }
    raycast(origin: Vec2, direction: Vec2): RaycastResult {
        return raycastPolygon(origin, direction, this);
    }
    random(): Vec2 {
        /**
         * TODO:
         * - cut into triangles
         * - choose a random triangle with probability linked to surface area
         * - choose a random point in the triangle
         */
        return vec2();
    }
    cut(a: Vec2, b: Vec2): [Polygon | null, Polygon | null] {
        const surfaceLine = new Line(a, b);
        const left: Array<Vec2> = [];
        const right: Array<Vec2> = [];
        const ab = b.sub(a);
        let prev = this.pts[this.pts.length - 1];
        let ap = prev.sub(a);
        let wasLeft = ab.cross(ap) > 0;
        this.pts.forEach(p => {
            ap = p.sub(a);
            const isLeft = ab.cross(ap) > 0;
            if (wasLeft != isLeft) {
                // Since the points are on opposite sides of the line, we know they intersect
                const intersection = segmentLineIntersection(prev, p, a, b);
                left.push(intersection!);
                right.push(intersection!);
                wasLeft = isLeft;
            }
            (isLeft ? left : right).push(p);
            prev = p;
        });
        return [
            left.length ? new Polygon(left) : null,
            right.length ? new Polygon(right) : null,
        ];
    }
}

export function evaluateQuadratic(
    pt1: Vec2,
    pt2: Vec2,
    pt3: Vec2,
    t: number,
) {
    const t2 = t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    return pt1.scale(mt2).add(pt2.scale(2 * mt * t)).add(
        pt3.scale(t2),
    );
}

export function evaluateQuadraticFirstDerivative(
    pt1: Vec2,
    pt2: Vec2,
    pt3: Vec2,
    t: number,
) {
    const mt = 1 - t;
    return pt2.sub(pt1).scale(2 * mt).add(pt3.sub(pt2).scale(2 * t));
}

export function evaluateQuadraticSecondDerivative(
    pt1: Vec2,
    pt2: Vec2,
    pt3: Vec2,
    t: number,
) {
    return pt3.sub(pt2.scale(2)).add(pt1).scale(2);
}

export function evaluateBezier(
    pt1: Vec2,
    pt2: Vec2,
    pt3: Vec2,
    pt4: Vec2,
    t: number,
) {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    return pt1.scale(mt3).add(pt2.scale(3 * mt2 * t)).add(
        pt3.scale(3 * mt * t2),
    ).add(pt4.scale(t3));
}

export function evaluateBezierFirstDerivative(
    pt1: Vec2,
    pt2: Vec2,
    pt3: Vec2,
    pt4: Vec2,
    t: number,
) {
    const t2 = t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    return pt2.sub(pt1).scale(3 * mt2).add(pt3.sub(pt2).scale(6 * mt * t)).add(
        pt4.sub(pt3).scale(3 * t2),
    );
}

export function evaluateBezierSecondDerivative(
    pt1: Vec2,
    pt2: Vec2,
    pt3: Vec2,
    pt4: Vec2,
    t: number,
) {
    const mt = 1 - t;
    return pt3.sub(pt2.scale(2)).add(pt1).scale(6 * mt).add(
        pt4.sub(pt3.scale(2)).add(pt2).scale(6 * t),
    );
}

export function evaluateCatmullRom(
    pt1: Vec2,
    pt2: Vec2,
    pt3: Vec2,
    pt4: Vec2,
    t: number,
) {
    const A = 0.5 * (((-t + 2) * t - 1) * t);
    const B = 0.5 * (((3 * t - 5) * t) * t + 2);
    const C = 0.5 * (((-3 * t + 4) * t + 1) * t);
    const D = 0.5 * (((t - 1) * t) * t);
    return pt1.scale(A).add(pt2.scale(B)).add(pt3.scale(C)).add(pt4.scale(D));
}

export function evaluateCatmullRomFirstDerivative(
    pt1: Vec2,
    pt2: Vec2,
    pt3: Vec2,
    pt4: Vec2,
    t: number,
) {
    const A = 0.5 * ((-3 * t + 4) * t - 1);
    const B = 0.5 * ((9 * t - 10) * t);
    const C = 0.5 * ((-9 * t + 8) * t + 1);
    const D = 0.5 * ((3 * t - 2) * t);
    return pt1.scale(A).add(pt2.scale(B)).add(pt3.scale(C)).add(pt4.scale(D));
}

export function normalizedCurve(curve: (t: number) => Vec2) {
    const curveLength = curveLengthApproximation(curve);
    const length = curveLength(1);
    return (s: number) => {
        const l = s * length;
        const t = curveLength(l, true);
        return curve(t);
    };
}

export function curveLengthApproximation(
    curve: (t: number) => Vec2,
    entries: number = 10,
    detail: number = 10,
) {
    const llut = [0];
    const tlut = [0];
    const dt = 1 / (entries - 1);
    const ddt = dt / detail;
    let length = 0;
    let pp = curve(0);
    let t = 0;
    for (let e = 1; e < entries; e++) {
        for (let d = 0; d < detail; d++) {
            t += ddt;
            const p = curve(t);
            const l = p.dist(pp);
            length += l;
            pp = p;
        }
        llut[e] = length;
        tlut[e] = t;
    }
    tlut[entries - 1] = 1;
    return (t: number, inverse: boolean = false) => {
        if (inverse) {
            const l = t;
            if (l <= 0) return 0;
            if (l >= length) return 1;
            let index = 0;
            while (llut[index + 1] < l) index++;
            const t1 = tlut[index];
            const t2 = tlut[index + 1];
            const l1 = llut[index];
            const l2 = llut[index + 1];
            const a = (l - l1) / (l2 - l1);
            return t1 + (t2 - t1) * a;
        }
        else {
            if (t <= 0) return 0;
            if (t >= 1) return llut[entries - 1];
            let index = 0;
            while (tlut[index + 1] < t) index++;
            const t1 = tlut[index];
            const t2 = tlut[index + 1];
            const l1 = llut[index];
            const l2 = llut[index + 1];
            const a = (t - t1) / (t2 - t1);
            return l1 + (l2 - l1) * a;
        }
    };
}

/**
 * A second order function returning an evaluator for the given 1D Hermite curve
 * @param pt1 First point
 * @param m1 First control point (tangent)
 * @param m2 Second control point (tangent)
 * @param pt2 Second point
 * @returns A function which gives the value on the 1D Hermite curve at t
 */
export function hermite(pt1: number, m1: number, m2: number, pt2: number) {
    const A = 2 * pt1 + m1 - 2 * pt2 + m2;
    const B = -3 * pt1 + 3 * pt2 - 2 * m1 - m2;
    const C = m1;
    const D = pt1;

    return (t: number) => {
        const t2 = t * t;
        const t3 = t2 * t;
        return A * t3 + B * t2 + C * t + D;
    };
}

/**
 * A second order function returning an evaluator for the given 2D Cardinal curve
 * @param pt1 Previous point
 * @param pt2 First point
 * @param pt3 Second point
 * @param pt4 Next point
 * @param tension The tension of the curve, [0..1] from round to tight.
 * @param h The hermite function or one of its derivatives.
 * @returns A function which gives the value on the 2D Cardinal curve at t
 */
export function cardinal(
    pt1: Vec2,
    pt2: Vec2,
    pt3: Vec2,
    pt4: Vec2,
    tension: number,
    h = hermite,
) {
    const hx = h(
        pt2.x,
        (1 - tension) * (pt3.x - pt1.x),
        (1 - tension) * (pt4.x - pt2.x),
        pt3.x,
    );
    const hy = h(
        pt2.y,
        (1 - tension) * (pt3.y - pt1.y),
        (1 - tension) * (pt4.y - pt2.y),
        pt3.y,
    );
    return (t: number) => {
        return new Vec2(hx(t), hy(t));
    };
}

/**
 * A second order function returning an evaluator for the given 2D Catmull-Rom curve
 * @param pt1 Previous point
 * @param pt2 First point
 * @param pt3 Second point
 * @param pt4 Next point
 * @returns A function which gives the value on the 2D Catmull-Rom curve at t
 */
export function catmullRom(
    pt1: Vec2,
    pt2: Vec2,
    pt3: Vec2,
    pt4: Vec2,
    h = hermite,
) {
    // A Catmull-Rom curve is a Cardinal curve with as tension 0.5
    return cardinal(pt1, pt2, pt3, pt4, 0.5, h);
}

/**
 * A second order function returning an evaluator for the given 2D quadratic Bezier curve
 * @param pt1 First point
 * @param pt2 First control point
 * @param pt3 Second control point
 * @param pt4 Second point
 * @returns A function which gives the value on the 2D quadratic Bezier curve at t
 */
export function bezier(
    pt1: Vec2,
    pt2: Vec2,
    pt3: Vec2,
    pt4: Vec2,
    h = hermite,
) {
    // Convert the Bezier to a Catmull-Rom curve
    return catmullRom(
        pt4.add(pt1.sub(pt2).scale(6)),
        pt1,
        pt4,
        pt1.add(pt4.sub(pt3).scale(6)),
        h,
    );
}

/**
 * A second order function returning an evaluator for the given 2D Kochanek–Bartels curve
 * @param pt1 Previous point
 * @param pt2 First point
 * @param pt3 Second point
 * @param pt4 Next point
 * @param tension The tension of the curve, [-1..1] from round to tight.
 * @param continuity The continuity of the curve, [-1..1] from box corners to inverted corners.
 * @param bias The bias of the curve, [-1..1] from pre-shoot to post-shoot.
 * @returns A function which gives the value on the 2D Kochanek–Bartels curve at t
 */
export function kochanekBartels(
    pt1: Vec2,
    pt2: Vec2,
    pt3: Vec2,
    pt4: Vec2,
    tension: number,
    continuity: number,
    bias: number,
    h = hermite,
) {
    const hx = h(
        pt2.x,
        0.5 * (1 - tension) * (1 + bias) * (1 + continuity) * (pt2.x - pt1.x)
        + 0.5 * (1 - tension) * (1 - bias) * (1 - continuity)
        * (pt3.x - pt2.x),
        0.5 * (1 - tension) * (1 + bias) * (1 - continuity) * (pt3.x - pt2.x)
        + 0.5 * (1 - tension) * (1 - bias) * (1 + continuity)
        * (pt4.x - pt3.x),
        pt3.x,
    );
    const hy = h(
        pt2.y,
        0.5 * (1 - tension) * (1 + bias) * (1 + continuity) * (pt2.y - pt1.y)
        + 0.5 * (1 - tension) * (1 - bias) * (1 - continuity)
        * (pt3.y - pt2.y),
        0.5 * (1 - tension) * (1 + bias) * (1 - continuity) * (pt3.y - pt2.y)
        + 0.5 * (1 - tension) * (1 - bias) * (1 + continuity)
        * (pt4.y - pt3.y),
        pt3.y,
    );
    return (t: number) => {
        return new Vec2(hx(t), hy(t));
    };
}

/**
 * A second order function returning an evaluator for the derivative of the given 1D Hermite curve
 * @param pt1 First point
 * @param m1 First control point (tangent)
 * @param m2 Second control point (tangent)
 * @param pt2 Second point
 * @returns A function which gives the first derivative on the 1D Hermite curve at t
 */
export function hermiteFirstDerivative(
    pt1: number,
    m1: number,
    m2: number,
    pt2: number,
) {
    const A = 2 * pt1 + m1 - 2 * pt2 + m2;
    const B = -3 * pt1 + 3 * pt2 - 2 * m1 + m2;
    const C = m1;

    return (t: number) => {
        const t2 = t * t;
        return 3 * A * t2 + 2 * B * t + C;
    };
}

// True if t is between 0 and 1
function inZeroOneDomain(t: number) {
    return 0 <= t && t <= 1;
}

// True if a and b are almost equal
function approximately(a: number, b: number) {
    return Math.abs(a - b) <= Number.EPSILON;
}

// Calculates the cube root ∛ of the given number
function cubeRoot(v: number) {
    if (v < 0) {
        return -Math.pow(-v, 1 / 3);
    }
    else {
        return Math.pow(v, 1 / 3);
    }
}

// Get all cubic roots of the given 1 dimensional bezier
function getCubicRoots(pa: number, pb: number, pc: number, pd: number) {
    let a = 3 * pa - 6 * pb + 3 * pc;
    let b = -3 * pa + 3 * pb;
    let c = pa;
    let d = -pa + 3 * pb - 3 * pc + pd;

    if (approximately(d, 0)) {
        if (approximately(a, 0)) {
            if (approximately(b, 0)) {
                return [];
            }
            return [-c / b].filter(inZeroOneDomain);
        }
        const q = Math.sqrt(b * b - 4 * a * c);
        const a2 = 2 * a;
        return [(q - b) / a2, (-b - q) / a2].filter(inZeroOneDomain);
    }

    a /= d;
    b /= d;
    c /= d;

    const p = (3 * b - a * a) / 3;
    const p3 = p / 3;
    const q = (2 * a * a * a - 9 * a * b + 27 * c) / 27;
    const q2 = q / 2;
    const discriminant = q2 * q2 + p3 * p3 * p3;

    if (discriminant < 0) {
        const mp3 = -p / 3;
        const mp33 = mp3 * mp3 * mp3;
        const r = Math.sqrt(mp33);
        const t = -q / (2 * r);
        const cosphi = t < -1 ? -1 : t > 1 ? 1 : t;
        const phi = Math.acos(cosphi);
        const crtr = cubeRoot(r);
        const t1 = 2 * crtr;
        const root1 = t1 * Math.cos(phi / 3) - a / 3;
        const root2 = t1 * Math.cos((phi + 2 * Math.PI) / 3) - a / 3;
        const root3 = t1 * Math.cos((phi + 4 * Math.PI) / 3) - a / 3;
        return [root1, root2, root3].filter(inZeroOneDomain);
    }

    if (discriminant === 0) {
        const u1 = q2 < 0 ? cubeRoot(-q2) : -cubeRoot(q2);
        const root1 = 2 * u1 - a / 3;
        const root2 = -u1 - a / 3;
        return [root1, root2].filter(inZeroOneDomain);
    }

    const sd = Math.sqrt(discriminant);
    const u1 = cubeRoot(sd - q2);
    const v1 = cubeRoot(sd + q2);
    const root1 = u1 - v1 - a / 3;
    return [root1].filter(inZeroOneDomain);
}

// Returns y for the given x on the cubic bezier by first calculating the t for the given x, then calculating y from t
function cubicBezierYforX(a: Vec2, b: Vec2, c: Vec2, d: Vec2, x: number) {
    // Get t for x
    const t = getCubicRoots(a.x - x, b.x - x, c.x - x, d.x - x);
    if (t.length > 0) {
        // Get y for t
        return evaluateBezier(a, b, c, d, t[0]).y;
    }
    return NaN;
}

export function easingLinear(keys: Vec2[]) {
    if (!keys || keys.length == 0) {
        throw new Error(
            "Need at least one point for easingLinear.",
        );
    }
    const len = keys.length;
    return (x: number) => {
        // Before start
        if (x <= 0 || keys.length == 1 || x <= keys[0].x) {
            return keys[0].y;
        }
        for (let i = 0; i < len; i++) {
            if (keys[i].x >= x) {
                // Linear map
                return map(
                    x,
                    keys[i - 1].x,
                    keys[i].x,
                    keys[i - 1].y,
                    keys[i].y,
                );
            }
        }
        // After end
        return keys[keys.length - 1].y;
    };
}

export function easingCubicBezier(p1: Vec2, p2: Vec2) {
    return (x: number) => {
        return cubicBezierYforX(vec2(0, 0), p1, p2, vec2(1, 1), x);
    };
}

export type StepPosition =
    | "jump-start"
    | "jump-end"
    | "jump-none"
    | "jump-both";

export function easingSteps(
    steps: number,
    position: StepPosition = "jump-end",
) {
    const xdist = 1 / steps;
    const jumpStart = position == "jump-start" || position == "jump-both";
    const jumpEnd = position == "jump-end" || position == "jump-both";
    const ydist = 1 / (steps + (jumpEnd ? 1 : 0));
    const startY = jumpStart ? ydist : 0;
    return (x: number) => {
        const step = Math.floor(x / xdist);
        return startY + step * ydist;
    };
}

// true if the angle is oriented counter clockwise
function isOrientedCcw(a: Vec2, b: Vec2, c: Vec2) {
    // return det(b-a, c-a) >= 0
    return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) >= 0;
}

// true if the polygon is oriented counter clockwise
function isOrientedCcwPolygon(polygon: Vec2[]) {
    let total = 0;
    let prev: Vec2 = polygon[polygon.length - 1];
    for (let i = 0; i < polygon.length; i++) {
        total += (polygon[i].x - prev.x) * (polygon[i].y + prev.y);
        prev = polygon[i];
    }
    return total < 0;
}

// true if a and b are on the same side of the line c->d
function onSameSide(a: Vec2, b: Vec2, c: Vec2, d: Vec2) {
    const px = d.x - c.x, py = d.y - c.y;
    // return det(p, a-c) * det(p, b-c) >= 0
    const l = px * (a.y - c.y) - py * (a.x - c.x);
    const m = px * (b.y - c.y) - py * (b.x - c.x);
    return l * m >= 0;
}

// true if p is contained in the triangle abc
function pointInTriangle(p: Vec2, a: Vec2, b: Vec2, c: Vec2) {
    return onSameSide(p, a, b, c) && onSameSide(p, b, a, c)
        && onSameSide(p, c, a, b);
}

// true if any vertex in the list `vertices' is in the triangle abc.
function someInTriangle(vertices: Vec2[], a: Vec2, b: Vec2, c: Vec2) {
    for (const p of vertices) {
        if (
            (p !== a) && (p !== b) && (p !== c) && pointInTriangle(p, a, b, c)
        ) {
            return true;
        }
    }

    return false;
}

// true if the triangle is an ear, which is whether it can be cut off from the polygon without leaving a hole behind
function isEar(a: Vec2, b: Vec2, c: Vec2, vertices: Vec2[]) {
    return isOrientedCcw(a, b, c) && !someInTriangle(vertices, a, b, c);
}

export function triangulate(pts: Vec2[]): Vec2[][] {
    if (pts.length < 3) {
        return [];
    }
    if (pts.length == 3) {
        return [pts];
    }

    /* Create a list of indexes to the previous and next points of a given point
    prev_idx[i] gives the index to the previous point of the point at i */
    let nextIdx = [];
    let prevIdx = [];
    let idx = 0;
    for (let i = 0; i < pts.length; i++) {
        const lm = pts[idx];
        const pt = pts[i];
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
        [nextIdx, prevIdx] = [prevIdx, nextIdx];
    }

    const concaveVertices = [];
    for (let i = 0; i < pts.length; ++i) {
        if (!isOrientedCcw(pts[prevIdx[i]], pts[i], pts[nextIdx[i]])) {
            concaveVertices.push(pts[i]);
        }
    }

    const triangles = [];
    let nVertices = pts.length;
    let current = 1;
    let skipped = 0;
    let next;
    let prev;
    while (nVertices > 3) {
        next = nextIdx[current];
        prev = prevIdx[current];
        const a = pts[prev];
        const b = pts[current];
        const c = pts[next];
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

export function isConvex(pts: Vec2[]) {
    if (pts.length < 3) {
        return false;
    }

    // a polygon is convex if all corners turn in the same direction
    // turning direction can be determined using the cross-product of
    // the forward difference vectors
    let i = pts.length - 2;
    let j = pts.length - 1;
    let k = 0;
    let p = pts[j].sub(pts[i]);
    let q = pts[k].sub(pts[j]);
    let winding = p.cross(q);

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

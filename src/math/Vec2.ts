import { _k } from "../shared";
import { lerpNumber } from "./lerpNumber";
import type { Mat4 } from "./Mat4";
import { deg2rad, rad2deg, Rect, vec2, type Vec2Args } from "./math";

/**
 * A serialized 2d vector.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedVec2 {
    x: number;
    y: number;
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

    /** Set the X and Y of this vector */
    set(x: number, y: number): Vec2 {
        this.x = x;
        this.y = y;
        return this;
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
     * @param v - The first term
     * @param x - The x of the second term
     * @param y - The y of the second term
     * @param out - The vector sum
     *
     * @returns The sum of the vectors
     */
    static addc(v: Vec2, x: number, y: number, out: Vec2): Vec2 {
        out.x = v.x + x;
        out.y = v.y + y;
        return out;
    }

    /**
     * Calculates the sum of the vectors
     * @param v - The first term
     * @param other - The second term
     * @param out - The vector sum
     *
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
     * @param v - The first term
     * @param x - The x of the second term
     * @param y - The y of the second term
     * @param out - The vector difference
     *
     * @returns The difference of the vectors
     */
    static subc(v: Vec2, x: number, y: number, out: Vec2): Vec2 {
        out.x = v.x - x;
        out.y = v.y - y;
        return out;
    }

    /**
     * Calculates the difference of the vectors
     * @param v - The first term
     * @param other - The second term
     * @param out - The vector difference
     *
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
     * @param v - The vector
     * @param x - The x scale
     * @param y - The y scale
     * @param out - The scaled vector
     *
     * @returns The scale of the vector
     */
    static scale(v: Vec2, s: number, out: Vec2): Vec2 {
        out.x = v.x * s;
        out.y = v.y * s;
        return out;
    }

    /**
     * Calculates the scale of the vector
     * @param v - The vector
     * @param x - The x scale
     * @param y - The y scale
     * @param out - The scaled vector
     *
     * @returns The scale of the vector
     */
    static scalec(v: Vec2, x: number, y: number, out: Vec2): Vec2 {
        out.x = v.x * x;
        out.y = v.y * y;
        return out;
    }

    /**
     * Calculates the scale of the vector
     * @param v - The vector
     * @param other - The scale
     * @param out - The scaled vector
     *
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
     * @param v - The vector
     * @param other - The other vector
     *
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
     * @param v - The vector
     * @param other - The other vector
     *
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
     * @param v - The vector
     *
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
     * @param v - The vector
     *
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
        if (len === 0) {
            out.x = 0;
            out.y = 0;
            return out;
        }
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
     * @param v - The vector
     * @param dir - The rotation vector
     * @param out - The rotated vector
     *
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
     * @param v - The vector
     * @param angle - The angle in radians
     * @param out - The rotated vector
     *
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
     * @param v - The vector
     * @param dir - The rotation vector
     * @param out - The rotated vector
     *
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
        return v.x * other.x + v.y * other.y;
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
     * @param v - The vector
     *
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
     * @param v - First vector
     * @param other - Second vector
     *
     * @returns Angle between the vectors in radians
     */
    static angleBetween(v: Vec2, other: Vec2) {
        return Math.atan2(Vec2.cross(v, other), Vec2.dot(v, other));
    }

    /**
     * Linear interpolate to a destination vector (for positions).
     */
    lerp(dest: Vec2, t: number): Vec2 {
        return new Vec2(
            lerpNumber(this.x, dest.x, t),
            lerpNumber(this.y, dest.y, t),
        );
    }

    /**
     * Linear interpolate src and dst by t
     * @param src - First vector
     * @param dst - Second vector
     * @param t - Percentage
     * @param out - The linear interpolation between src and dst by t
     *
     * @returns The linear interpolation between src and dst by t
     */
    static lerp(src: Vec2, dst: Vec2, t: number, out: Vec2): Vec2 {
        out.x = src.x + (dst.x - src.x) * t;
        out.y = src.y + (dst.y - src.y) * t;
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
     * @param src - First vector
     * @param dst - Second vector
     * @param t - Percentage
     * @param out - The spherical interpolation between src and dst by t
     *
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

    serialize(): SerializedVec2 {
        return { x: this.x, y: this.y };
    }

    static deserialize(data: SerializedVec2): Vec2 {
        return vec2(data.x, data.y);
    }
}

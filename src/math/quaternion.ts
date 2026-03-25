import { Mat4 } from "./Mat4";
import { deg2rad } from "./math";
import { Vec3 } from "./vec3";

class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x: number, y: number, z: number, w: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    fromAxisAngle(axis: Vec3, angle: number) {
        axis = axis.unit();
        angle = deg2rad(angle);
        const s = Math.sin(angle / 2);
        return new Quaternion(
            axis.x * s,
            axis.y * s,
            axis.z * s,
            Math.cos(angle / 2),
        );
    }

    toMat4() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;

        return new Mat4([
            1 - 2 * y * y - 2 * z * z,
            2 * x * y - 2 * w * z,
            2 * x * z + 2 * w * y,
            0,
            2 * x * y + 2 * w * z,
            1 - 2 * x * x - 2 * z * z,
            2 * y * z - 2 * w * x,
            0,
            2 * x * z - 2 * w * y,
            2 * y * z + 2 * w * x,
            1 - 2 * x * x - 2 * y * y,
            0,
            0,
            0,
            0,
            1,
        ]);
    }

    add(other: Quaternion) {
        return new Quaternion(
            this.x + other.x,
            this.y + other.y,
            this.z + other.z,
            this.w + other.w,
        );
    }

    sub(other: Quaternion) {
        return new Quaternion(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z,
            this.w - other.w,
        );
    }

    mul(other: Quaternion) {
        return new Quaternion(
            this.x * other.w + this.y * other.z - this.z * other.y
                + this.w * other.x,
            -this.x * other.z + this.y * other.w + this.z * other.x
                + this.w * other.y,
            this.x * other.y - this.y * other.x + this.z * other.w
                + this.w * other.z,
            -this.x * other.x - this.y * other.y - this.z * other.z
                + this.w * other.w,
        );
    }

    div(other: Quaternion) {
        return this.mul(other.inv());
    }

    smul(scalar: number) {
        return new Quaternion(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar,
            this.w * scalar,
        );
    }

    sdiv(scalar: number) {
        return new Quaternion(
            this.x / scalar,
            this.y / scalar,
            this.z / scalar,
            this.w / scalar,
        );
    }

    slen() {
        return this.x * this.x + this.y * this.y + this.z * this.z
            + this.w * this.w;
    }

    len() {
        return Math.sqrt(this.slen());
    }

    unit() {
        return this.sdiv(this.len());
    }

    conj() {
        return new Quaternion(-this.x, -this.y, -this.z, this.w);
    }

    inv() {
        return this.conj().sdiv(this.slen());
    }

    eq(other: Quaternion) {
        return this.x === other.x && this.y === other.y && this.z === other.z
            && this.w === other.w;
    }

    slerp(other: Quaternion, t: number) {
        const cosHalfTheta = this.x * other.x + this.y * other.y
            + this.z * other.z + this.w * other.w;
        if (Math.abs(cosHalfTheta) >= 1) {
            return this.clone();
        }
        const halfTheta = Math.acos(cosHalfTheta);
        const sinHalfTheta = Math.sqrt(1 - cosHalfTheta * cosHalfTheta);
        if (Math.abs(sinHalfTheta) < 0.001) {
            return new Quaternion(
                this.x * 0.5 + other.x * 0.5,
                this.y * 0.5 + other.y * 0.5,
                this.z * 0.5 + other.z * 0.5,
                this.w * 0.5 + other.w * 0.5,
            );
        }
        const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
        const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
        return new Quaternion(
            this.x * ratioA + other.x * ratioB,
            this.y * ratioA + other.y * ratioB,
            this.z * ratioA + other.z * ratioB,
            this.w * ratioA + other.w * ratioB,
        );
    }

    rotate(p: Vec3) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return new Vec3(
            w * w * p.x + 2 * y * w * p.z - 2 * z * w * p.y + x * x * p.x
                + 2 * y * x * p.y + 2 * z * x * p.z - z * z * p.x - y * y * p.x,
            2 * x * y * p.x + y * y * p.y + 2 * z * y * p.z + 2 * w * z * p.x
                - z * z * p.y + w * w * p.y - 2 * x * w * p.z - x * x * p.y,
            2 * x * z * p.x + 2 * y * z * p.y + z * z * p.z - 2 * w * y * p.x
                - y * y * p.z + 2 * w * x * p.y - x * x * p.z + w * w * p.z,
        );
    }

    clone() {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }
}

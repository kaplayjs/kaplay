import { deg2rad, rad2deg } from "./math";
import { Vec2 } from "./Vec2";

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

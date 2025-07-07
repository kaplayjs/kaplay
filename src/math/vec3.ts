export class Vec3 {
    x: number;
    y: number;
    z: number;

    static LEFT    = new Vec3(-1,  0,  0);
    static RIGHT   = new Vec3( 1,  0,  0);
    static UP      = new Vec3( 0, -1,  0);
    static DOWN    = new Vec3( 0,  1,  0);
    static FORWARD = new Vec3( 0,  0,  1);
    static BACK    = new Vec3( 0,  0, -1);
    static ZERO    = new Vec3( 0,  0,  0);
    static ONE     = new Vec3( 1,  1,  1);

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    dot(other: Vec3) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    cross(other: Vec3) {
        return new Vec3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x,
        );
    }

    toAxis(): Vec3 {
        const ax = Math.abs(this.x);
        const ay = Math.abs(this.y);
        const az = Math.abs(this.z);

        if (ax >= ay && ax >= az) {
            return this.x < 0 ? Vec3.LEFT : Vec3.RIGHT;
        } else if (ay >= az) {
            return this.y < 0 ? Vec3.UP   : Vec3.DOWN;
        } else {
            return this.z < 0 ? Vec3.BACK : Vec3.FORWARD;
        }
    }
}

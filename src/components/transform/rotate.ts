import type { RotateComp } from "../../types";

export function rotate(r: number): RotateComp {
    return {
        id: "rotate",
        angle: r ?? 0,
        rotateBy(angle: number) {
            this.angle += angle;
        },
        rotateTo(angle: number) {
            this.angle = angle;
        },
        inspect() {
            return `${Math.round(this.angle)}`;
        },
    };
}

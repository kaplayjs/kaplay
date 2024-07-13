import { Mat4 } from "../math";
import type { GameObj } from "../types";

export function calcTransform(obj: GameObj): Mat4 {
    const tr = new Mat4();
    if (obj.pos) tr.translate(obj.pos);
    if (obj.scale) tr.scale(obj.scale);
    if (obj.angle) tr.rotate(obj.angle);
    return obj.parent ? tr.mult(obj.parent.transform) : tr;
}

import { height, width } from "../gfx";
import type { GameObj } from "../types";
import { deg2rad, Mat23, Vec2, vec2 } from "./math";

export function calcTransform(obj: GameObj, tr: Mat23): Mat23 {
    tr.setIdentity();
    if (obj.pos) tr.translateSelfV(obj.pos);
    if (obj.scale) tr.scaleSelfV(obj.scale);
    if (obj.angle) tr.rotateSelf(obj.angle);
    if (obj.parent) {
        tr.mulSelf(obj.parent.transform);
    }
    return tr;
}

// convert a screen space coordinate to webgl normalized device coordinate
export function screen2ndc(pt: Vec2, width: number, height: number, out: Vec2) {
    out.x = pt.x / width * 2 - 1;
    out.y = -pt.y / height * 2 + 1;
}

export function getArcPts(
    pos: Vec2,
    radiusX: number,
    radiusY: number,
    start: number,
    end: number,
    res: number = 1,
): Vec2[] {
    // normalize and turn start and end angles to radians
    start = deg2rad(start % 360);
    end = deg2rad(end % 360);
    if (end <= start) end += Math.PI * 2;

    const pts: Vec2[] = [];
    const nverts = Math.ceil((end - start) / deg2rad(8) * res);
    const step = (end - start) / nverts;

    // Rotate vector v by r nverts+1 times
    let v = vec2(Math.cos(start), Math.sin(start));
    const r = vec2(Math.cos(step), Math.sin(step));
    for (let i = 0; i <= nverts; i++) {
        pts.push(pos.add(radiusX * v.x, radiusY * v.y));
        // cos(a + b) = cos(a)cos(b) - sin(a)sin(b)
        // sin(a + b) = cos(a)sin(b) + sin(a)cos(b)
        v = vec2(v.x * r.x - v.y * r.y, v.x * r.y + v.y * r.x);
    }

    return pts;
}

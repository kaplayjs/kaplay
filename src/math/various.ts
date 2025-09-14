import type { GameObj } from "../types";
import { deg2rad, Mat23, vec2 } from "./math";
import { Vec2 } from "./Vec2";

export function calcTransform(obj: GameObj, tr: Mat23): Mat23 {
    if (obj.parent) {
        tr.setMat23(obj.parent.transform);
    }
    else {
        tr.setIdentity();
    }
    if (obj.pos) tr.translateSelfV(obj.pos);
    if (obj.angle) tr.rotateSelf(obj.angle);
    if (obj.scale) tr.scaleSelfV(obj.scale);
    return tr;
}

export function updateTransformRecursive(obj: GameObj) {
    calcTransform(obj, obj.transform);
    for (let i = 0; i < obj.children.length; i++) {
        updateTransformRecursive(obj.children[i]);
    }
}

export function updateChildrenTransformRecursive(obj: GameObj) {
    for (let i = 0; i < obj.children.length; i++) {
        updateTransformRecursive(obj.children[i]);
    }
}

export function clampAngle(angle: number) {
    angle = angle % 360;
    if (angle < -180) {
        angle += 360;
    }
    else if (angle > 180) {
        angle -= 360;
    }
    return angle;
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
    const isLoop = (end - start) == 0;
    if (end <= start) end += Math.PI * 2;

    const pts: Vec2[] = [];
    const nverts = Math.round(
        Math.sqrt(((radiusX + radiusY) / 2) * 20) * (end - start) / Math.PI * 2,
    ); // Math.ceil((end - start) / deg2rad(8) * res);
    const step = (end - start) / nverts;

    // Rotate vector v by r nverts+1 times
    let v = vec2(Math.cos(start), Math.sin(start));
    const r = vec2(Math.cos(step), Math.sin(step));
    for (let i = 0; i <= nverts; i++) {
        pts.push(pos.add(radiusX * v.x, radiusY * v.y));
        v = vec2(v.x * r.x - v.y * r.y, v.x * r.y + v.y * r.x);
    }

    // Make sure the endpoints match if it is a loop
    if (isLoop) {
        pts[pts.length - 1].x = pts[0].x;
        pts[pts.length - 1].y = pts[0].y;
    }

    return pts;
}

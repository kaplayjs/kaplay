"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcTransform = calcTransform;
exports.screen2ndc = screen2ndc;
exports.getArcPts = getArcPts;
var math_1 = require("./math");
function calcTransform(obj, tr) {
    if (obj.parent) {
        tr.setMat23(obj.parent.transform);
    }
    else {
        tr.setIdentity();
    }
    if (obj.pos) {
        tr.translateSelfV(obj.pos);
    }
    if (obj.angle) {
        tr.rotateSelf(obj.angle);
    }
    if (obj.scale) {
        tr.scaleSelfV(obj.scale);
    }
    return tr;
}
// convert a screen space coordinate to webgl normalized device coordinate
function screen2ndc(pt, width, height, out) {
    out.x = pt.x / width * 2 - 1;
    out.y = -pt.y / height * 2 + 1;
}
function getArcPts(pos, radiusX, radiusY, start, end, res) {
    if (res === void 0) res = 1;
    // normalize and turn start and end angles to radians
    start = (0, math_1.deg2rad)(start % 360);
    end = (0, math_1.deg2rad)(end % 360);
    var isLoop = (end - start) == 0;
    if (end <= start) {
        end += Math.PI * 2;
    }
    var pts = [];
    var nverts = Math.round(
        Math.sqrt(((radiusX + radiusY) / 2) * 20) * (end - start) / Math.PI * 2,
    ); // Math.ceil((end - start) / deg2rad(8) * res);
    var step = (end - start) / nverts;
    // Rotate vector v by r nverts+1 times
    var v = (0, math_1.vec2)(Math.cos(start), Math.sin(start));
    var r = (0, math_1.vec2)(Math.cos(step), Math.sin(step));
    for (var i = 0; i <= nverts; i++) {
        pts.push(pos.add(radiusX * v.x, radiusY * v.y));
        v = (0, math_1.vec2)(v.x * r.x - v.y * r.y, v.x * r.y + v.y * r.x);
    }
    // Make sure the endpoints match if it is a loop
    if (isLoop) {
        pts[pts.length - 1].x = pts[0].x;
        pts[pts.length - 1].y = pts[0].y;
    }
    return pts;
}

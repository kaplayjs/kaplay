"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawLine = drawLine;
exports._drawLinesBevel = _drawLinesBevel;
exports._drawLinesRound = _drawLinesRound;
exports._drawLinesMiter = _drawLinesMiter;
exports.drawLines = drawLines;
var color_1 = require("../../math/color");
var lerp_1 = require("../../math/lerp");
var math_1 = require("../../math/math");
var shared_1 = require("../../shared");
var drawRaw_1 = require("./drawRaw");
function drawLine(opt) {
    var _a, _b, _c;
    var p1 = opt.p1, p2 = opt.p2;
    if (!p1 || !p2) {
        throw new Error("drawLine() requires properties \"p1\" and \"p2\".");
    }
    var w = opt.width || 1;
    // the displacement from the line end point to the corner point
    var dis = p2.sub(p1).unit().normal().scale(w * 0.5);
    // calculate the 4 corner points of the line polygon
    /*const verts = [
        p1.sub(dis),
        p1.add(dis),
        p2.add(dis),
        p2.sub(dis),
    ].map((p) => ({
        pos: new Vec2(p.x, p.y),
        uv: new Vec2(0),
        color: opt.color ?? Color.WHITE,
        opacity: opt.opacity ?? 1,
    }));*/
    var color = (_a = opt.color) !== null && _a !== void 0 ? _a : color_1.Color.WHITE;
    var opacity = (_b = opt.opacity) !== null && _b !== void 0 ? _b : 1;
    var attributes = {
        pos: [
            p1.x - dis.x,
            p1.y - dis.y,
            p1.x + dis.x,
            p1.y + dis.y,
            p2.x + dis.x,
            p2.y + dis.y,
            p2.x - dis.x,
            p2.y - dis.y,
        ],
        uv: [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ],
        color: [
            color.r,
            color.g,
            color.b,
            color.r,
            color.g,
            color.b,
            color.r,
            color.g,
            color.b,
            color.r,
            color.g,
            color.b,
        ],
        opacity: [
            opacity,
            opacity,
            opacity,
            opacity,
        ],
    };
    (0, drawRaw_1.drawRaw)(attributes, [0, 1, 3, 1, 2, 3], opt.fixed, shared_1._k.gfx.defTex, opt.shader, (_c = opt.uniform) !== null && _c !== void 0 ? _c : undefined);
}
function _drawLinesBevel(opt) {
    var _a, _b;
    var pts = opt.pts;
    var vertices = [];
    var halfWidth = (opt.width || 1) * 0.5;
    var centerOffset = halfWidth
        * (0, lerp_1.lerp)(-1, 1, ((opt.bias || 0.0) + 1) * 0.5);
    var isLoop = pts[0] === pts[pts.length - 1]
        || pts[0].eq(pts[pts.length - 1]);
    var offset = opt.pos || (0, math_1.vec2)(0, 0);
    var segment;
    if (isLoop) {
        segment = pts[0].sub(pts[pts.length - 2]);
    }
    else {
        segment = pts[1].sub(pts[0]);
    }
    var length = segment.len();
    var normal = segment.normal().scale(1 / length);
    var pt1;
    var pt2 = pts[0];
    if (!isLoop) {
        switch (opt.cap) {
            case "square": {
                var dir = segment.scale(-halfWidth / length);
                vertices.push(pt2.add(dir).add(normal.scale(centerOffset - halfWidth)));
                vertices.push(pt2.add(dir).add(normal.scale(centerOffset + halfWidth)));
                break;
            }
            case "round": {
                var n = Math.max(halfWidth, 10);
                var angle = Math.PI / n;
                var vector = normal.scale(halfWidth);
                var cs = Math.cos(angle);
                var sn = Math.sin(angle);
                var p = pt2.add(normal.scale(centerOffset));
                for (var j = 0; j < n; j++) {
                    vertices.push(p);
                    vertices.push(p.sub(vector));
                    vector = (0, math_1.vec2)(vector.x * cs - vector.y * sn, vector.x * sn + vector.y * cs);
                }
            }
        }
    }
    for (var i = 1; i < pts.length; i++) {
        if (pt2 === pts[i] || pt2.eq(pts[i]))
            continue;
        pt1 = pt2;
        pt2 = pts[i];
        var nextSegment = pt2.sub(pt1);
        var nextLength = nextSegment.len();
        var nextNormal = nextSegment.normal().scale(1 / nextLength);
        var det = segment.cross(nextSegment);
        if (Math.abs(det) / (length * nextLength) < 0.05) {
            // Parallel
            vertices.push(pt1.add(normal.scale(centerOffset - halfWidth)));
            vertices.push(pt1.add(normal.scale(centerOffset + halfWidth)));
            if (segment.dot(nextSegment) < 0) {
                vertices.push(pt1.add(normal.scale(centerOffset + halfWidth)));
                vertices.push(pt1.add(normal.scale(centerOffset - halfWidth)));
            }
            segment = nextSegment;
            length = nextLength;
            normal = nextNormal;
            continue;
        }
        if (det > 0) {
            var lambda = (nextNormal.scale(centerOffset - halfWidth).sub(normal.scale(centerOffset - halfWidth))).cross(nextSegment) / det;
            var d = normal.scale(centerOffset - halfWidth).add(segment.scale(lambda));
            vertices.push(pt1.add(d));
            vertices.push(pt1.add(normal.scale(centerOffset + halfWidth)));
            vertices.push(pt1.add(d));
            vertices.push(pt1.add(nextNormal.scale(centerOffset + halfWidth)));
        }
        else {
            var lambda = (nextNormal.scale(centerOffset + halfWidth).sub(normal.scale(centerOffset + halfWidth))).cross(nextSegment) / det;
            var d = normal.scale(centerOffset + halfWidth).add(segment.scale(lambda));
            vertices.push(pt1.add(normal.scale(centerOffset - halfWidth)));
            vertices.push(pt1.add(d));
            vertices.push(pt1.add(nextNormal.scale(centerOffset - halfWidth)));
            vertices.push(pt1.add(d));
        }
        segment = nextSegment;
        length = nextLength;
        normal = nextNormal;
    }
    if (!isLoop) {
        vertices.push(pt2.add(normal.scale(centerOffset - halfWidth)));
        vertices.push(pt2.add(normal.scale(centerOffset + halfWidth)));
        switch (opt.cap) {
            case "square": {
                var dir = segment.scale(halfWidth / length);
                vertices.push(pt2.add(dir).add(normal.scale(centerOffset - halfWidth)));
                vertices.push(pt2.add(dir).add(normal.scale(centerOffset + halfWidth)));
                break;
            }
            case "round": {
                var n = Math.max(halfWidth, 10);
                var angle = Math.PI / n;
                var vector = normal.scale(halfWidth);
                var cs = Math.cos(angle);
                var sn = Math.sin(angle);
                var p = pt2.add(normal.scale(centerOffset));
                for (var j = 0; j < n; j++) {
                    vector = (0, math_1.vec2)(vector.x * cs - vector.y * sn, vector.x * sn + vector.y * cs);
                    vertices.push(p);
                    vertices.push(p.add(vector));
                }
            }
        }
    }
    if (vertices.length < 4)
        return;
    var indices = [];
    var index = 0;
    for (var i = 0; i < vertices.length - 2; i += 2) {
        indices[index++] = i + 1;
        indices[index++] = i;
        indices[index++] = i + 2;
        indices[index++] = i + 2;
        indices[index++] = i + 3;
        indices[index++] = i + 1;
    }
    if (isLoop) {
        indices[index++] = vertices.length - 1;
        indices[index++] = vertices.length - 2;
        indices[index++] = 0;
        indices[index++] = 0;
        indices[index++] = 1;
        indices[index++] = vertices.length - 1;
    }
    /*const verts = vertices.map(v => ({
        pos: offset.add(v),
        uv: vec2(),
        color: opt.color || Color.WHITE,
        opacity: opt.opacity ?? 1,
    }));*/
    var attributes = {
        pos: new Array(vertices.length * 2),
        uv: new Array(vertices.length * 2).fill(0),
        color: new Array(vertices.length * 3).fill(255),
        opacity: new Array(vertices.length).fill((_a = opt.opacity) !== null && _a !== void 0 ? _a : 1),
    };
    for (var i = 0; i < vertices.length; i++) {
        attributes.pos[i * 2] = vertices[i].x + offset.x;
        attributes.pos[i * 2 + 1] = vertices[i].y + offset.y;
        if (opt.color) {
            attributes.color[i * 3] = opt.color.r;
            attributes.color[i * 3 + 1] = opt.color.g;
            attributes.color[i * 3 + 2] = opt.color.b;
        }
    }
    (0, drawRaw_1.drawRaw)(attributes, indices, opt.fixed, shared_1._k.gfx.defTex, opt.shader, (_b = opt.uniform) !== null && _b !== void 0 ? _b : undefined);
}
function _drawLinesRound(opt) {
    var _a, _b;
    var pts = opt.pts;
    var vertices = [];
    var halfWidth = (opt.width || 1) * 0.5;
    var centerOffset = halfWidth * (0, lerp_1.lerp)(-1, 1, ((opt.bias || 0.0) + 1) * 0.5);
    var isLoop = pts[0] === pts[pts.length - 1]
        || pts[0].eq(pts[pts.length - 1]);
    var offset = opt.pos || (0, math_1.vec2)(0, 0);
    var segment;
    if (isLoop) {
        segment = pts[0].sub(pts[pts.length - 2]);
    }
    else {
        segment = pts[1].sub(pts[0]);
    }
    var length = segment.len();
    var normal = segment.normal().scale(1 / length);
    var pt1;
    var pt2 = pts[0];
    if (!isLoop) {
        switch (opt.cap) {
            case "square": {
                var dir = segment.scale(-halfWidth / length);
                vertices.push(pt2.add(dir).add(normal.scale(centerOffset - halfWidth)));
                vertices.push(pt2.add(dir).add(normal.scale(centerOffset + halfWidth)));
                break;
            }
            case "round": {
                var n = Math.max(halfWidth, 10);
                var angle = Math.PI / n;
                var vector = normal.scale(halfWidth);
                var cs = Math.cos(angle);
                var sn = Math.sin(angle);
                var p = pt2.add(normal.scale(centerOffset));
                for (var j = 0; j < n; j++) {
                    vertices.push(p);
                    vertices.push(p.sub(vector));
                    vector = (0, math_1.vec2)(vector.x * cs - vector.y * sn, vector.x * sn + vector.y * cs);
                }
            }
        }
    }
    for (var i = 1; i < pts.length; i++) {
        if (pt2 === pts[i] || pt2.eq(pts[i]))
            continue;
        pt1 = pt2;
        pt2 = pts[i];
        var nextSegment = pt2.sub(pt1);
        var nextLength = nextSegment.len();
        var nextNormal = nextSegment.normal().scale(1 / nextLength);
        var det = segment.cross(nextSegment);
        if (Math.abs(det) / (length * nextLength) < 0.05) {
            // Parallel
            vertices.push(pt1.add(normal.scale(centerOffset - halfWidth)));
            vertices.push(pt1.add(normal.scale(centerOffset + halfWidth)));
            if (segment.dot(nextSegment) < 0) {
                vertices.push(pt1.add(normal.scale(centerOffset + halfWidth)));
                vertices.push(pt1.add(normal.scale(centerOffset - halfWidth)));
            }
            segment = nextSegment;
            length = nextLength;
            normal = nextNormal;
            continue;
        }
        if (det > 0) {
            // Calculate the vector d from pt1 towards the intersection of the offset lines on the inner side
            var lambda = (nextNormal.scale(centerOffset - halfWidth).sub(normal.scale(centerOffset - halfWidth))).cross(nextSegment) / det;
            var d = normal.scale(centerOffset - halfWidth).add(segment.scale(lambda));
            var n = Math.max(halfWidth, 10);
            var angle = (0, math_1.deg2rad)(normal.angleBetween(nextNormal) / n);
            var vector = normal.scale(halfWidth * 2);
            var fixedPoint = pt1.add(d);
            var cs = Math.cos(angle);
            var sn = Math.sin(angle);
            for (var j = 0; j < n; j++) {
                vertices.push(fixedPoint);
                vertices.push(fixedPoint.add(vector));
                vector = (0, math_1.vec2)(vector.x * cs - vector.y * sn, vector.x * sn + vector.y * cs);
            }
        }
        else {
            // Calculate the vector d from pt1 towards the intersection of the offset lines on the inner side
            var lambda = (nextNormal.scale(centerOffset + halfWidth).sub(normal.scale(centerOffset + halfWidth))).cross(nextSegment) / det;
            var d = normal.scale(centerOffset + halfWidth).add(segment.scale(lambda));
            var n = Math.max(halfWidth, 10);
            var angle = (0, math_1.deg2rad)(normal.angleBetween(nextNormal) / n);
            var vector = normal.scale(halfWidth * 2);
            var fixedPoint = pt1.add(d);
            var cs = Math.cos(angle);
            var sn = Math.sin(angle);
            for (var j = 0; j < n; j++) {
                vertices.push(fixedPoint.sub(vector));
                vertices.push(fixedPoint);
                vector = (0, math_1.vec2)(vector.x * cs - vector.y * sn, vector.x * sn + vector.y * cs);
            }
        }
        segment = nextSegment;
        length = nextLength;
        normal = nextNormal;
    }
    if (!isLoop) {
        vertices.push(pt2.add(normal.scale(centerOffset - halfWidth)));
        vertices.push(pt2.add(normal.scale(centerOffset + halfWidth)));
        switch (opt.cap) {
            case "square": {
                var dir = segment.scale(halfWidth / length);
                vertices.push(pt2.add(dir).add(normal.scale(centerOffset - halfWidth)));
                vertices.push(pt2.add(dir).add(normal.scale(centerOffset + halfWidth)));
                break;
            }
            case "round": {
                var n = Math.max(halfWidth, 10);
                var angle = Math.PI / n;
                var vector = normal.scale(halfWidth);
                var cs = Math.cos(angle);
                var sn = Math.sin(angle);
                var p = pt2.add(normal.scale(centerOffset));
                for (var j = 0; j < n; j++) {
                    vector = (0, math_1.vec2)(vector.x * cs - vector.y * sn, vector.x * sn + vector.y * cs);
                    vertices.push(p);
                    vertices.push(p.add(vector));
                }
            }
        }
    }
    if (vertices.length < 4)
        return;
    var verts = vertices.map(function (v) {
        var _a;
        return ({
            pos: offset.add(v),
            uv: (0, math_1.vec2)(),
            color: opt.color || color_1.Color.WHITE,
            opacity: (_a = opt.opacity) !== null && _a !== void 0 ? _a : 1,
        });
    });
    var indices = [];
    var index = 0;
    for (var i = 0; i < vertices.length - 2; i += 2) {
        indices[index++] = i + 1;
        indices[index++] = i;
        indices[index++] = i + 2;
        indices[index++] = i + 2;
        indices[index++] = i + 3;
        indices[index++] = i + 1;
    }
    if (isLoop) {
        indices[index++] = vertices.length - 1;
        indices[index++] = vertices.length - 2;
        indices[index++] = 0;
        indices[index++] = 0;
        indices[index++] = 1;
        indices[index++] = vertices.length - 1;
    }
    var attributes = {
        pos: new Array(vertices.length * 2),
        uv: new Array(vertices.length * 2).fill(0),
        color: new Array(vertices.length * 3).fill(255),
        opacity: new Array(vertices.length).fill((_a = opt.opacity) !== null && _a !== void 0 ? _a : 1),
    };
    for (var i = 0; i < vertices.length; i++) {
        attributes.pos[i * 2] = vertices[i].x + offset.x;
        attributes.pos[i * 2 + 1] = vertices[i].y + offset.y;
        if (opt.color) {
            attributes.color[i * 3] = opt.color.r;
            attributes.color[i * 3 + 1] = opt.color.g;
            attributes.color[i * 3 + 2] = opt.color.b;
        }
    }
    (0, drawRaw_1.drawRaw)(attributes, indices, opt.fixed, shared_1._k.gfx.defTex, opt.shader, (_b = opt.uniform) !== null && _b !== void 0 ? _b : undefined);
}
function _drawLinesMiter(opt) {
    var _a, _b;
    var pts = opt.pts;
    var vertices = [];
    var halfWidth = (opt.width || 1) * 0.5;
    var centerOffset = halfWidth * (0, lerp_1.lerp)(-1, 1, ((opt.bias || 0.0) + 1) * 0.5);
    var isLoop = pts[0] === pts[pts.length - 1]
        || pts[0].eq(pts[pts.length - 1]);
    var offset = opt.pos || (0, math_1.vec2)(0, 0);
    var segment;
    if (isLoop) {
        segment = pts[0].sub(pts[pts.length - 2]);
    }
    else {
        segment = pts[1].sub(pts[0]);
    }
    var length = segment.len();
    var normal = segment.normal().scale(1 / length);
    var pt1;
    var pt2 = pts[0];
    if (!isLoop) {
        switch (opt.cap) {
            case "square": {
                var dir = segment.scale(-halfWidth / length);
                vertices.push(pt2.add(dir).add(normal.scale(centerOffset - halfWidth)));
                vertices.push(pt2.add(dir).add(normal.scale(centerOffset + halfWidth)));
                break;
            }
            case "round": {
                var n = Math.max(halfWidth, 10);
                var angle = Math.PI / n;
                var vector = normal.scale(halfWidth);
                var cs = Math.cos(angle);
                var sn = Math.sin(angle);
                var p = pt2.add(normal.scale(centerOffset));
                for (var j = 0; j < n; j++) {
                    vertices.push(p);
                    vertices.push(p.sub(vector));
                    vector = (0, math_1.vec2)(vector.x * cs - vector.y * sn, vector.x * sn + vector.y * cs);
                }
            }
        }
    }
    for (var i = 1; i < pts.length; i++) {
        if (pt2 === pts[i] || pt2.eq(pts[i]))
            continue;
        pt1 = pt2;
        pt2 = pts[i];
        var nextSegment = pt2.sub(pt1);
        var nextLength = nextSegment.len();
        var nextNormal = nextSegment.normal().scale(1 / nextLength);
        var det = segment.cross(nextSegment);
        if (Math.abs(det) / (length * nextLength) < 0.05) {
            // Parallel
            vertices.push(pt1.add(normal.scale(centerOffset - halfWidth)));
            vertices.push(pt1.add(normal.scale(centerOffset + halfWidth)));
            if (segment.dot(nextSegment) < 0) {
                vertices.push(pt1.add(normal.scale(centerOffset + halfWidth)));
                vertices.push(pt1.add(normal.scale(centerOffset - halfWidth)));
            }
            segment = nextSegment;
            length = nextLength;
            normal = nextNormal;
            continue;
        }
        var lambda = (nextNormal.scale(centerOffset - halfWidth).sub(normal.scale(centerOffset - halfWidth))).cross(nextSegment) / det;
        var d = normal.scale(centerOffset - halfWidth).add(segment.scale(lambda));
        vertices.push(pt1.add(d));
        lambda = (nextNormal.scale(centerOffset + halfWidth).sub(normal.scale(centerOffset + halfWidth))).cross(nextSegment) / det;
        d = normal.scale(centerOffset + halfWidth).add(segment.scale(lambda));
        vertices.push(pt1.add(d));
        segment = nextSegment;
        length = nextLength;
        normal = nextNormal;
    }
    if (!isLoop) {
        vertices.push(pt2.add(normal.scale(centerOffset - halfWidth)));
        vertices.push(pt2.add(normal.scale(centerOffset + halfWidth)));
        switch (opt.cap) {
            case "square": {
                var dir = segment.scale(halfWidth / length);
                vertices.push(pt2.add(dir).add(normal.scale(centerOffset - halfWidth)));
                vertices.push(pt2.add(dir).add(normal.scale(centerOffset + halfWidth)));
                break;
            }
            case "round": {
                var n = Math.max(halfWidth, 10);
                var angle = Math.PI / n;
                var vector = normal.scale(halfWidth);
                var cs = Math.cos(angle);
                var sn = Math.sin(angle);
                var p = pt2.add(normal.scale(centerOffset));
                for (var j = 0; j < n; j++) {
                    vector = (0, math_1.vec2)(vector.x * cs - vector.y * sn, vector.x * sn + vector.y * cs);
                    vertices.push(p);
                    vertices.push(p.add(vector));
                }
            }
        }
    }
    if (vertices.length < 4)
        return;
    var verts = vertices.map(function (v) {
        var _a;
        return ({
            pos: offset.add(v),
            uv: (0, math_1.vec2)(),
            color: opt.color || color_1.Color.WHITE,
            opacity: (_a = opt.opacity) !== null && _a !== void 0 ? _a : 1,
        });
    });
    var indices = [];
    var index = 0;
    for (var i = 0; i < vertices.length - 2; i += 2) {
        indices[index++] = i + 1;
        indices[index++] = i;
        indices[index++] = i + 2;
        indices[index++] = i + 2;
        indices[index++] = i + 3;
        indices[index++] = i + 1;
    }
    if (isLoop) {
        indices[index++] = vertices.length - 1;
        indices[index++] = vertices.length - 2;
        indices[index++] = 0;
        indices[index++] = 0;
        indices[index++] = 1;
        indices[index++] = vertices.length - 1;
    }
    var attributes = {
        pos: new Array(vertices.length * 2),
        uv: new Array(vertices.length * 2).fill(0),
        color: new Array(vertices.length * 3).fill(255),
        opacity: new Array(vertices.length).fill((_a = opt.opacity) !== null && _a !== void 0 ? _a : 1),
    };
    for (var i = 0; i < vertices.length; i++) {
        attributes.pos[i * 2] = vertices[i].x + offset.x;
        attributes.pos[i * 2 + 1] = vertices[i].y + offset.y;
        if (opt.color) {
            attributes.color[i * 3] = opt.color.r;
            attributes.color[i * 3 + 1] = opt.color.g;
            attributes.color[i * 3 + 2] = opt.color.b;
        }
    }
    (0, drawRaw_1.drawRaw)(attributes, indices, opt.fixed, shared_1._k.gfx.defTex, opt.shader, (_b = opt.uniform) !== null && _b !== void 0 ? _b : undefined);
}
function drawLines(opt) {
    var _a;
    var pts = opt.pts;
    var width = (_a = opt.width) !== null && _a !== void 0 ? _a : 1;
    if (!pts) {
        throw new Error("drawLines() requires property \"pts\".");
    }
    if (pts.length < 2) {
        return;
    }
    if (pts.length > 2) {
        switch (opt.join) {
            case "bevel":
                return _drawLinesBevel(opt);
            case "round":
                return _drawLinesRound(opt);
            case "miter":
                return _drawLinesMiter(opt);
        }
    }
    if (opt.radius && pts.length >= 3) {
        return _drawLinesBevel(opt);
    }
    else {
        return _drawLinesRound(opt);
    }
}

"use strict";
var __spreadArray = (this && this.__spreadArray) || function(to, from, pack) {
    if (pack || arguments.length === 2) {
        for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) {
                    ar = Array.prototype.slice.call(from, 0, i);
                }
                ar[i] = from[i];
            }
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawPolygon = drawPolygon;
var color_1 = require("../../math/color");
var math_1 = require("../../math/math");
var shared_1 = require("../../shared");
var types_1 = require("../../types");
var stack_1 = require("../stack");
var drawLine_1 = require("./drawLine");
var drawRaw_1 = require("./drawRaw");
function drawPolygon(opt) {
    var _a, _b, _c, _d, _e, _f;
    if (!opt.pts) {
        throw new Error("drawPolygon() requires property \"pts\".");
    }
    var npts = opt.pts.length;
    if (npts < 3) {
        return;
    }
    (0, stack_1.pushTransform)();
    (0, stack_1.multTranslateV)(opt.pos);
    (0, stack_1.multScaleV)(opt.scale);
    (0, stack_1.multRotate)(opt.angle);
    (0, stack_1.multTranslateV)(opt.offset);
    if (opt.fill !== false) {
        var color = (_a = opt.color) !== null && _a !== void 0
            ? _a
            : color_1.Color.WHITE;
        var attributes = {
            pos: new Array(opt.pts.length * 2),
            uv: new Array(opt.pts.length * 2),
            color: new Array(opt.pts.length * 3),
            opacity: new Array(opt.pts.length),
        };
        for (var i = 0; i < opt.pts.length; i++) {
            attributes.pos[i * 2] = opt.pts[i].x;
            attributes.pos[i * 2 + 1] = opt.pts[i].y;
        }
        if (opt.uv) {
            for (var i = 0; i < opt.uv.length; i++) {
                attributes.uv[i * 2] = opt.uv[i].x;
                attributes.uv[i * 2 + 1] = opt.uv[i].y;
            }
        }
        else {
            attributes.uv.fill(0);
        }
        if (opt.colors) {
            for (var i = 0; i < opt.colors.length; i++) {
                attributes.color[i * 3] = opt.colors[i].r;
                attributes.color[i * 3 + 1] = opt.colors[i].g;
                attributes.color[i * 3 + 2] = opt.colors[i].b;
            }
        }
        else {
            for (var i = 0; i < opt.pts.length; i++) {
                attributes.color[i * 3] = color.r;
                attributes.color[i * 3 + 1] = color.g;
                attributes.color[i * 3 + 2] = color.b;
            }
        }
        if (opt.opacities) {
            for (var i = 0; i < opt.pts.length; i++) {
                attributes.opacity[i] = opt.opacities[i];
            }
        }
        else {
            attributes.opacity.fill(
                (_b = opt.opacity) !== null && _b !== void 0 ? _b : 1,
            );
        }
        /*const verts = opt.pts.map((pt, i) => ({
            pos: new Vec2(pt.x, pt.y),
            uv: opt.uv
                ? opt.uv[i]
                : new Vec2(0, 0),
            color: opt.colors
                ? (opt.colors[i] ? opt.colors[i].mult(color) : color)
                : color,
            opacity: opt.opacity ?? 1,
        }));*/
        var indices = void 0;
        if (opt.triangulate /* && !isConvex(opt.pts)*/) {
            var triangles = (0, math_1.triangulate)(opt.pts);
            // TODO rewrite triangulate to just return new indices
            indices = triangles.map(function(t) {
                return t.map(function(p) {
                    return opt.pts.indexOf(p);
                });
            })
                .flat();
        }
        else {
            indices = __spreadArray([], Array(npts - 2).keys(), true).map(
                function(n) {
                    return [0, n + 1, n + 2];
                },
            )
                .flat();
        }
        (0, drawRaw_1.drawRaw)(
            attributes,
            (_c = opt.indices) !== null && _c !== void 0 ? _c : indices,
            opt.fixed,
            opt.uv ? opt.tex : shared_1._k.gfx.defTex,
            opt.shader,
            (_d = opt.uniform) !== null && _d !== void 0 ? _d : undefined,
            (_e = opt.blend) !== null && _e !== void 0
                ? _e
                : types_1.BlendMode.Normal,
        );
    }
    if (opt.outline) {
        (0, drawLine_1.drawLines)({
            pts: opt.pts[0].eq(opt.pts[opt.pts.length - 1])
                ? opt.pts
                : __spreadArray(
                    __spreadArray([], opt.pts, true),
                    [opt.pts[0]],
                    false,
                ),
            radius: opt.radius,
            width: opt.outline.width,
            color: opt.outline.color,
            join: opt.outline.join,
            uniform: opt.uniform,
            fixed: opt.fixed,
            opacity: (_f = opt.opacity) !== null && _f !== void 0
                ? _f
                : opt.outline.opacity,
        });
    }
    (0, stack_1.popTransform)();
}

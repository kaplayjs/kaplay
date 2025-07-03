"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.polygon = polygon;
var utils_1 = require("../../../game/utils");
var drawPolygon_1 = require("../../../gfx/draw/drawPolygon");
var math_1 = require("../../../math/math");
function polygon(pts, opt) {
    if (opt === void 0) { opt = {}; }
    if (pts.length < 3) {
        throw new Error("Polygon's need more than two points, ".concat(pts.length, " points provided"));
    }
    return {
        id: "polygon",
        pts: pts,
        colors: opt.colors,
        opacities: opt.opacities,
        uv: opt.uv,
        tex: opt.tex,
        radius: opt.radius,
        draw: function () {
            (0, drawPolygon_1.drawPolygon)(Object.assign((0, utils_1.getRenderProps)(this), {
                pts: this.pts,
                colors: this.colors,
                opacities: this.opacities,
                uv: this.uv,
                tex: this.tex,
                radius: this.radius,
                fill: opt.fill,
                triangulate: opt.triangulate,
            }));
        },
        renderArea: function () {
            return new math_1.Polygon(this.pts);
        },
        inspect: function () {
            return "polygon: ".concat(this.pts.map(function (p) { return "[".concat(p.x, ",").concat(p.y, "]"); }).join(","));
        },
    };
}

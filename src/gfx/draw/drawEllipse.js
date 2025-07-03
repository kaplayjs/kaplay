"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawEllipse = drawEllipse;
var various_1 = require("../../math/various");
var Vec2_1 = require("../../math/Vec2");
var anchor_1 = require("../anchor");
var drawPolygon_1 = require("./drawPolygon");
function drawEllipse(opt) {
    var _a, _b, _c;
    if (opt.radiusX === undefined || opt.radiusY === undefined) {
        throw new Error("drawEllipse() requires properties \"radiusX\" and \"radiusY\".");
    }
    if (opt.radiusX === 0 || opt.radiusY === 0) {
        return;
    }
    var start = (_a = opt.start) !== null && _a !== void 0 ? _a : 0;
    var end = (_b = opt.end) !== null && _b !== void 0 ? _b : 360;
    var offset = (0, anchor_1.anchorPt)((_c = opt.anchor) !== null && _c !== void 0 ? _c : "center").scale(new Vec2_1.Vec2(-opt.radiusX, -opt.radiusY));
    var pts = (0, various_1.getArcPts)(offset, opt.radiusX, opt.radiusY, start, end, opt.resolution);
    // center
    pts.unshift(offset);
    var polyOpt = Object.assign({}, opt, __assign({ pts: pts, radius: 0 }, (opt.gradient
        ? {
            colors: __spreadArray([
                opt.gradient[0]
            ], Array(pts.length - 1).fill(opt.gradient[1]), true),
        }
        : {})));
    // full circle with outline shouldn't have the center point
    if (end - start >= 360 && opt.outline) {
        if (opt.fill !== false) {
            (0, drawPolygon_1.drawPolygon)(Object.assign({}, polyOpt, {
                outline: null,
            }));
        }
        (0, drawPolygon_1.drawPolygon)(Object.assign({}, polyOpt, {
            pts: pts.slice(1),
            fill: false,
        }));
        return;
    }
    (0, drawPolygon_1.drawPolygon)(polyOpt);
}

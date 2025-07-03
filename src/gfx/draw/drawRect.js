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
exports.drawRect = drawRect;
var general_1 = require("../../constants/general");
var math_1 = require("../../math/math");
var various_1 = require("../../math/various");
var Vec2_1 = require("../../math/Vec2");
var anchor_1 = require("../anchor");
var drawPolygon_1 = require("./drawPolygon");
function drawRect(opt) {
    if (opt.width === undefined || opt.height === undefined) {
        throw new Error("drawRect() requires property \"width\" and \"height\".");
    }
    if (opt.width <= 0 || opt.height <= 0) {
        return;
    }
    var w = opt.width;
    var h = opt.height;
    var anchor = (0, anchor_1.anchorPt)(opt.anchor || general_1.DEF_ANCHOR).add(1, 1);
    var offset = anchor.scale(new Vec2_1.Vec2(w, h).scale(-0.5));
    var pts = [
        new Vec2_1.Vec2(0, 0),
        new Vec2_1.Vec2(w, 0),
        new Vec2_1.Vec2(w, h),
        new Vec2_1.Vec2(0, h),
    ];
    // TODO: gradient for rounded rect
    // TODO: drawPolygon should handle generic rounded corners
    if (opt.radius) {
        // maximum radius is half the shortest side
        var maxRadius_1 = Math.min(w, h) / 2;
        var r = Array.isArray(opt.radius)
            ? opt.radius.map(function (r) { return Math.min(maxRadius_1, r); })
            : new Array(4).fill(Math.min(maxRadius_1, opt.radius));
        pts = __spreadArray(__spreadArray(__spreadArray(__spreadArray([
            new Vec2_1.Vec2(r[0], 0)
        ], (r[1]
            ? (0, various_1.getArcPts)(new Vec2_1.Vec2(w - r[1], r[1]), r[1], r[1], 270, 360)
            : [(0, math_1.vec2)(w, 0)]), true), (r[2]
            ? (0, various_1.getArcPts)(new Vec2_1.Vec2(w - r[2], h - r[2]), r[2], r[2], 0, 90)
            : [(0, math_1.vec2)(w, h)]), true), (r[3]
            ? (0, various_1.getArcPts)(new Vec2_1.Vec2(r[3], h - r[3]), r[3], r[3], 90, 180)
            : [(0, math_1.vec2)(0, h)]), true), (r[0]
            ? (0, various_1.getArcPts)(new Vec2_1.Vec2(r[0], r[0]), r[0], r[0], 180, 270)
            : []), true);
    }
    (0, drawPolygon_1.drawPolygon)(Object.assign({}, opt, __assign({ offset: offset, pts: pts }, (opt.gradient
        ? {
            colors: opt.horizontal
                ? [
                    opt.gradient[0],
                    opt.gradient[1],
                    opt.gradient[1],
                    opt.gradient[0],
                ]
                : [
                    opt.gradient[0],
                    opt.gradient[0],
                    opt.gradient[1],
                    opt.gradient[1],
                ],
        }
        : {}))));
}

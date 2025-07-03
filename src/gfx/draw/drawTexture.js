"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawTexture = drawTexture;
var general_1 = require("../../constants/general");
var color_1 = require("../../math/color");
var math_1 = require("../../math/math");
var Vec2_1 = require("../../math/Vec2");
var types_1 = require("../../types");
var anchor_1 = require("../anchor");
var drawRaw_1 = require("./drawRaw");
var drawUVQuad_1 = require("./drawUVQuad");
function drawTexture(opt) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!opt.tex) {
        throw new Error("drawTexture() requires property \"tex\".");
    }
    var q = (_a = opt.quad) !== null && _a !== void 0 ? _a : new math_1.Quad(0, 0, 1, 1);
    var w = opt.tex.width * q.w;
    var h = opt.tex.height * q.h;
    var scale = Vec2_1.Vec2.ONE;
    if (opt.tiled) {
        var offset = (0, anchor_1.anchorPt)(opt.anchor || general_1.DEF_ANCHOR);
        var offsetX_1 = (((_b = opt.pos) === null || _b === void 0 ? void 0 : _b.x) || 0)
            - (offset.x + 1) * 0.5 * (opt.width || w);
        var offsetY_1 = (((_c = opt.pos) === null || _c === void 0 ? void 0 : _c.y) || 0)
            - (offset.y + 1) * 0.5 * (opt.height || h);
        var fcols = (opt.width || w) / w;
        var frows = (opt.height || h) / h;
        var cols = Math.floor(fcols);
        var rows = Math.floor(frows);
        var fracX = fcols - cols;
        var fracY = frows - rows;
        var n = (cols + fracX ? 1 : 0) * (rows + fracY ? 1 : 0);
        var indices_1 = new Array(n * 6);
        var attributes_1 = {
            pos: new Array(n * 4 * 2),
            uv: new Array(n * 4 * 2),
            color: new Array(n * 4 * 3),
            opacity: new Array(n * 4),
        };
        var index_1 = 0;
        /*drawUVQuad(Object.assign({}, opt, {
            scale: scale.scale(opt.scale || new Vec2(1)),
        }));*/
        var color_2 = opt.color || color_1.Color.WHITE;
        var opacity_1 = opt.opacity || 1;
        var addQuad = function (x, y, w, h, q) {
            indices_1[index_1 * 6 + 0] = index_1 * 4 + 0;
            indices_1[index_1 * 6 + 1] = index_1 * 4 + 1;
            indices_1[index_1 * 6 + 2] = index_1 * 4 + 3;
            indices_1[index_1 * 6 + 3] = index_1 * 4 + 1;
            indices_1[index_1 * 6 + 4] = index_1 * 4 + 2;
            indices_1[index_1 * 6 + 5] = index_1 * 4 + 3;
            var s = index_1 * 4;
            attributes_1.pos[s * 2] = x + offsetX_1;
            attributes_1.pos[s * 2 + 1] = y + offsetY_1;
            attributes_1.uv[s * 2] = q.x;
            attributes_1.uv[s * 2 + 1] = q.y;
            attributes_1.color[s * 3] = color_2.r;
            attributes_1.color[s * 3 + 1] = color_2.g;
            attributes_1.color[s * 3 + 2] = color_2.b;
            attributes_1.opacity[s] = opacity_1;
            s++;
            attributes_1.pos[s * 2] = x + w + offsetX_1;
            attributes_1.pos[s * 2 + 1] = y + offsetY_1;
            attributes_1.uv[s * 2] = q.x + q.w;
            attributes_1.uv[s * 2 + 1] = q.y;
            attributes_1.color[s * 3] = color_2.r;
            attributes_1.color[s * 3 + 1] = color_2.g;
            attributes_1.color[s * 3 + 2] = color_2.b;
            attributes_1.opacity[s] = opacity_1;
            s++;
            attributes_1.pos[s * 2] = x + w + offsetX_1;
            attributes_1.pos[s * 2 + 1] = y + h + offsetY_1;
            attributes_1.uv[s * 2] = q.x + q.w;
            attributes_1.uv[s * 2 + 1] = q.y + q.h;
            attributes_1.color[s * 3] = color_2.r;
            attributes_1.color[s * 3 + 1] = color_2.g;
            attributes_1.color[s * 3 + 2] = color_2.b;
            attributes_1.opacity[s] = opacity_1;
            s++;
            attributes_1.pos[s * 2] = x + offsetX_1;
            attributes_1.pos[s * 2 + 1] = y + h + offsetY_1;
            attributes_1.uv[s * 2] = q.x;
            attributes_1.uv[s * 2 + 1] = q.y + q.h;
            attributes_1.color[s * 3] = color_2.r;
            attributes_1.color[s * 3 + 1] = color_2.g;
            attributes_1.color[s * 3 + 2] = color_2.b;
            attributes_1.opacity[s] = opacity_1;
            index_1++;
        };
        for (var j = 0; j < rows; j++) {
            for (var i = 0; i < cols; i++) {
                addQuad(i * w, j * h, w, h, q);
            }
            if (fracX) {
                addQuad(cols * w, j * h, w * fracX, h, new math_1.Quad(q.x, q.y, q.w * fracX, q.h));
            }
        }
        if (fracY) {
            for (var i = 0; i < cols; i++) {
                addQuad(i * w, rows * h, w, h * fracY, new math_1.Quad(q.x, q.y, q.w, q.h * fracY));
            }
            if (fracX) {
                addQuad(cols * w, rows * h, w * fracX, h * fracY, new math_1.Quad(q.x, q.y, q.w * fracX, q.h * fracY));
            }
        }
        (0, drawRaw_1.drawRaw)(attributes_1, indices_1, opt.fixed, opt.tex, opt.shader, (_d = opt.uniform) !== null && _d !== void 0 ? _d : undefined, (_e = opt.blend) !== null && _e !== void 0 ? _e : types_1.BlendMode.Normal);
    }
    else {
        (0, drawUVQuad_1.drawUVQuad)(Object.assign({}, opt, {
            scale: (_f = opt.scale) !== null && _f !== void 0 ? _f : Vec2_1.Vec2.ONE,
            tex: opt.tex,
            quad: q,
            width: (_g = opt.width) !== null && _g !== void 0 ? _g : w,
            height: (_h = opt.height) !== null && _h !== void 0 ? _h : h,
        }));
    }
}

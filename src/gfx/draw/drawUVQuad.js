"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawUVQuad = drawUVQuad;
var general_1 = require("../../constants/general");
var color_1 = require("../../math/color");
var math_1 = require("../../math/math");
var types_1 = require("../../types");
var anchor_1 = require("../anchor");
var stack_1 = require("../stack");
var drawRaw_1 = require("./drawRaw");
function drawUVQuad(opt) {
    var _a, _b, _c;
    if (opt.width === undefined || opt.height === undefined) {
        throw new Error(
            "drawUVQuad() requires property \"width\" and \"height\".",
        );
    }
    if (opt.width <= 0 || opt.height <= 0) {
        return;
    }
    var w = opt.width;
    var h = opt.height;
    var anchor = (0, anchor_1.anchorPt)(opt.anchor || general_1.DEF_ANCHOR);
    var offsetX = anchor.x * w * -0.5;
    var offsetY = anchor.y * h * -0.5;
    var q = opt.quad || new math_1.Quad(0, 0, 1, 1);
    var color = opt.color || color_1.Color.WHITE;
    var opacity = (_a = opt.opacity) !== null && _a !== void 0 ? _a : 1;
    // apply uv padding to avoid artifacts
    var uvPadX = opt.tex ? general_1.UV_PAD / opt.tex.width : 0;
    var uvPadY = opt.tex ? general_1.UV_PAD / opt.tex.height : 0;
    var qx = q.x + uvPadX;
    var qy = q.y + uvPadY;
    var qw = q.w - uvPadX * 2;
    var qh = q.h - uvPadY * 2;
    (0, stack_1.pushTransform)();
    (0, stack_1.multTranslateV)(opt.pos);
    (0, stack_1.multRotate)(opt.angle);
    (0, stack_1.multScaleV)(opt.scale);
    (0, stack_1.multTranslate)(offsetX, offsetY);
    (0, drawRaw_1.drawRaw)(
        {
            pos: [
                -w / 2,
                h / 2,
                -w / 2,
                -h / 2,
                w / 2,
                -h / 2,
                w / 2,
                h / 2,
            ],
            uv: [
                opt.flipX ? qx + qw : qx,
                opt.flipY ? qy : qy + qh,
                opt.flipX ? qx + qw : qx,
                opt.flipY ? qy + qh : qy,
                opt.flipX ? qx : qx + qw,
                opt.flipY ? qy + qh : qy,
                opt.flipX ? qx : qx + qw,
                opt.flipY ? qy : qy + qh,
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
        },
        [0, 1, 3, 1, 2, 3],
        opt.fixed,
        opt.tex,
        opt.shader,
        (_b = opt.uniform) !== null && _b !== void 0 ? _b : undefined,
        (_c = opt.blend) !== null && _c !== void 0
            ? _c
            : types_1.BlendMode.Normal,
    );
    (0, stack_1.popTransform)();
}

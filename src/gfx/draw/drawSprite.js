"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawSprite = drawSprite;
var sprite_1 = require("../../assets/sprite");
var math_1 = require("../../math/math");
var drawTexture_1 = require("./drawTexture");
function drawSprite(opt) {
    var _a, _b, _c;
    if (!opt.sprite) {
        throw new Error("drawSprite() requires property \"sprite\"");
    }
    // TODO: slow
    var spr = (0, sprite_1.resolveSprite)(opt.sprite);
    if (!spr || !spr.data) {
        return;
    }
    var q =
        spr.data.frames[(_a = opt.frame) !== null && _a !== void 0 ? _a : 0];
    if (!q) {
        throw new Error(
            "Frame not found: ".concat(
                (_b = opt.frame) !== null && _b !== void 0 ? _b : 0,
            ),
        );
    }
    (0, drawTexture_1.drawTexture)(Object.assign({}, opt, {
        tex: spr.data.tex,
        quad: q.scale(
            (_c = opt.quad) !== null && _c !== void 0
                ? _c
                : new math_1.Quad(0, 0, 1, 1),
        ),
    }));
}

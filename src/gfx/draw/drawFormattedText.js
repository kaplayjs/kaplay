"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawFormattedText = drawFormattedText;
var anchor_1 = require("../anchor");
var stack_1 = require("../stack");
var drawUVQuad_1 = require("./drawUVQuad");
function drawFormattedText(ftext) {
    var _a;
    (0, stack_1.pushTransform)();
    (0, stack_1.multTranslateV)(ftext.opt.pos);
    (0, stack_1.multRotate)(ftext.opt.angle);
    (0, stack_1.multTranslateV)((0, anchor_1.anchorPt)((_a = ftext.opt.anchor) !== null && _a !== void 0 ? _a : "topleft").add(1, 1).scale(ftext.width, ftext.height).scale(-0.5));
    var charsByTexture = new Map();
    ftext.chars.forEach(function (ch) {
        var _a;
        if (!charsByTexture.has(ch.tex))
            charsByTexture.set(ch.tex, []);
        var chars = (_a = charsByTexture.get(ch.tex)) !== null && _a !== void 0 ? _a : [];
        chars.push(ch);
    });
    var sortedChars = Array.from(charsByTexture.values()).flat();
    sortedChars.forEach(function (ch) {
        var _a, _b;
        (0, drawUVQuad_1.drawUVQuad)({
            tex: ch.tex,
            width: ch.width,
            height: ch.height,
            pos: ch.pos,
            scale: ch.scale,
            angle: ch.angle,
            color: ch.color,
            opacity: ch.opacity,
            quad: ch.quad,
            anchor: "center",
            uniform: (_a = ch.uniform) !== null && _a !== void 0 ? _a : ftext.opt.uniform,
            shader: (_b = ch.shader) !== null && _b !== void 0 ? _b : ftext.opt.shader,
            fixed: ftext.opt.fixed,
        });
    });
    (0, stack_1.popTransform)();
}

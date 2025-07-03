"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontData = void 0;
exports.resolveFont = resolveFont;
exports.getFont = getFont;
exports.loadFont = loadFont;
exports.makeFont = makeFont;
var general_1 = require("../constants/general");
var color_1 = require("../math/color");
var math_1 = require("../math/math");
var shared_1 = require("../shared");
var asset_1 = require("./asset");
var bitmapFont_1 = require("./bitmapFont");
var FontData = /** @class */ (function () {
    function FontData(face, opt) {
        if (opt === void 0) { opt = {}; }
        var _a, _b;
        this.filter = general_1.DEF_FONT_FILTER;
        this.outline = null;
        this.size = general_1.DEF_TEXT_CACHE_SIZE;
        this.fontface = face;
        this.filter = (_a = opt.filter) !== null && _a !== void 0 ? _a : general_1.DEF_FONT_FILTER;
        this.size = (_b = opt.size) !== null && _b !== void 0 ? _b : general_1.DEF_TEXT_CACHE_SIZE;
        if (this.size > general_1.MAX_TEXT_CACHE_SIZE) {
            throw new Error("Max font size: ".concat(general_1.MAX_TEXT_CACHE_SIZE));
        }
        if (opt.outline) {
            this.outline = {
                width: 1,
                color: (0, color_1.rgb)(0, 0, 0),
            };
            if (typeof opt.outline === "number") {
                this.outline.width = opt.outline;
            }
            else if (typeof opt.outline === "object") {
                if (opt.outline.width) {
                    this.outline.width = opt.outline.width;
                }
                if (opt.outline.color) {
                    this.outline.color = opt.outline.color;
                }
            }
        }
    }
    return FontData;
}());
exports.FontData = FontData;
function resolveFont(src) {
    var _a, _b, _c;
    if (!src) {
        return resolveFont((_a = shared_1._k.globalOpt.font) !== null && _a !== void 0 ? _a : general_1.DEF_FONT);
    }
    if (typeof src === "string") {
        var bfont = (0, bitmapFont_1.getBitmapFont)(src);
        var font = getFont(src);
        if (bfont) {
            return (_b = bfont.data) !== null && _b !== void 0 ? _b : bfont;
        }
        else if (font) {
            return (_c = font.data) !== null && _c !== void 0 ? _c : font;
        }
        else if (document.fonts.check("".concat(general_1.DEF_TEXT_CACHE_SIZE, "px ").concat(src))) {
            return src;
        }
        else if ((0, asset_1.loadProgress)() < 1) {
            return null;
        }
        else {
            throw new Error("Font not found: ".concat(src));
        }
    }
    else if (src instanceof asset_1.Asset) {
        return src.data ? src.data : src;
    }
    return src;
}
function getFont(name) {
    var _a;
    return (_a = shared_1._k.assets.fonts.get(name)) !== null && _a !== void 0 ? _a : null;
}
// TODO: pass in null src to store opt for default fonts like "monospace"
function loadFont(name, src, opt) {
    if (opt === void 0) { opt = {}; }
    var font = new FontFace(name, typeof src === "string" ? "url(".concat(src, ")") : src);
    document.fonts.add(font);
    return shared_1._k.assets.fonts.add(name, font.load().catch(function (err) {
        throw new Error("Failed to load font from \"".concat(src, "\": ").concat(err));
    }).then(function (face) { return new FontData(face, opt); }));
}
function makeFont(tex, gw, gh, chars) {
    var cols = tex.width / gw;
    var map = {};
    var charMap = chars.split("").entries();
    for (var _i = 0, charMap_1 = charMap; _i < charMap_1.length; _i++) {
        var _a = charMap_1[_i], i = _a[0], ch = _a[1];
        map[ch] = new math_1.Quad((i % cols) * gw, Math.floor(i / cols) * gh, gw, gh);
    }
    return {
        tex: tex,
        map: map,
        size: gh,
    };
}

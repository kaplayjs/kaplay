"use strict";
var __awaiter = (this && this.__awaiter)
    || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P ? value : new P(function(resolve) {
                resolve(value);
            });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next(),
            );
        });
    };
var __generator = (this && this.__generator) || function(thisArg, body) {
    var _ = {
            label: 0,
            sent: function() {
                if (t[0] & 1) throw t[1];
                return t[1];
            },
            trys: [],
            ops: [],
        },
        f,
        y,
        t,
        g = Object.create(
            (typeof Iterator === "function" ? Iterator : Object).prototype,
        );
    return g.next = verb(0),
        g["throw"] = verb(1),
        g["return"] = verb(2),
        typeof Symbol === "function" && (g[Symbol.iterator] = function() {
            return this;
        }),
        g;
    function verb(n) {
        return function(v) {
            return step([n, v]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) {
            try {
                if (
                    f = 1,
                        y && (t = op[0] & 2
                            ? y["return"]
                            : op[0]
                            ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                            : y.next)
                        && !(t = t.call(y, op[1])).done
                ) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (
                            !(t = _.trys, t = t.length > 0 && t[t.length - 1])
                            && (op[0] === 6 || op[0] === 2)
                        ) {
                            _ = 0;
                            continue;
                        }
                        if (
                            op[0] === 3
                            && (!t || (op[1] > t[0] && op[1] < t[3]))
                        ) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2]) _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            } catch (e) {
                op = [6, e];
                y = 0;
            } finally {
                f = t = 0;
            }
        }
        if (op[0] & 5) throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBitmapFont = getBitmapFont;
exports.loadBitmapFont = loadBitmapFont;
exports.loadBitmapFontFromSprite = loadBitmapFontFromSprite;
exports.loadHappy = loadHappy;
var general_1 = require("../constants/general");
var gfx_1 = require("../gfx/gfx");
var math_1 = require("../math/math");
var shared_1 = require("../shared");
var asset_1 = require("./asset");
var font_1 = require("./font");
var utils_1 = require("./utils");
function getBitmapFont(name) {
    var _a;
    return (_a = shared_1._k.assets.bitmapFonts.get(name)) !== null
            && _a !== void 0
        ? _a
        : null;
}
// TODO: support LoadSpriteSrc
function loadBitmapFont(name, src, gw, gh, opt) {
    if (opt === void 0) opt = {};
    var fontSrc = (0, utils_1.fixURL)(src);
    return shared_1._k.assets.bitmapFonts.add(
        name,
        (0, asset_1.loadImg)(fontSrc)
            .then(function(img) {
                var _a;
                return (0, font_1.makeFont)(
                    gfx_1.Texture.fromImage(shared_1._k.gfx.ggl, img, opt),
                    gw,
                    gh,
                    (_a = opt.chars) !== null && _a !== void 0
                        ? _a
                        : general_1.ASCII_CHARS,
                );
            }),
    );
}
function loadBitmapFontFromSprite(spriteID, chars) {
    var _this = this;
    return shared_1._k.assets.bitmapFonts.add(
        spriteID,
        (function() {
            return __awaiter(_this, void 0, void 0, function() {
                var splittedChars, spr, frames, tex, h;
                var _a;
                return __generator(this, function(_b) {
                    switch (_b.label) {
                        case 0:
                            if (/[\n ]/.test(chars)) {
                                throw new Error(
                                    "While defining sprite font \"".concat(
                                        spriteID,
                                        "\": spaces are not allowed in chars",
                                    ),
                                );
                            }
                            splittedChars = chars.split("");
                            if (
                                new Set(splittedChars).size
                                    !== splittedChars.length
                            ) {
                                throw new Error(
                                    "Duplicate characters given when defining sprite font \""
                                        .concat(spriteID, "\": ").concat(chars),
                                );
                            }
                            return [
                                4, /*yield*/
                                shared_1._k.assets.sprites.waitFor(
                                    spriteID,
                                    (_a = shared_1._k.globalOpt.loadTimeout)
                                            !== null && _a !== void 0
                                        ? _a
                                        : 3000,
                                ),
                            ];
                        case 1:
                            spr = _b.sent();
                            frames = spr.frames;
                            if (frames.length < splittedChars.length) {
                                throw new Error(
                                    "Tried to define ".concat(
                                        splittedChars.length,
                                        " characters for sprite font \"",
                                    ).concat(
                                        spriteID,
                                        "\", but there are only ",
                                    ).concat(frames.length, " frames defined"),
                                );
                            }
                            tex = spr.tex;
                            h = Math.max.apply(
                                Math,
                                frames.map(function(q) {
                                    return q.h;
                                }),
                            ) * tex.height;
                            return [2, /*return*/ {
                                tex: tex,
                                map: Object.fromEntries(
                                    splittedChars.map(function(c, i) {
                                        var q = frames[i];
                                        var q2 = new math_1.Quad(
                                            q.x * tex.width,
                                            q.y * tex.height,
                                            q.w * tex.width,
                                            q.h * tex.height,
                                        );
                                        return [c, q2];
                                    }),
                                ),
                                size: h,
                            }];
                    }
                });
            });
        })(),
    );
}
// loading happiness...
function loadHappy(fontName, opt) {
    if (fontName === void 0) fontName = "happy";
    if (!shared_1._k.game.defaultAssets.happy) {
        throw new Error("You can't use loadHappy with kaplay/mini");
    }
    return loadBitmapFont(
        fontName,
        shared_1._k.game.defaultAssets.happy,
        28,
        36,
        opt,
    );
}

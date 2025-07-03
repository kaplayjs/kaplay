"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileStyledText = compileStyledText;
exports.formatText = formatText;
var asset_1 = require("../assets/asset");
var font_1 = require("../assets/font");
var general_1 = require("../constants/general");
var color_1 = require("../math/color");
var math_1 = require("../math/math");
var Vec2_1 = require("../math/Vec2");
var shared_1 = require("../shared");
var runes_1 = require("../utils/runes");
var anchor_1 = require("./anchor");
var gfx_1 = require("./gfx");
function applyCharTransform(fchar, tr) {
    if (tr.font)
        fchar.font = tr.font;
    if (tr.stretchInPlace !== undefined) {
        fchar.stretchInPlace = tr.stretchInPlace;
    }
    if (tr.shader !== undefined)
        fchar.shader = tr.shader;
    if (tr.uniform !== undefined)
        fchar.uniform = tr.uniform;
    if (tr.override) {
        Object.assign(fchar, tr);
        return;
    }
    if (tr.pos)
        fchar.pos = fchar.pos.add(tr.pos);
    if (tr.scale)
        fchar.scale = fchar.scale.scale((0, math_1.vec2)(tr.scale));
    if (tr.angle)
        fchar.angle += tr.angle;
    if (tr.color && fchar.ch.length === 1) {
        fchar.color = fchar.color.mult(tr.color);
    }
    // attention to type coercion, 0 is a valid value, only null & undefined are not
    if (tr.opacity != null)
        fchar.opacity *= tr.opacity;
}
function compileStyledText(txt) {
    var charStyleMap = {};
    var renderText = "";
    var styleStack = [];
    var text = String(txt);
    var emit = function (ch) {
        if (styleStack.length > 0) {
            charStyleMap[renderText.length] = styleStack.slice();
        }
        renderText += ch;
    };
    while (text !== "") {
        if (text[0] === "\\") {
            if (text.length === 1) {
                throw new Error("Styled text error: \\ at end of string");
            }
            emit(text[1]);
            text = text.slice(2);
            continue;
        }
        if (text[0] === "[") {
            var execResult = /^\[(\/)?(\w+?)\]/.exec(text);
            if (!execResult) {
                // xxx: should throw an error here?
                emit(text[0]);
                text = text.slice(1);
                continue;
            }
            var m = execResult[0], e = execResult[1], gn = execResult[2];
            if (e !== undefined) {
                var x = styleStack.pop();
                if (x !== gn) {
                    if (x !== undefined) {
                        throw new Error("Styled text error: mismatched tags. Expected [/".concat(x, "], got [/").concat(gn, "]"));
                    }
                    else {
                        throw new Error("Styled text error: stray end tag [/".concat(gn, "]"));
                    }
                }
            }
            else
                styleStack.push(gn);
            text = text.slice(m.length);
            continue;
        }
        emit(text[0]);
        text = text.slice(1);
    }
    if (styleStack.length > 0) {
        throw new Error("Styled text error: unclosed tags ".concat(styleStack.join(", ")));
    }
    return {
        charStyleMap: charStyleMap,
        text: renderText,
    };
}
function getFontName(font) {
    return font instanceof font_1.FontData
        ? font.fontface.family
        : font;
}
function getFontAtlasForFont(font) {
    var fontName = getFontName(font);
    var atlas = shared_1._k.gfx.fontAtlases[fontName];
    if (!atlas) {
        // create a new atlas
        var opts = font instanceof font_1.FontData
            ? {
                outline: font.outline,
                filter: font.filter,
            }
            : {
                outline: null,
                filter: general_1.DEF_FONT_FILTER,
            };
        // TODO: customizable font tex filter
        atlas = {
            font: {
                tex: new gfx_1.Texture(shared_1._k.gfx.ggl, general_1.FONT_ATLAS_WIDTH, general_1.FONT_ATLAS_HEIGHT, {
                    filter: opts.filter,
                }),
                map: {},
                size: general_1.DEF_TEXT_CACHE_SIZE,
            },
            cursor: new Vec2_1.Vec2(0),
            maxHeight: 0,
            outline: opts.outline,
        };
        shared_1._k.gfx.fontAtlases[fontName] = atlas;
    }
    return atlas;
}
function updateFontAtlas(font, ch) {
    var _a, _b, _c, _d;
    var atlas = getFontAtlasForFont(font);
    var fontName = getFontName(font);
    if (!atlas.font.map[ch]) {
        // TODO: use assets.packer to pack font texture
        var c2d = shared_1._k.fontCacheC2d;
        if (!c2d)
            throw new Error("fontCacheC2d is not defined.");
        if (!shared_1._k.fontCacheCanvas) {
            throw new Error("fontCacheCanvas is not defined.");
        }
        c2d.clearRect(0, 0, shared_1._k.fontCacheCanvas.width, shared_1._k.fontCacheCanvas.height);
        c2d.font = "".concat(atlas.font.size, "px ").concat(fontName);
        c2d.textBaseline = "top";
        c2d.textAlign = "left";
        c2d.fillStyle = "#ffffff";
        var m = c2d.measureText(ch);
        var w = Math.ceil(m.width);
        if (!w)
            return;
        var h = Math.ceil(Math.abs(m.actualBoundingBoxAscent))
            + Math.ceil(Math.abs(m.actualBoundingBoxDescent));
        // TODO: Test if this works with the verification of width and color
        if (atlas.outline && atlas.outline.width
            && atlas.outline.color) {
            c2d.lineJoin = "round";
            c2d.lineWidth = atlas.outline.width * 2;
            c2d.strokeStyle = atlas.outline.color.toHex();
            c2d.strokeText(ch, atlas.outline.width, atlas.outline.width);
            w += atlas.outline.width * 2;
            h += atlas.outline.width * 3;
        }
        c2d.fillText(ch, (_b = (_a = atlas.outline) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0, (_d = (_c = atlas.outline) === null || _c === void 0 ? void 0 : _c.width) !== null && _d !== void 0 ? _d : 0);
        var img = c2d.getImageData(0, 0, w, h);
        // if we are about to exceed the X axis of the texture, go to another line
        if (atlas.cursor.x + w > general_1.FONT_ATLAS_WIDTH) {
            atlas.cursor.x = 0;
            atlas.cursor.y += atlas.maxHeight;
            atlas.maxHeight = 0;
            if (atlas.cursor.y > general_1.FONT_ATLAS_HEIGHT) {
                // TODO: create another atlas
                throw new Error("Font atlas exceeds character limit");
            }
        }
        atlas.font.tex.update(img, atlas.cursor.x, atlas.cursor.y);
        atlas.font.map[ch] = new math_1.Quad(atlas.cursor.x, atlas.cursor.y, w, h);
        atlas.cursor.x += w + 1;
        atlas.maxHeight = Math.max(atlas.maxHeight, h);
    }
}
function formatText(opt) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (opt.text === undefined) {
        throw new Error("formatText() requires property \"text\".");
    }
    var font = (0, font_1.resolveFont)(opt.font);
    // if it's still loading
    if (!opt.text || opt.text === "" || font instanceof asset_1.Asset || !font) {
        return {
            width: 0,
            height: 0,
            chars: [],
            opt: opt,
            renderedText: "",
        };
    }
    var _h = compileStyledText(opt.text + ""), charStyleMap = _h.charStyleMap, text = _h.text;
    var chars = (0, runes_1.runes)(text);
    var defGfxFont = (font instanceof font_1.FontData || typeof font === "string")
        ? getFontAtlasForFont(font).font
        : font;
    var size = opt.size || defGfxFont.size;
    var scale = (0, math_1.vec2)((_a = opt.scale) !== null && _a !== void 0 ? _a : 1).scale(size / defGfxFont.size);
    var lineSpacing = (_b = opt.lineSpacing) !== null && _b !== void 0 ? _b : 0;
    var letterSpacing = (_c = opt.letterSpacing) !== null && _c !== void 0 ? _c : 0;
    var curX = 0;
    var tw = 0;
    var lines = [];
    var curLine = [];
    var cursor = 0;
    var lastSpace = null;
    var lastSpaceWidth = 0;
    var paraIndentX = undefined;
    // TODO: word break
    while (cursor < chars.length) {
        var ch = chars[cursor];
        // always new line on '\n'
        if (ch === "\n") {
            lines.push({
                width: curX - letterSpacing,
                chars: curLine,
            });
            lastSpace = null;
            lastSpaceWidth = 0;
            curX = 0;
            curLine = [];
            paraIndentX = undefined;
        }
        else {
            var defaultFontValue = (font instanceof font_1.FontData || typeof font === "string")
                ? font
                : undefined;
            var theFChar = {
                tex: defGfxFont.tex,
                ch: ch,
                pos: (0, math_1.vec2)(curX, 0),
                opacity: (_d = opt.opacity) !== null && _d !== void 0 ? _d : 1,
                color: (_e = opt.color) !== null && _e !== void 0 ? _e : color_1.Color.WHITE,
                scale: (0, math_1.vec2)(scale),
                angle: 0,
                font: defaultFontValue,
                stretchInPlace: true,
            };
            if (opt.transform) {
                var tr = typeof opt.transform === "function"
                    ? opt.transform(cursor, ch)
                    : opt.transform;
                if (tr) {
                    applyCharTransform(theFChar, tr);
                }
            }
            if (charStyleMap[cursor]) {
                var styles = charStyleMap[cursor];
                for (var _i = 0, styles_1 = styles; _i < styles_1.length; _i++) {
                    var name_1 = styles_1[_i];
                    var style = (_f = opt.styles) === null || _f === void 0 ? void 0 : _f[name_1];
                    var tr = typeof style === "function"
                        ? style(cursor, ch)
                        : style;
                    if (tr) {
                        applyCharTransform(theFChar, tr);
                    }
                }
            }
            var requestedFont = theFChar.font;
            var resolvedFont = (0, font_1.resolveFont)(requestedFont);
            if (resolvedFont instanceof asset_1.Asset || !resolvedFont) {
                // abort, not all fonts have loaded yet
                return {
                    width: 0,
                    height: 0,
                    chars: [],
                    opt: opt,
                    renderedText: "",
                };
            }
            var requestedFontData = defGfxFont;
            if (requestedFont && requestedFont !== defaultFontValue) {
                if (resolvedFont instanceof font_1.FontData
                    || typeof resolvedFont === "string") {
                    requestedFontData = getFontAtlasForFont(requestedFont).font;
                }
                else
                    requestedFontData = resolvedFont;
                theFChar.tex = requestedFontData.tex;
            }
            if (requestedFont
                && (resolvedFont instanceof font_1.FontData
                    || typeof resolvedFont === "string"))
                updateFontAtlas(requestedFont, ch);
            var q = requestedFontData.map[ch];
            // TODO: leave space if character not found?
            if (q) {
                var gw = q.w
                    * (theFChar.stretchInPlace
                        ? scale
                        : theFChar.scale).x;
                if (opt.width && curX + gw > opt.width) {
                    // new line on last word if width exceeds
                    if (lastSpace != null) {
                        cursor -= curLine.length - lastSpace;
                        // omit trailing space
                        curLine = curLine.slice(0, lastSpace - 1);
                        curX = lastSpaceWidth;
                    }
                    lastSpace = null;
                    lastSpaceWidth = 0;
                    lines.push({
                        width: curX - letterSpacing,
                        chars: curLine,
                    });
                    curX = paraIndentX !== null && paraIndentX !== void 0 ? paraIndentX : 0;
                    curLine = [];
                    continue;
                }
                theFChar.width = q.w;
                theFChar.height = q.h;
                theFChar.quad = new math_1.Quad(q.x / requestedFontData.tex.width, q.y / requestedFontData.tex.height, q.w / requestedFontData.tex.width, q.h / requestedFontData.tex.height);
                theFChar.pos = theFChar.pos.add(gw * 0.5, q.h * theFChar.scale.y * 0.5);
                // push char
                curLine.push({
                    ch: theFChar,
                    font: requestedFontData,
                });
                if (ch === " ") {
                    lastSpace = curLine.length;
                    lastSpaceWidth = curX;
                }
                if (opt.indentAll
                    && paraIndentX === undefined
                    && /\S/.test(ch)) {
                    paraIndentX = curX;
                }
                curX += gw;
                tw = Math.max(tw, curX);
                curX += letterSpacing;
            }
        }
        cursor++;
    }
    lines.push({
        width: curX - letterSpacing,
        chars: curLine,
    });
    if (opt.width) {
        tw = opt.width;
    }
    var formattedChars = [];
    var th = 0;
    for (var i = 0; i < lines.length; i++) {
        if (i > 0)
            th += lineSpacing;
        var ox = (tw - lines[i].width) * (0, anchor_1.alignPt)((_g = opt.align) !== null && _g !== void 0 ? _g : "left");
        var thisLineHeight = size;
        for (var _j = 0, _l = lines[i].chars; _j < _l.length; _j++) {
            var ch = _l[_j].ch;
            ch.pos = ch.pos.add(ox, th);
            formattedChars.push(ch);
            thisLineHeight = Math.max(thisLineHeight, size * (ch.stretchInPlace ? scale : ch.scale).y / scale.y);
        }
        th += thisLineHeight;
    }
    return {
        width: tw,
        height: th,
        chars: formattedChars,
        opt: opt,
        renderedText: text,
    };
}

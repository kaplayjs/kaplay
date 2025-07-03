"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.text = text;
var general_1 = require("../../../constants/general");
var globalEvents_1 = require("../../../events/globalEvents");
var utils_1 = require("../../../game/utils");
var drawFormattedText_1 = require("../../../gfx/draw/drawFormattedText");
var formatText_1 = require("../../../gfx/formatText");
var math_1 = require("../../../math/math");
function text(t, opt) {
    var _a, _b;
    if (opt === void 0) opt = {};
    var theFormattedText;
    function update(obj) {
        var _a, _b;
        theFormattedText = (0, formatText_1.formatText)(
            Object.assign((0, utils_1.getRenderProps)(obj), {
                text: obj.text + "",
                size: obj.textSize,
                font: obj.font,
                width: opt.width && obj.width,
                align: obj.align,
                letterSpacing: obj.letterSpacing,
                lineSpacing: obj.lineSpacing,
                transform: obj.textTransform,
                styles: obj.textStyles,
                indentAll: opt.indentAll,
            }),
        );
        if (!opt.width) {
            obj.width = theFormattedText.width
                / (((_a = obj.scale) === null || _a === void 0 ? void 0 : _a.x)
                    || 1);
        }
        obj.height = theFormattedText.height
            / (((_b = obj.scale) === null || _b === void 0 ? void 0 : _b.y)
                || 1);
    }
    var _shape;
    var _width = (_a = opt.width) !== null && _a !== void 0 ? _a : 0;
    var _height = 0;
    var obj = {
        id: "text",
        set text(nt) {
            t = nt;
            // @ts-expect-error
            update(this);
        },
        get text() {
            return t;
        },
        textSize: (_b = opt.size) !== null && _b !== void 0
            ? _b
            : general_1.DEF_TEXT_SIZE,
        font: opt.font,
        get width() {
            return _width;
        },
        set width(value) {
            _width = value;
            if (_shape) {
                _shape.width = value;
            }
        },
        get height() {
            return _height;
        },
        set height(value) {
            _height = value;
            if (_shape) {
                _shape.height = value;
            }
        },
        align: opt.align,
        lineSpacing: opt.lineSpacing,
        letterSpacing: opt.letterSpacing,
        textTransform: opt.transform,
        textStyles: opt.styles,
        formattedText: function() {
            return theFormattedText;
        },
        add: function() {
            var _this = this;
            (0, globalEvents_1.onLoad)(function() {
                return update(_this);
            });
        },
        draw: function() {
            (0, drawFormattedText_1.drawFormattedText)(theFormattedText);
        },
        update: function() {
            update(this);
        },
        renderArea: function() {
            if (!_shape) {
                _shape = new math_1.Rect((0, math_1.vec2)(0), _width, _height);
            }
            return _shape;
        },
    };
    // @ts-expect-error
    update(obj);
    // @ts-ignore Deep check in text related methods
    return obj;
}

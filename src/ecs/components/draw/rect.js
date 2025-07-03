"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rect = rect;
var utils_1 = require("../../../game/utils");
var drawRect_1 = require("../../../gfx/draw/drawRect");
var math_1 = require("../../../math/math");
function rect(w, h, opt) {
    if (opt === void 0) { opt = {}; }
    var _shape;
    var _width = w;
    var _height = h;
    return {
        id: "rect",
        get width() {
            return _width;
        },
        set width(value) {
            _width = value;
            if (_shape)
                _shape.width = value;
        },
        get height() {
            return _height;
        },
        set height(value) {
            _height = value;
            if (_shape)
                _shape.height = value;
        },
        radius: opt.radius || 0,
        draw: function () {
            (0, drawRect_1.drawRect)(Object.assign((0, utils_1.getRenderProps)(this), {
                width: _width,
                height: _height,
                radius: this.radius,
                fill: opt.fill,
            }));
        },
        renderArea: function () {
            if (!_shape) {
                _shape = new math_1.Rect((0, math_1.vec2)(0), _width, _height);
            }
            return _shape;
        },
        inspect: function () {
            return "rect: (".concat(Math.ceil(_width), "w, ").concat(Math.ceil(_height), "h)");
        },
    };
}

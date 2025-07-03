"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uvquad = uvquad;
var utils_1 = require("../../../game/utils");
var drawUVQuad_1 = require("../../../gfx/draw/drawUVQuad");
var math_1 = require("../../../math/math");
function uvquad(w, h) {
    var _shape;
    var _width = w;
    var _height = h;
    return {
        id: "uvquad",
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
        draw: function() {
            (0, drawUVQuad_1.drawUVQuad)(
                Object.assign((0, utils_1.getRenderProps)(this), {
                    width: _width,
                    height: _height,
                }),
            );
        },
        renderArea: function() {
            if (!_shape) {
                _shape = new math_1.Rect((0, math_1.vec2)(0), _width, _height);
            }
            return _shape;
        },
        inspect: function() {
            return "uvquad: (".concat(Math.ceil(_width), "w, ").concat(
                Math.ceil(_height),
                ")h",
            );
        },
    };
}

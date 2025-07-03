"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ellipse = ellipse;
var utils_1 = require("../../../game/utils");
var drawEllipse_1 = require("../../../gfx/draw/drawEllipse");
var math_1 = require("../../../math/math");
var Vec2_1 = require("../../../math/Vec2");
function ellipse(radiusX, radiusY, opt) {
    if (opt === void 0) opt = {};
    var _shape;
    var _radiusX = radiusX;
    var _radiusY = radiusY;
    return {
        id: "ellipse",
        get radiusX() {
            return _radiusX;
        },
        set radiusX(value) {
            _radiusX = value;
            if (_shape) {
                _shape.radiusX = value;
            }
        },
        get radiusY() {
            return _radiusY;
        },
        set radiusY(value) {
            _radiusY = value;
            if (_shape) {
                _shape.radiusY = value;
            }
        },
        draw: function() {
            (0, drawEllipse_1.drawEllipse)(
                Object.assign((0, utils_1.getRenderProps)(this), {
                    radiusX: this.radiusX,
                    radiusY: this.radiusY,
                    fill: opt.fill,
                }),
            );
        },
        renderArea: function() {
            if (!_shape) {
                return new math_1.Ellipse(
                    new Vec2_1.Vec2(0),
                    _radiusX,
                    _radiusY,
                );
            }
            return _shape;
        },
        inspect: function() {
            return "radiusX: ".concat(Math.ceil(_radiusX), " radiusY: ").concat(
                Math.ceil(_radiusY),
            );
        },
    };
}

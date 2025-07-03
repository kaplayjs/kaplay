"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.circle = circle;
var utils_1 = require("../../../game/utils");
var drawCircle_1 = require("../../../gfx/draw/drawCircle");
var math_1 = require("../../../math/math");
var Vec2_1 = require("../../../math/Vec2");
function circle(radius, opt) {
    if (opt === void 0) { opt = {}; }
    var _shape;
    var _radius = radius;
    return {
        id: "circle",
        get radius() {
            return _radius;
        },
        set radius(value) {
            _radius = value;
            if (_shape)
                _shape.radius = value;
        },
        draw: function () {
            (0, drawCircle_1.drawCircle)(Object.assign((0, utils_1.getRenderProps)(this), {
                radius: _radius,
                fill: opt.fill,
            }));
        },
        renderArea: function () {
            if (!_shape) {
                _shape = new math_1.Circle(new Vec2_1.Vec2(0), _radius);
            }
            return _shape;
        },
        inspect: function () {
            return "radius: ".concat(Math.ceil(_radius));
        },
    };
}

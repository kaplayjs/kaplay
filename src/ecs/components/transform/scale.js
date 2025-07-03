"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scale = scale;
var math_1 = require("../../../math/math");
var Vec2_1 = require("../../../math/Vec2");
function scale() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (args.length === 0) {
        return scale(1);
    }
    var _scale = math_1.vec2.apply(void 0, args);
    return {
        id: "scale",
        set scale(value) {
            if (value instanceof Vec2_1.Vec2 === false) {
                throw Error(
                    "The scale property on scale is a vector. Use scaleTo or scaleBy to set the scale with a number.",
                );
            }
            _scale = (0, math_1.vec2)(value);
        },
        get scale() {
            return _scale;
        },
        scaleTo: function() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            _scale = math_1.vec2.apply(void 0, args);
        },
        scaleBy: function() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            _scale = _scale.scale(math_1.vec2.apply(void 0, args));
        },
        inspect: function() {
            if (_scale.x == _scale.y) {
                return "scale: ".concat(_scale.x.toFixed(1), "x");
            }
            else {
                return "scale: (".concat(_scale.x.toFixed(1), "x, ").concat(
                    _scale.y.toFixed(1),
                    "y)",
                );
            }
        },
    };
}

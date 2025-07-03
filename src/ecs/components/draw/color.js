"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.color = color;
var color_1 = require("../../../math/color");
function color() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return {
        id: "color",
        color: color_1.rgb.apply(void 0, args),
        inspect: function() {
            return "color: ".concat(this.color.toString());
        },
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lerp = lerp;
var color_1 = require("./color");
var Vec2_1 = require("./Vec2");
function lerp(a, b, t) {
    if (typeof a === "number" && typeof b === "number") {
        // we don't call lerpNumber just for performance, but should be the same
        return a + (b - a) * t;
    }
    // check for Vec2
    else if (a instanceof Vec2_1.Vec2 && b instanceof Vec2_1.Vec2) {
        return a.lerp(b, t);
    }
    else if (a instanceof color_1.Color && b instanceof color_1.Color) {
        return a.lerp(b, t);
    }
    throw new Error(
        "Bad value for lerp(): ".concat(a, ", ").concat(
            b,
            ". Only number, Vec2 and Color is supported.",
        ),
    );
}

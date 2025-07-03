"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rotate = rotate;
function rotate(a) {
    return {
        id: "rotate",
        angle: a !== null && a !== void 0 ? a : 0,
        rotateBy: function(angle) {
            this.angle += angle;
        },
        rotateTo: function(angle) {
            this.angle = angle;
        },
        inspect: function() {
            return "angle: ".concat(Math.round(this.angle));
        },
    };
}

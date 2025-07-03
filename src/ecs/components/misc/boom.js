"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boom = boom;
var math_1 = require("../../../math/math");
var shared_1 = require("../../../shared");
function boom(speed, size) {
    if (speed === void 0) { speed = 2; }
    if (size === void 0) { size = 1; }
    var time = 0;
    return {
        require: ["scale"],
        update: function () {
            var s = Math.sin(time * speed) * size;
            if (s < 0) {
                this.destroy();
            }
            this.scale = (0, math_1.vec2)(s);
            time += shared_1._k.app.dt();
        },
    };
}

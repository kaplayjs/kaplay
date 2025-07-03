"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opacity = opacity;
var easings_1 = require("../../../math/easings");
var shared_1 = require("../../../shared");
var numbers_1 = require("../../../utils/numbers");
function opacity(a) {
    return {
        id: "opacity",
        opacity: a !== null && a !== void 0 ? a : 1,
        fadeIn: function(time, easeFunc) {
            var _this = this;
            if (time === void 0) time = 1;
            if (easeFunc === void 0) easeFunc = easings_1.easings.linear;
            return shared_1._k.game.root.tween(
                0,
                this.opacity,
                time,
                function(a) {
                    return _this.opacity = a;
                },
                easeFunc,
            );
        },
        fadeOut: function(time, easeFunc) {
            var _this = this;
            if (time === void 0) time = 1;
            if (easeFunc === void 0) easeFunc = easings_1.easings.linear;
            return shared_1._k.game.root.tween(
                this.opacity,
                0,
                time,
                function(a) {
                    return _this.opacity = a;
                },
                easeFunc,
            );
        },
        inspect: function() {
            return "opacity: ".concat((0, numbers_1.toFixed)(this.opacity, 1));
        },
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.easings = void 0;
// https://easings.net/
var c1 = 1.70158;
var c2 = c1 * 1.525;
var c3 = c1 + 1;
var c4 = (2 * Math.PI) / 3;
var c5 = (2 * Math.PI) / 4.5;
exports.easings = {
    linear: function(x) {
        return x;
    },
    easeInSine: function(x) {
        return 1 - Math.cos((x * Math.PI) / 2);
    },
    easeOutSine: function(x) {
        return Math.sin((x * Math.PI) / 2);
    },
    easeInOutSine: function(x) {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    },
    easeInQuad: function(x) {
        return x * x;
    },
    easeOutQuad: function(x) {
        return 1 - (1 - x) * (1 - x);
    },
    easeInOutQuad: function(x) {
        return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    },
    easeInCubic: function(x) {
        return x * x * x;
    },
    easeOutCubic: function(x) {
        return 1 - Math.pow(1 - x, 3);
    },
    easeInOutCubic: function(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    },
    easeInQuart: function(x) {
        return x * x * x * x;
    },
    easeOutQuart: function(x) {
        return 1 - Math.pow(1 - x, 4);
    },
    easeInOutQuart: function(x) {
        return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
    },
    easeInQuint: function(x) {
        return x * x * x * x * x;
    },
    easeOutQuint: function(x) {
        return 1 - Math.pow(1 - x, 5);
    },
    easeInOutQuint: function(x) {
        return x < 0.5
            ? 16 * x * x * x * x * x
            : 1 - Math.pow(-2 * x + 2, 5) / 2;
    },
    easeInExpo: function(x) {
        return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
    },
    easeOutExpo: function(x) {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    },
    easeInOutExpo: function(x) {
        return x === 0
            ? 0
            : x === 1
            ? 1
            : x < 0.5
            ? Math.pow(2, 20 * x - 10) / 2
            : (2 - Math.pow(2, -20 * x + 10)) / 2;
    },
    easeInCirc: function(x) {
        return 1 - Math.sqrt(1 - Math.pow(x, 2));
    },
    easeOutCirc: function(x) {
        return Math.sqrt(1 - Math.pow(x - 1, 2));
    },
    easeInOutCirc: function(x) {
        return x < 0.5
            ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
            : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
    },
    easeInBack: function(x) {
        return c3 * x * x * x - c1 * x * x;
    },
    easeOutBack: function(x) {
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    },
    easeInOutBack: function(x) {
        return x < 0.5
            ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
            : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
    },
    easeInElastic: function(x) {
        return x === 0
            ? 0
            : x === 1
            ? 1
            : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
    },
    easeOutElastic: function(x) {
        return x === 0
            ? 0
            : x === 1
            ? 1
            : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    },
    easeInOutElastic: function(x) {
        return x === 0
            ? 0
            : x === 1
            ? 1
            : x < 0.5
            ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
            : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2
                + 1;
    },
    easeInBounce: function(x) {
        return 1 - exports.easings.easeOutBounce(1 - x);
    },
    easeOutBounce: function(x) {
        var n1 = 7.5625;
        var d1 = 2.75;
        if (x < 1 / d1) {
            return n1 * x * x;
        }
        else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        }
        else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
        }
        else {
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
    },
    easeInOutBounce: function(x) {
        return x < 0.5
            ? (1 - exports.easings.easeOutBounce(1 - 2 * x)) / 2
            : (1 + exports.easings.easeOutBounce(2 * x - 1)) / 2;
    },
};

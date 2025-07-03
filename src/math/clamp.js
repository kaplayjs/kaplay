"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = void 0;
var clamp = function(val, min, max) {
    if (min > max) {
        return (0, exports.clamp)(val, max, min);
    }
    return Math.min(Math.max(val, min), max);
};
exports.clamp = clamp;

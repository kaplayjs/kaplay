"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lerpNumber = lerpNumber;
function lerpNumber(a, b, t) {
    return a + (b - a) * t;
}

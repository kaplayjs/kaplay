"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mask = mask;
function mask(m) {
    if (m === void 0) { m = "intersect"; }
    return {
        id: "mask",
        mask: m,
    };
}

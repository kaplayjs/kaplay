"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stay = stay;
function stay(scenesToStay) {
    return {
        id: "stay",
        stay: true,
        scenesToStay: scenesToStay,
    };
}

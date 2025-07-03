"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayIsColor = arrayIsColor;
exports.arrayIsVec2 = arrayIsVec2;
exports.arrayIsNumber = arrayIsNumber;
var color_1 = require("../math/color");
var Vec2_1 = require("../math/Vec2");
function arrayIsColor(arr) {
    return arr[0] instanceof color_1.Color;
}
function arrayIsVec2(arr) {
    return arr[0] instanceof Vec2_1.Vec2;
}
function arrayIsNumber(arr) {
    return typeof arr[0] === "number";
}

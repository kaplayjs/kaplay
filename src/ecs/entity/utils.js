"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroy = destroy;
exports.getTreeRoot = getTreeRoot;
exports.isFixed = isFixed;
exports.isPaused = isPaused;
var shared_1 = require("../../shared");
function destroy(obj) {
    obj.destroy();
}
function getTreeRoot() {
    return shared_1._k.game.root;
}
function isFixed(obj) {
    if (obj.fixed) {
        return true;
    }
    return obj.parent ? isFixed(obj.parent) : false;
}
function isPaused(obj) {
    if (obj.paused) {
        return true;
    }
    return obj.parent ? isPaused(obj.parent) : false;
}

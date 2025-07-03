"use strict";
// Gravity manipulation
Object.defineProperty(exports, "__esModule", { value: true });
exports.setGravity = setGravity;
exports.getGravity = getGravity;
exports.setGravityDirection = setGravityDirection;
exports.getGravityDirection = getGravityDirection;
var math_1 = require("../math/math");
var shared_1 = require("../shared");
function setGravity(g) {
    // If g > 0 use either the current direction or use (0, 1)
    // Else null
    shared_1._k.game.gravity = g
        ? (shared_1._k.game.gravity || (0, math_1.vec2)(0, 1)).unit().scale(g)
        : null;
}
function getGravity() {
    // If gravity > 0 return magnitude
    // Else 0
    return shared_1._k.game.gravity ? shared_1._k.game.gravity.len() : 0;
}
function setGravityDirection(d) {
    // If gravity > 0 keep magnitude, otherwise use 1
    shared_1._k.game.gravity = d.unit().scale(shared_1._k.game.gravity ? shared_1._k.game.gravity.len() : 1);
}
function getGravityDirection() {
    // If gravity != null return unit vector, otherwise return (0, 1)
    return shared_1._k.game.gravity ? shared_1._k.game.gravity.unit() : (0, math_1.vec2)(0, 1);
}

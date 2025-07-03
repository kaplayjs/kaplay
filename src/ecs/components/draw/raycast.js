"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.raycast = raycast;
var shared_1 = require("../../../shared");
// this is not a component lol
function raycast(origin, direction, exclude) {
    var minHit;
    var shapes = shared_1._k.game.root.get("area");
    shapes.forEach(function (s) {
        if (exclude && exclude.some(function (tag) { return s.is(tag); }))
            return;
        var shape = s.worldArea();
        var hit = shape.raycast(origin, direction);
        if (hit) {
            if (minHit) {
                if (hit.fraction < minHit.fraction) {
                    minHit = hit;
                    minHit.object = s;
                }
            }
            else {
                minHit = hit;
                minHit.object = s;
            }
        }
    });
    return minHit;
}

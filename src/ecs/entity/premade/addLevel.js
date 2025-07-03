"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLevel = addLevel;
var math_1 = require("../../../math/math");
var shared_1 = require("../../../shared");
var level_1 = require("../../components/level/level");
var pos_1 = require("../../components/transform/pos");
function addLevel(map, opt, parent) {
    var _a;
    if (parent === void 0) { parent = shared_1._k.game.root; }
    return parent.add([(0, pos_1.pos)((_a = opt.pos) !== null && _a !== void 0 ? _a : (0, math_1.vec2)(0)), (0, level_1.level)(map, opt)]);
}

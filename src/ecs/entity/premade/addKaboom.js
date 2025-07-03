"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addKaboom = addKaboom;
var shared_1 = require("../../../shared");
var sprite_1 = require("../../components/draw/sprite");
var boom_1 = require("../../components/misc/boom");
var stay_1 = require("../../components/misc/stay");
var timer_1 = require("../../components/misc/timer");
var anchor_1 = require("../../components/transform/anchor");
var pos_1 = require("../../components/transform/pos");
var scale_1 = require("../../components/transform/scale");
function addKaboom(p, opt) {
    var _a, _b;
    if (opt === void 0) { opt = {}; }
    if (!shared_1._k.game.defaultAssets.boom || !shared_1._k.game.defaultAssets.ka) {
        throw new Error("You can't use addKaboom with kaplay/mini");
    }
    var kaboom = shared_1._k.game.root.add([
        (0, pos_1.pos)(p),
        (0, stay_1.stay)(),
    ]);
    var speed = (opt.speed || 1) * 5;
    var s = opt.scale || 1;
    kaboom.add(__spreadArray([
        (0, sprite_1.sprite)(shared_1._k.game.defaultAssets.boom),
        (0, scale_1.scale)(0),
        (0, anchor_1.anchor)("center"),
        (0, boom_1.boom)(speed, s)
    ], (_a = opt.comps) !== null && _a !== void 0 ? _a : [], true));
    var ka = kaboom.add(__spreadArray([
        (0, sprite_1.sprite)(shared_1._k.game.defaultAssets.ka),
        (0, scale_1.scale)(0),
        (0, anchor_1.anchor)("center"),
        (0, timer_1.timer)()
    ], (_b = opt.comps) !== null && _b !== void 0 ? _b : [], true));
    ka.wait(0.4 / speed, function () { return ka.use((0, boom_1.boom)(speed, s)); });
    ka.onDestroy(function () { return kaboom.destroy(); });
    return kaboom;
}

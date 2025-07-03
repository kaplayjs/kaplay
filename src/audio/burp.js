"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.burp = burp;
var shared_1 = require("../shared");
var play_1 = require("./play");
// core KAPLAY logic
function burp(opt) {
    if (!shared_1._k.game.defaultAssets.burp) {
        throw new Error("You can't use burp in kaplay/mini");
    }
    return (0, play_1.play)(shared_1._k.game.defaultAssets.burp, opt);
}

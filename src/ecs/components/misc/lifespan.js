"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lifespan = lifespan;
var easings_1 = require("../../../math/easings");
var shared_1 = require("../../../shared");
function lifespan(time, opt) {
    var _a;
    if (opt === void 0) { opt = {}; }
    if (time == null) {
        throw new Error("lifespan() requires time");
    }
    var fade = (_a = opt.fade) !== null && _a !== void 0 ? _a : 0;
    return {
        id: "lifespan",
        require: ["opacity"],
        add: function () {
            var _this = this;
            shared_1._k.game.root.wait(time, function () {
                var _a;
                _this.opacity = (_a = _this.opacity) !== null && _a !== void 0 ? _a : 1;
                if (fade > 0) {
                    shared_1._k.game.root.tween(_this.opacity, 0, fade, function (a) { return _this.opacity = a; }, easings_1.easings.linear).onEnd(function () {
                        _this.destroy();
                    });
                }
                else {
                    _this.destroy();
                }
            });
        },
    };
}

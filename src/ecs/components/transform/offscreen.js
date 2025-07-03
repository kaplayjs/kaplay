"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offscreen = offscreen;
var general_1 = require("../../../constants/general");
var globalEvents_1 = require("../../../events/globalEvents");
var stack_1 = require("../../../gfx/stack");
var math_1 = require("../../../math/math");
function offscreen(opt) {
    var _a;
    if (opt === void 0) { opt = {}; }
    var isOut = false;
    var screenRect = new math_1.Rect((0, math_1.vec2)(0), (0, stack_1.width)(), (0, stack_1.height)());
    var selfRect = new math_1.Rect((0, math_1.vec2)(0), 0, 0);
    var check = function (self) {
        if (self.isOffScreen()) {
            if (!isOut) {
                self.trigger("exitView");
                isOut = true;
            }
            if (opt.hide)
                self.hidden = true;
            if (opt.pause)
                self.paused = true;
            if (opt.destroy)
                self.destroy();
        }
        else {
            if (isOut) {
                self.trigger("enterView");
                isOut = false;
            }
            if (opt.hide)
                self.hidden = false;
            if (opt.pause)
                self.paused = false;
        }
    };
    return {
        id: "offscreen",
        require: ["pos"],
        offscreenDistance: (_a = opt.distance) !== null && _a !== void 0 ? _a : general_1.DEF_OFFSCREEN_DIS,
        isOffScreen: function () {
            var pos = this.screenPos();
            // This is not possible, screenPos() without arguments returns the pos
            if (!pos)
                return false;
            screenRect.width = (0, stack_1.width)();
            screenRect.height = (0, stack_1.height)();
            if (!this.offscreenDistance && this.width && this.height) {
                selfRect.width = this.width;
                selfRect.height = this.height;
                selfRect.pos = this.pos;
                return selfRect.collides(screenRect);
            }
            var dist = this.offscreenDistance
                ? this.offscreenDistance
                : general_1.DEF_OFFSCREEN_DIS;
            return !(0, math_1.testRectPoint)(screenRect, pos)
                && screenRect.sdistToPoint(pos) > (dist * dist);
        },
        onExitScreen: function (action) {
            return this.on("exitView", action);
        },
        onEnterScreen: function (action) {
            return this.on("enterView", action);
        },
        add: function () {
            var _this = this;
            if (opt.pause && opt.unpause)
                (0, globalEvents_1.onUpdate)(function () { return check(_this); });
            else
                this.onUpdate(function () { return check(_this); });
        },
    };
}

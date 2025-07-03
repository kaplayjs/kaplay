"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fakeMouse = void 0;
var shared_1 = require("../../../shared");
var fakeMouse = function(opt) {
    if (opt === void 0) {
        opt = {
            followMouse: true,
        };
    }
    var isPressed = false;
    return {
        id: "fakeMouse",
        require: ["pos"],
        add: function() {
            if (shared_1._k.game.fakeMouse) {
                throw new Error("Fake mouse already exists");
            }
            shared_1._k.game.fakeMouse = this;
        },
        destroy: function() {
            shared_1._k.game.fakeMouse = null;
        },
        get isPressed() {
            return isPressed;
        },
        update: function() {
            if (!opt.followMouse) {
                return;
            }
            if (shared_1._k.app.isMouseMoved()) {
                this.pos = shared_1._k.app.mousePos();
            }
        },
        press: function() {
            isPressed = true;
            this.trigger("press");
        },
        release: function() {
            isPressed = false;
            this.trigger("release");
        },
        onPress: function(action) {
            this.on("press", action);
        },
        onRelease: function(action) {
            this.on("release", action);
        },
    };
};
exports.fakeMouse = fakeMouse;

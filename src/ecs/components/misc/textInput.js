"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textInput = textInput;
var shared_1 = require("../../../shared");
function textInput(hasFocus, maxInputLength) {
    if (hasFocus === void 0) { hasFocus = true; }
    var charEv;
    var backEv;
    var origText = "";
    return {
        id: "textInput",
        get hasFocus() {
            return hasFocus;
        },
        set hasFocus(newValue) {
            var _this = this;
            if (hasFocus === newValue)
                return;
            hasFocus = newValue;
            this.trigger(hasFocus ? "focus" : "blur");
            if (hasFocus) {
                origText = this.typedText;
                shared_1._k.game.allTextInputs.forEach(function (i) {
                    // @ts-ignore
                    if (i !== _this) {
                        i.hasFocus = false;
                    }
                });
            }
            else if (origText !== this.typedText) {
                this.trigger("change");
            }
        },
        require: ["text"],
        typedText: "",
        add: function () {
            var _this = this;
            shared_1._k.game.allTextInputs.add(this);
            var flip = function () {
                _this.text = _this.typedText.replace(/([\[\\])/g, "\\$1");
                _this.trigger("input");
            };
            charEv = shared_1._k.app.onCharInput(function (character) {
                if (_this.hasFocus
                    && (!maxInputLength
                        || _this.typedText.length < maxInputLength)) {
                    if ((shared_1._k.app.isKeyDown("shift") !== shared_1._k.app.state.capsOn)) {
                        _this.typedText += character.toUpperCase();
                    }
                    else {
                        _this.typedText += character;
                    }
                    flip();
                }
            });
            backEv = shared_1._k.app.onKeyPressRepeat("backspace", function () {
                if (_this.hasFocus) {
                    _this.typedText = _this.typedText.slice(0, -1);
                    flip();
                }
            });
        },
        destroy: function () {
            charEv.cancel();
            backEv.cancel();
            shared_1._k.game.allTextInputs.delete(this);
        },
        focus: function () {
            this.hasFocus = true;
        },
        onFocus: function (cb) {
            return this.on("focus", cb);
        },
        onBlur: function (cb) {
            return this.on("blur", cb);
        },
        onInput: function (cb) {
            return this.on("input", cb);
        },
        onChange: function (cb) {
            return this.on("change", cb);
        },
    };
}

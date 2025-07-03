"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseButtonBindings = void 0;
var sets_1 = require("../utils/sets");
// pass the user `buttons` definition to different keymaps
var parseButtonBindings = function (appState) {
    var btns = appState.buttons;
    var _loop_1 = function (b) {
        var keyboardBtns = btns[b].keyboard && [btns[b].keyboard].flat();
        var keyboardCodes = btns[b].keyboardCode
            && [btns[b].keyboardCode].flat();
        var gamepadBtns = btns[b].gamepad && [btns[b].gamepad].flat();
        var mouseBtns = btns[b].mouse && [btns[b].mouse].flat();
        if (keyboardBtns) {
            keyboardBtns.forEach(function (k) {
                (0, sets_1.mapAddOrPush)(appState.buttonsByKey, k, b);
            });
        }
        if (keyboardCodes) {
            keyboardCodes.forEach(function (k) {
                (0, sets_1.mapAddOrPush)(appState.buttonsByKeyCode, k, b);
            });
        }
        if (gamepadBtns) {
            gamepadBtns.forEach(function (g) {
                (0, sets_1.mapAddOrPush)(appState.buttonsByGamepad, g, b);
            });
        }
        if (mouseBtns) {
            mouseBtns.forEach(function (m) {
                (0, sets_1.mapAddOrPush)(appState.buttonsByMouse, m, b);
            });
        }
    };
    for (var b in btns) {
        _loop_1(b);
    }
};
exports.parseButtonBindings = parseButtonBindings;

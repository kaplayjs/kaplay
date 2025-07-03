"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = void 0;
exports.deprecate = deprecate;
exports.warn = warn;
exports.deprecateMsg = deprecateMsg;
var shared_1 = require("../shared");
var getErrorMessage = function (error) {
    return (error instanceof Error) ? error.message : String(error);
};
exports.getErrorMessage = getErrorMessage;
function deprecate(oldName, newName, newFunc) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        deprecateMsg(oldName, newName);
        return newFunc.apply(void 0, args);
    };
}
function warn(msg) {
    if (!shared_1._k.game.warned.has(msg)) {
        shared_1._k.game.warned.add(msg);
        console.warn(msg);
    }
}
function deprecateMsg(oldName, newName) {
    warn("".concat(oldName, " is deprecated. Use ").concat(newName, " instead."));
}

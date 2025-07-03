"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shader = shader;
function shader(id, uniform) {
    return __assign(__assign({ id: "shader", shader: id }, (typeof uniform === "function"
        ? {
            uniform: uniform(),
            update: function () {
                this.uniform = uniform();
            },
        }
        : {
            uniform: uniform,
        })), { inspect: function () {
            return "shader: ".concat(id);
        } });
}

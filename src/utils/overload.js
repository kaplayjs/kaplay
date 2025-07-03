"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overload2 = overload2;
exports.overload3 = overload3;
exports.overload4 = overload4;
function overload2(fn1, fn2) {
    return (function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var al = args.length;
        if (al === fn1.length) {
            return fn1.apply(void 0, args);
        }
        if (al === fn2.length) {
            return fn2.apply(void 0, args);
        }
    });
}
function overload3(fn1, fn2, fn3) {
    return (function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var al = args.length;
        if (al === fn1.length) {
            return fn1.apply(void 0, args);
        }
        if (al === fn2.length) {
            return fn2.apply(void 0, args);
        }
        if (al === fn3.length) {
            return fn3.apply(void 0, args);
        }
    });
}
function overload4(fn1, fn2, fn3, fn4) {
    return (function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var al = args.length;
        if (al === fn1.length) {
            return fn1.apply(void 0, args);
        }
        if (al === fn2.length) {
            return fn2.apply(void 0, args);
        }
        if (al === fn3.length) {
            return fn3.apply(void 0, args);
        }
        if (al === fn4.length) {
            return fn4.apply(void 0, args);
        }
    });
}

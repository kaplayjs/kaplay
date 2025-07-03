"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapAddOrPush = exports.setHasOrIncludes = exports.isEqOrIncludes = void 0;
var isEqOrIncludes = function (listOrSmt, el) {
    if (Array.isArray(listOrSmt)) {
        return listOrSmt === null || listOrSmt === void 0 ? void 0 : listOrSmt.includes(el);
    }
    return listOrSmt === el;
};
exports.isEqOrIncludes = isEqOrIncludes;
var setHasOrIncludes = function (set, key) {
    if (Array.isArray(key)) {
        return key.some(function (k) { return set.has(k); });
    }
    return set.has(key);
};
exports.setHasOrIncludes = setHasOrIncludes;
var mapAddOrPush = function (map, key, value) {
    var _a;
    if (map.has(key)) {
        (_a = map.get(key)) === null || _a === void 0 ? void 0 : _a.push(value);
    }
    else {
        map.set(key, [value]);
    }
};
exports.mapAddOrPush = mapAddOrPush;

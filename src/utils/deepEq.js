"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepEq = deepEq;
function deepEq(o1, o2) {
    if (o1 === o2) {
        return true;
    }
    var t1 = typeof o1;
    var t2 = typeof o2;
    if (t1 !== t2) {
        return false;
    }
    if (t1 === "object" && t2 === "object" && o1 !== null && o2 !== null) {
        if (Array.isArray(o1) !== Array.isArray(o2)) {
            return false;
        }
        var k1 = Object.keys(o1);
        var k2 = Object.keys(o2);
        if (k1.length !== k2.length) {
            return false;
        }
        for (var _i = 0, k1_1 = k1; _i < k1_1.length; _i++) {
            var k = k1_1[_i];
            var v1 = o1[k];
            var v2 = o2[k];
            if (!deepEq(v1, v2)) {
                return false;
            }
        }
        return true;
    }
    return false;
}

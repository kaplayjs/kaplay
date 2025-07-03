"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOTTOM_RIGHT =
    exports.BOTTOM =
    exports.BOTTOM_LEFT =
    exports.RIGHT =
    exports.CENTER =
    exports.LEFT =
    exports.TOP_RIGHT =
    exports.TOP =
    exports.TOP_LEFT =
    exports.IDENTITY_MATRIX =
        void 0;
var Mat4_1 = require("../math/Mat4");
var Vec2_1 = require("../math/Vec2");
exports.IDENTITY_MATRIX = new Mat4_1.Mat4();
exports.TOP_LEFT = new Vec2_1.Vec2(-1, -1);
exports.TOP = new Vec2_1.Vec2(0, -1);
exports.TOP_RIGHT = new Vec2_1.Vec2(1, -1);
exports.LEFT = new Vec2_1.Vec2(-1, 0);
exports.CENTER = new Vec2_1.Vec2(0, 0);
exports.RIGHT = new Vec2_1.Vec2(1, 0);
exports.BOTTOM_LEFT = new Vec2_1.Vec2(-1, 1);
exports.BOTTOM = new Vec2_1.Vec2(0, 1);
exports.BOTTOM_RIGHT = new Vec2_1.Vec2(1, 1);

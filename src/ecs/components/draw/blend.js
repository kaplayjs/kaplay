"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blend = blend;
var types_1 = require("../../../types");
function blend(blend) {
    return {
        id: "blend",
        blend: blend !== null && blend !== void 0
            ? blend
            : types_1.BlendMode.Normal,
        inspect: function() {
            return "blend: ".concat(
                this.blend == types_1.BlendMode.Normal
                    ? "normal"
                    : this.blend == types_1.BlendMode.Add
                    ? "add"
                    : this.blend == types_1.BlendMode.Multiply
                    ? "multiply"
                    : "screen",
            );
        },
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.named = named;
var SerializableComponent_1 = require("../../../core/SerializableComponent");
// ...existing code...
function named(name) {
    var comp = {
        id: "named",
        name: name,
        serialize: function () {
            return { name: this.name };
        },
        deserialize: function (data) {
            if (typeof data.name === "string")
                this.name = data.name;
        },
    };
    (0, SerializableComponent_1.registerSerializableComponent)("named", comp);
    return comp;
}

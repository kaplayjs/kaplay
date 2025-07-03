"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.follow = follow;
var math_1 = require("../../../math/math");
function follow(obj, offset) {
    return {
        id: "follow",
        require: ["pos"],
        follow: {
            obj: obj,
            offset: offset !== null && offset !== void 0
                ? offset
                : (0, math_1.vec2)(0),
        },
        add: function() {
            if (obj.exists()) {
                this.pos = this.follow.obj.pos.add(this.follow.offset);
            }
        },
        update: function() {
            if (obj.exists()) {
                this.pos = this.follow.obj.pos.add(this.follow.offset);
            }
        },
    };
}

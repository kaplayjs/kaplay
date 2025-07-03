"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anchor = anchor;
function anchor(o) {
    if (!o) {
        throw new Error("Please define an anchor");
    }
    return {
        id: "anchor",
        anchor: o,
        inspect: function () {
            if (typeof this.anchor === "string") {
                return "anchor: " + this.anchor;
            }
            else {
                return "anchor: " + this.anchor.toString();
            }
        },
    };
}

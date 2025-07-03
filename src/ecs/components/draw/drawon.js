"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawon = drawon;
function drawon(c, opt) {
    return {
        add: function () {
            this.target = {
                destination: c,
                childrenOnly: opt === null || opt === void 0 ? void 0 : opt.childrenOnly,
                refreshOnly: opt === null || opt === void 0 ? void 0 : opt.refreshOnly,
            };
        },
        refresh: function () {
            if (this.target) {
                this.target.isFresh = false;
            }
        },
    };
}

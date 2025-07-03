"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doubleJump = doubleJump;
function doubleJump(numJumps) {
    if (numJumps === void 0) numJumps = 2;
    var jumpsLeft = numJumps;
    return {
        id: "doubleJump",
        require: ["body"],
        numJumps: numJumps,
        add: function() {
            var _this = this;
            this.onGround(function() {
                jumpsLeft = _this.numJumps;
            });
        },
        doubleJump: function(force) {
            if (jumpsLeft <= 0) {
                return;
            }
            if (jumpsLeft < this.numJumps) {
                this.trigger("doubleJump");
            }
            jumpsLeft--;
            this.jump(force);
        },
        onDoubleJump: function(action) {
            return this.on("doubleJump", action);
        },
        inspect: function() {
            return "jumpsLeft: ".concat(jumpsLeft);
        },
    };
}

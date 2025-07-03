"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.picture = picture;
var utils_1 = require("../../../game/utils");
var drawPicture_1 = require("../../../gfx/draw/drawPicture");
function picture(picture) {
    return {
        id: "picture",
        picture: picture,
        draw: function() {
            (0, drawPicture_1.drawPicture)(
                this.picture,
                (0, utils_1.getRenderProps)(this),
            );
        },
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAseprite = loadAseprite;
var math_1 = require("../math/math");
var shared_1 = require("../shared");
var dataURL_1 = require("../utils/dataURL");
var asset_1 = require("./asset");
var sprite_1 = require("./sprite");
var utils_1 = require("./utils");
function loadAseprite(name, imgSrc, jsonSrc) {
    imgSrc = (0, utils_1.fixURL)(imgSrc);
    jsonSrc = (0, utils_1.fixURL)(jsonSrc);
    if (typeof imgSrc === "string" && !jsonSrc) {
        jsonSrc = (0, dataURL_1.getFileName)(imgSrc) + ".json";
    }
    var resolveJSON = typeof jsonSrc === "string"
        ? (0, asset_1.fetchJSON)(jsonSrc)
        : Promise.resolve(jsonSrc);
    return shared_1._k.assets.sprites.add(
        name,
        resolveJSON.then(function(data) {
            var size = data.meta.size;
            var frames = data.frames.map(function(f) {
                return new math_1.Quad(
                    f.frame.x / size.w,
                    f.frame.y / size.h,
                    f.frame.w / size.w,
                    f.frame.h / size.h,
                );
            });
            var anims = {};
            for (var _i = 0, _a = data.meta.frameTags; _i < _a.length; _i++) {
                var anim = _a[_i];
                if (anim.from === anim.to) {
                    anims[anim.name] = anim.from;
                }
                else {
                    anims[anim.name] = {
                        from: anim.from,
                        to: anim.to,
                        speed: 10,
                        loop: true,
                        pingpong: anim.direction === "pingpong",
                    };
                }
            }
            return sprite_1.SpriteData.from(imgSrc, {
                frames: frames,
                anims: anims,
            });
        }),
    );
}

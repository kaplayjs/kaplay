"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSpriteAtlas = loadSpriteAtlas;
var general_1 = require("../constants/general");
var math_1 = require("../math/math");
var shared_1 = require("../shared");
var asset_1 = require("./asset");
var sprite_1 = require("./sprite");
var utils_1 = require("./utils");
function loadSpriteAtlas(src, data) {
    src = (0, utils_1.fixURL)(src);
    if (typeof data === "string") {
        return (0, asset_1.load)(
            new Promise(function(res, rej) {
                (0, asset_1.fetchJSON)(data).then(function(json) {
                    loadSpriteAtlas(src, json).then(res).catch(rej);
                });
            }),
        );
    }
    return (0, asset_1.load)(
        sprite_1.SpriteData.from(src).then(function(atlas) {
            var map = {};
            var _loop_1 = function(name_1) {
                var info = data[name_1];
                var quad = atlas.frames[0];
                var w = general_1.SPRITE_ATLAS_WIDTH * quad.w;
                var h = general_1.SPRITE_ATLAS_HEIGHT * quad.h;
                var frames_1 = info.frames
                    ? info.frames.map(function(f) {
                        return new math_1.Quad(
                            quad.x + (info.x + f.x) / w * quad.w,
                            quad.y + (info.y + f.y) / h * quad.h,
                            f.w / w * quad.w,
                            f.h / h * quad.h,
                        );
                    })
                    : (0, sprite_1.slice)(
                        info.sliceX || 1,
                        info.sliceY || 1,
                        quad.x + info.x / w * quad.w,
                        quad.y + info.y / h * quad.h,
                        info.width / w * quad.w,
                        info.height / h * quad.h,
                    );
                var spr = new sprite_1.SpriteData(
                    atlas.tex,
                    frames_1,
                    info.anims,
                );
                shared_1._k.assets.sprites.addLoaded(name_1, spr);
                map[name_1] = spr;
            };
            for (var name_1 in data) {
                _loop_1(name_1);
            }
            return map;
        }),
    );
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFontCache = void 0;
var general_1 = require("../constants/general");
var createFontCache = function() {
    var fontCacheCanvas = document.createElement("canvas");
    fontCacheCanvas.width = general_1.MAX_TEXT_CACHE_SIZE;
    fontCacheCanvas.height = general_1.MAX_TEXT_CACHE_SIZE;
    var fontCacheC2d = fontCacheCanvas.getContext("2d", {
        willReadFrequently: true,
    });
    return {
        fontCacheCanvas: fontCacheCanvas,
        fontCacheC2d: fontCacheC2d,
    };
};
exports.createFontCache = createFontCache;

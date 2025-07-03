"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixURL = fixURL;
var shared_1 = require("../shared");
var dataURL_1 = require("../utils/dataURL");
function fixURL(url) {
    if (typeof url == "string" && window.kaplayjs_assetsAliases[url]) {
        url = window.kaplayjs_assetsAliases[url];
    }
    if (typeof url !== "string" || (0, dataURL_1.isDataURL)(url))
        return url;
    return shared_1._k.assets.urlPrefix + url;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAssets = exports.AssetBucket = exports.Asset = void 0;
exports.fetchURL = fetchURL;
exports.fetchJSON = fetchJSON;
exports.fetchText = fetchText;
exports.fetchArrayBuffer = fetchArrayBuffer;
exports.loadRoot = loadRoot;
exports.loadJSON = loadJSON;
exports.loadImg = loadImg;
exports.loadProgress = loadProgress;
exports.getFailedAssets = getFailedAssets;
exports.getAsset = getAsset;
exports.load = load;
var general_1 = require("../constants/general");
var events_1 = require("../events/events");
var TexPacker_1 = require("../gfx/TexPacker");
var shared_1 = require("../shared");
var utils_1 = require("./utils");
/**
 * An asset is a resource that is loaded asynchronously.
 *
 * It can be a sprite, a sound, a font, a shader, etc.
 */
var Asset = /** @class */ function() {
    function Asset(loader) {
        var _this = this;
        this.loaded = false;
        this.data = null;
        this.error = null;
        this.onLoadEvents = new events_1.KEvent();
        this.onErrorEvents = new events_1.KEvent();
        this.onFinishEvents = new events_1.KEvent();
        loader.then(function(data) {
            _this.loaded = true;
            _this.data = data;
            _this.onLoadEvents.trigger(data);
        }).catch(function(err) {
            _this.error = err;
            if (_this.onErrorEvents.numListeners() > 0) {
                _this.onErrorEvents.trigger(err);
            }
            else {
                throw err;
            }
        }).finally(function() {
            _this.onFinishEvents.trigger();
            _this.loaded = true;
        });
    }
    Asset.loaded = function(data) {
        var asset = new Asset(Promise.resolve(data));
        asset.data = data;
        asset.loaded = true;
        return asset;
    };
    Asset.prototype.onLoad = function(action) {
        if (this.loaded && this.data) {
            action(this.data);
        }
        else {
            this.onLoadEvents.add(action);
        }
        return this;
    };
    Asset.prototype.onError = function(action) {
        if (this.loaded && this.error) {
            action(this.error);
        }
        else {
            this.onErrorEvents.add(action);
        }
        return this;
    };
    Asset.prototype.onFinish = function(action) {
        if (this.loaded) {
            action();
        }
        else {
            this.onFinishEvents.add(action);
        }
        return this;
    };
    Asset.prototype.then = function(action) {
        return this.onLoad(action);
    };
    Asset.prototype.catch = function(action) {
        return this.onError(action);
    };
    Asset.prototype.finally = function(action) {
        return this.onFinish(action);
    };
    return Asset;
}();
exports.Asset = Asset;
var AssetBucket = /** @class */ function() {
    function AssetBucket() {
        this.assets = new Map();
        this.waiters = new events_1.KEventHandler();
        this.errorWaiters = new events_1.KEventHandler();
        this.lastUID = 0;
    }
    AssetBucket.prototype.add = function(name, loader) {
        var _this = this;
        // if user don't provide a name we use a generated one
        var id = name !== null && name !== void 0
            ? name
            : (this.lastUID++ + "");
        var asset = new Asset(loader);
        this.assets.set(id, asset);
        asset.onLoad(function(d) {
            _this.waiters.trigger(id, d);
        });
        asset.onError(function(d) {
            _this.errorWaiters.trigger(id, d);
        });
        return asset;
    };
    AssetBucket.prototype.addLoaded = function(name, data) {
        var id = name !== null && name !== void 0
            ? name
            : (this.lastUID++ + "");
        var asset = Asset.loaded(data);
        this.assets.set(id, asset);
        this.waiters.trigger(id, data);
        this.errorWaiters.remove(id);
        return asset;
    };
    // if not found return undefined
    AssetBucket.prototype.get = function(handle) {
        return this.assets.get(handle);
    };
    AssetBucket.prototype.progress = function() {
        if (this.assets.size === 0) {
            return 1;
        }
        var loaded = 0;
        this.assets.forEach(function(asset) {
            if (asset.loaded) {
                loaded++;
            }
        });
        return loaded / this.assets.size;
    };
    AssetBucket.prototype.getFailedAssets = function() {
        var _this = this;
        return Array.from(this.assets.keys()).filter(function(a) {
            return _this.assets.get(a).error !== null;
        }).map(function(a) {
            return [a, _this.assets.get(a)];
        });
    };
    AssetBucket.prototype.waitFor = function(name, timeout) {
        var asset = this.get(name);
        if (asset) {
            if (asset.loaded) {
                return Promise.resolve(asset.data);
            }
            else {
                return Promise.race([
                    new Promise(function(res, rej) {
                        asset.onLoad(res);
                        asset.onError(rej);
                    }),
                    new Promise(function(_, rej) {
                        return setTimeout(function() {
                            return rej("timed out waiting for asset " + name);
                        }, timeout);
                    }),
                ]);
            }
        }
        var x = Promise.withResolvers();
        this.waiters.onOnce(name, x.resolve);
        this.errorWaiters.onOnce(name, x.reject);
        setTimeout(function() {
            return x.reject("timed out waiting for asset " + name);
        }, timeout);
        return x.promise;
    };
    return AssetBucket;
}();
exports.AssetBucket = AssetBucket;
function fetchURL(url) {
    return fetch(url).then(function(res) {
        if (!res.ok) {
            throw new Error("Failed to fetch \"".concat(url, "\""));
        }
        return res;
    });
}
function fetchJSON(path) {
    return fetchURL(path).then(function(res) {
        return res.json();
    });
}
function fetchText(path) {
    return fetchURL(path).then(function(res) {
        return res.text();
    });
}
function fetchArrayBuffer(path) {
    return fetchURL(path).then(function(res) {
        return res.arrayBuffer();
    });
}
// global load path prefix
function loadRoot(path) {
    if (path !== undefined) {
        shared_1._k.assets.urlPrefix = path;
    }
    return shared_1._k.assets.urlPrefix;
}
function loadJSON(name, url) {
    return shared_1._k.assets.custom.add(
        name,
        fetchJSON((0, utils_1.fixURL)(url)),
    );
}
// wrapper around image loader to get a Promise
function loadImg(src) {
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    return new Promise(function(resolve, reject) {
        img.onload = function() {
            return resolve(img);
        };
        img.onerror = function() {
            return reject(
                new Error("Failed to load image from \"".concat(src, "\"")),
            );
        };
    });
}
function loadProgress() {
    var buckets = [
        shared_1._k.assets.sprites,
        shared_1._k.assets.sounds,
        shared_1._k.assets.shaders,
        shared_1._k.assets.fonts,
        shared_1._k.assets.bitmapFonts,
        shared_1._k.assets.custom,
    ];
    return buckets.reduce(function(n, bucket) {
        return n + bucket.progress();
    }, 0)
        / buckets.length;
}
function getFailedAssets() {
    var buckets = [
        shared_1._k.assets.sprites,
        shared_1._k.assets.sounds,
        shared_1._k.assets.shaders,
        shared_1._k.assets.fonts,
        shared_1._k.assets.bitmapFonts,
        shared_1._k.assets.custom,
    ];
    return buckets.reduce(function(fails, bucket) {
        return fails.concat(bucket.getFailedAssets());
    }, []);
}
function getAsset(name) {
    var _a;
    return (_a = shared_1._k.assets.custom.get(name)) !== null && _a !== void 0
        ? _a
        : null;
}
// wrap individual loaders with global loader counter, for stuff like progress bar
function load(prom) {
    return shared_1._k.assets.custom.add(null, prom);
}
var initAssets = function(ggl, spriteAtlasPadding) {
    var assets = {
        urlPrefix: "",
        // asset holders
        sprites: new AssetBucket(),
        fonts: new AssetBucket(),
        bitmapFonts: new AssetBucket(),
        sounds: new AssetBucket(),
        shaders: new AssetBucket(),
        custom: new AssetBucket(),
        music: {},
        packer: new TexPacker_1.TexPacker(
            ggl,
            general_1.SPRITE_ATLAS_WIDTH,
            general_1.SPRITE_ATLAS_HEIGHT,
            spriteAtlasPadding,
        ),
        // if we finished initially loading all assets
        loaded: false,
    };
    return assets;
};
exports.initAssets = initAssets;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.layer = layer;
var shared_1 = require("../../../shared");
function layer(layer) {
    var _a;
    var _layerIndex = (_a = shared_1._k.game.layers) === null || _a === void 0
        ? void 0
        : _a.indexOf(layer);
    if (_layerIndex == -1) {
        throw new Error("Layer \"".concat(layer, "\" does not exist"));
    }
    return {
        id: "layer",
        get layerIndex() {
            return _layerIndex !== null && _layerIndex !== void 0
                ? _layerIndex
                : null;
        },
        get layer() {
            var _a, _b;
            if (!_layerIndex) {
                return null;
            }
            return (_b = (_a = shared_1._k.game.layers) === null
                                || _a === void 0
                            ? void 0
                            : _a[_layerIndex]) !== null && _b !== void 0
                ? _b
                : null;
        },
        set layer(value) {
            var _a;
            _layerIndex =
                (_a = shared_1._k.game.layers) === null || _a === void 0
                    ? void 0
                    : _a.indexOf(value);
            if (_layerIndex == -1) {
                throw new Error("Layer \"".concat(value, "\" does not exist"));
            }
        },
        inspect: function() {
            return "layer: ".concat(this.layer);
        },
    };
}

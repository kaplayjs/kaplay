"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSerializableComponent = registerSerializableComponent;
exports.saveAll = saveAll;
exports.loadAll = loadAll;
// Registro global de componentes serializables
var serializableRegistry = new Map();
function registerSerializableComponent(id, comp) {
    serializableRegistry.set(id, comp);
}
function saveAll() {
    var state = {};
    for (
        var _i = 0, _a = serializableRegistry.entries();
        _i < _a.length;
        _i++
    ) {
        var _b = _a[_i], id = _b[0], comp = _b[1];
        state[id] = comp.serialize();
    }
    return state;
}
function loadAll(state) {
    for (var _i = 0, _a = Object.entries(state); _i < _a.length; _i++) {
        var _b = _a[_i], id = _b[0], data = _b[1];
        var comp = serializableRegistry.get(id);
        if (comp) {
            comp.deserialize(data);
        }
    }
}

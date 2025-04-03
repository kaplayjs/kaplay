import { _k } from "../kaplay";
import { deprecateMsg } from "../utils/log";

export function setLayers(layerNames: string[], defaultLayer: string) {
    if (_k.game.layers) {
        throw Error("Layers can only be assigned once.");
    }
    const defaultLayerIndex = layerNames.indexOf(defaultLayer);
    if (defaultLayerIndex == -1) {
        throw Error(
            "The default layer name should be present in the layers list.",
        );
    }
    _k.game.layers = layerNames;
    _k.game.defaultLayerIndex = defaultLayerIndex;
}

export function getLayers() {
    return _k.game.layers;
}

export function getDefaultLayer() {
    return _k.game.layers?.[_k.game.defaultLayerIndex] ?? null;
}

export function layers(layerNames: string[], defaultLayer: string) {
    deprecateMsg("layers", "setLayers");
    setLayers(layerNames, defaultLayer);
}

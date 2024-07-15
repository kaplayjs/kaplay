import { game } from "../kaplay";

export const layers = function(layerNames: string[], defaultLayer: string) {
    if (game.layers) {
        throw Error("Layers can only be assigned once.");
    }
    const defaultLayerIndex = layerNames.indexOf(defaultLayer);
    if (defaultLayerIndex == -1) {
        throw Error(
            "The default layer name should be present in the layers list.",
        );
    }
    game.layers = layerNames;
    game.defaultLayerIndex = defaultLayerIndex;
};

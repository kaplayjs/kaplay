import { getKaboomContext } from "../../kaboom";
import type { Comp } from "../../types";

/**
 * The {@link layer `layer()`} component.
 *
 * @group Component Types
 */
export interface LayerComp extends Comp {
    get layerIndex(): number;
    /**
     * Get the name of the current layer the object is assigned to.
     */
    get layer(): string;
    /**
     * Set the name of the layer the object should be assigned to.
     */
    set layer(name: string);
}

export function layer(layer: string): LayerComp {
    const k = getKaboomContext(this);
    const { game } = k._k;

    let _layerIndex = game.layers.indexOf(layer);
    return {
        id: "layer",
        get layerIndex() {
            return _layerIndex;
        },
        get layer(): string {
            return game.layers[_layerIndex];
        },
        set layer(value: string) {
            _layerIndex = game.layers.indexOf(value);
            if (_layerIndex == -1) throw Error("Invalid layer name");
        },
        inspect() {
            return `layer: ${this.layer}`;
        },
    };
}

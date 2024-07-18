import { game } from "../../kaplay";
import type { Comp } from "../../types";

/**
 * The {@link layer `layer()`} component.
 *
 * @group Component Types
 */
export interface LayerComp extends Comp {
    /**
     * Get the index of the current layer the object is assigned to.
     *
     * @returns The index of the layer the object is assigned to, or `null` if the layer does not exist.
     */
    get layerIndex(): number | null;
    /**
     * Get the name of the current layer the object is assigned to.
     *
     * @returns The name of the layer the object is assigned to.
     */
    get layer(): string | null;
    /**
     * Set the name of the layer the object should be assigned to.
     */
    set layer(name: string);
}

export function layer(layer: string): LayerComp {
    let _layerIndex = game.layers?.indexOf(layer);

    return {
        id: "layer",
        get layerIndex() {
            return _layerIndex ?? null;
        },
        get layer(): string | null {
            if (!_layerIndex) return null;

            return game.layers?.[_layerIndex] ?? null;
        },
        set layer(value: string) {
            _layerIndex = game.layers?.indexOf(value);

            if (_layerIndex == -1) throw Error("Invalid layer name");
        },
        inspect() {
            return `layer: ${this.layer}`;
        },
    };
}

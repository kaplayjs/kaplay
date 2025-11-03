import { _k } from "../../../shared";
import type { Comp } from "../../../types";

/**
 * The {@link layer `layer()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface LayerComp extends Comp {
    /**
     * Get the index of the current layer the object is assigned to.
     *
     * Will always be `null` if the game doesn't use layers.
     */
    get layerIndex(): number | null;
    /**
     * Get the name of the current layer the object is assigned to.
     *
     * Will always be `null` if the game doesn't use layers.
     */
    get layer(): string | null;
    /**
     * Set the name of the layer the object should be assigned to.
     *
     * Throws an error if the game uses layers and the requested layer
     * wasn't defined.
     */
    set layer(name: string);

    serialize(): { layer: string | null };
}

export function layer(layer: string): LayerComp {
    let _layerIndex = _k.game.layers?.indexOf(layer);
    if (_layerIndex == -1) {
        throw new Error(`Layer "${layer}" does not exist`);
    }

    return {
        id: "layer",
        get layerIndex() {
            return _layerIndex ?? null;
        },
        get layer(): string | null {
            if (!_layerIndex) return null;

            return _k.game.layers?.[_layerIndex] ?? null;
        },
        set layer(value: string) {
            _layerIndex = _k.game.layers?.indexOf(value);

            if (_layerIndex == -1) {
                throw new Error(`Layer "${value}" does not exist`);
            }
        },
        inspect() {
            return `layer: ${this.layer}`;
        },
        serialize() {
            return { layer: this.layer };
        },
    };
}

export function layerFactory(data: any) {
    return layer(data.layer);
}

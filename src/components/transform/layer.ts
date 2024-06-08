import { getInternalContext, getKaboomContext } from "@/kaboom";
import type { LayerComp } from "@/types";

export function layer(layer: string): LayerComp {
    const k = getKaboomContext(this);
    const internal = getInternalContext(k);
    let _layerIndex = internal.game.layers.indexOf(layer);
    return {
        id: "layer",
        get layerIndex() {
            return _layerIndex;
        },
        get layer(): string {
            return k.layers[_layerIndex];
        },
        set layer(value: string) {
            _layerIndex = internal.game.layers.indexOf(value);
            if (_layerIndex == -1) throw Error("Invalid layer name");
        },
        inspect() {
            return `${this.layer}`;
        },
    };
}

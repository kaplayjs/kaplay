import type { Comp } from "../../../types";

/**
 * The serialized {@link z `z()`} component.
 *
 * @group Component Serialization
 */
export interface SerializedZComp {
    z: number;
}

/**
 * The {@link z `z()`} component.
 *
 * @group Component Types
 */
export interface ZComp extends Comp {
    /**
     * Defines the z-index of this game obj
     */
    z: number;
    /**
     * Serialize the current state comp
     */
    serialize(): SerializedZComp;
}

export function z(z: number): ZComp {
    return {
        id: "z",
        z: z,
        inspect() {
            return `z: ${this.z}`;
        },
        serialize() {
            return { z: this.z };
        },
    };
}

export function zFactory(data: SerializedZComp) {
    return z(data.z);
}

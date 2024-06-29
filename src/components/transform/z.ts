import type { Comp } from "../../types";

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
}

export function z(z: number): ZComp {
    return {
        id: "z",
        z: z,
        inspect() {
            return `z: ${this.z}`;
        },
    };
}

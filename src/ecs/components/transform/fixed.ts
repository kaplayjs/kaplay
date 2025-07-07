import type { Comp } from "../../../types";

/**
 * The serialized {@link fixed `fixed()`} component.
 *
 * @group Component Serialization
 */
export interface SerializedFixedComp {
    fixed?: boolean;
}

/**
 * The {@link fixed `fixed()`} component.
 *
 * @group Component Types
 */
export interface FixedComp extends Comp {
    /**
     * If the obj is unaffected by camera
     */
    fixed: boolean;

    serialize(): SerializedFixedComp;
}

export function fixed(fixed = true): FixedComp {
    return {
        id: "fixed",
        fixed: fixed,
        serialize() {
            return { fixed: this.fixed };
        },
    };
}

export function fixedFactory(data: SerializedFixedComp) {
    return fixed(data.fixed);
}

import type { Comp } from "../../types";

/**
 * The {@link named `named()`} component.
 *
 * @group Component Types
 */
export interface NamedComp extends Comp {
    /** The name assigned to this object. */
    name: string;
}

export function named(name: string): NamedComp {
    return {
        id: "named",
        name,
    };
}

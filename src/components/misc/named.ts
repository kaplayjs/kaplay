import type { Comp } from "../../types";

/**
 * The {@link named `named()`} component.
 *
 * @group Components
 */
export interface NamedComp extends Comp {
    /** The name assigned to this object. */
    name: string;
}

export function named(name: string): NamedComp {
    return {
        name,
    };
}

import type { Comp } from "../../../types";

/**
 * The serialized {@link named `named()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedNamedComp {
    name: string;
}

/**
 * The {@link named `named()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface NamedComp extends Comp {
    /** The name assigned to this object. */
    name: string;
    serialize(): SerializedNamedComp;
}

export function named(name: string): NamedComp {
    return {
        id: "named",
        name,
        serialize() {
            return {
                name: name,
            };
        },
    };
}

export function namedFactory(data: any) {
    return named(data.name);
}

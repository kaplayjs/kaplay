import type { Comp } from "../../../types";

/**
 * The serialized {@link color `color()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializeNameComp {
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
    serialize(): SerializeNameComp;
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

export function nameFactory(data: any) {
    return named(data.name);
}

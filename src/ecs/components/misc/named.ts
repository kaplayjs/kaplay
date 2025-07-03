import type { Comp } from "../../../types.js";
import type { SerializableComponent } from "../../../core/SerializableComponent.js";
import { registerSerializableComponent } from "../../../core/SerializableComponent.js";

/**
 * The {@link named `named()`} component.
 *
 * @group Component Types
 */


export interface NamedComp extends Comp, SerializableComponent {
    /** The name assigned to this object. */
    name: string;
    id?: string;
}
// ...existing code...

export function named(name: string): NamedComp {
    const comp: NamedComp = {
        id: "named",
        name,
        serialize() {
            return { name: this.name };
        },
        deserialize(data: Record<string, any>) {
            if (typeof data.name === "string") this.name = data.name;
        },
    };
    registerSerializableComponent("named", comp);
    return comp;
}


// Template for making any Kaplay component serializable
import type { Comp } from "../src/types";
import type { SerializableComponent } from "../src/core/SerializableComponent";
import { registerSerializableComponent } from "../src/core/SerializableComponent";

// Extend your component interface with SerializableComponent
export interface ExampleComp extends Comp, SerializableComponent {
    // ...component properties...
}

// Implement the component constructor
export function exampleComp(param1: any, param2: any): ExampleComp {
    const comp: ExampleComp = {
        id: "exampleComp",
        // ...component properties and methods...
        serialize() {
            return {
                // Return an object with the relevant state
                // e.g. value1: this.value1, value2: this.value2
            };
        },
        deserialize(data: Record<string, any>) {
            // Restore the state from the received object
            // e.g. if (typeof data.value1 === "number") this.value1 = data.value1;
        },
    };
    registerSerializableComponent("exampleComp", comp);
    return comp;
}

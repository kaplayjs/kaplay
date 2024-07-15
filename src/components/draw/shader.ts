import type { Uniform } from "../../assets";
import type { Comp } from "../../types";

/**
 * The {@link shader `shader()`} component.
 *
 * @group Component Types
 */
export interface ShaderComp extends Comp {
    uniform?: Uniform;
    shader: string;
}

export function shader(
    id: string,
    uniform?: Uniform | (() => Uniform),
): ShaderComp {
    return {
        id: "shader",
        shader: id,
        ...(typeof uniform === "function"
            ? {
                uniform: uniform(),
                update() {
                    this.uniform = uniform();
                },
            }
            : {
                uniform: uniform,
            }),
        inspect() {
            return `shader: ${id}`;
        },
    };
}

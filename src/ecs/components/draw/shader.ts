import type { Uniform } from "../../../assets/shader";
import type { Comp } from "../../../types";

/**
 * The {@link shader `shader()`} component.
 *
 * @group Component Types
 */
export interface ShaderComp extends Comp {
    /**
     * Uniform values to pass to the shader.
     */
    uniform?: Uniform;
    /**
     * The shader ID.
     */
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

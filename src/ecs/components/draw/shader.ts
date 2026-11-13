import type { Uniform } from "../../../assets/shader";
import type { Comp } from "../../../types";

/**
 * The serialized {@link shader `shader()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedShaderComp {
    shader: string;
}

/**
 * The {@link shader `shader()`} component.
 *
 * @group Components
 * @subgroup Component Types
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
    /**
     * Note: Only simple shaders with no `uniform` passed are supported.
     */
    serialize(): SerializedShaderComp;
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
        serialize() {
            return { shader: this.shader };
        },
    };
}

export function shaderFactory(data: SerializedShaderComp) {
    return shader(data.shader);
}

import { ShaderComp, Uniform } from "@/types";

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
            return `shader(${id})`
        },
    };
}

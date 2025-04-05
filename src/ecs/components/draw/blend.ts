import { BlendMode, type Comp } from "../../../types";

/**
 * The {@link blend `blend()`} component.
 *
 * @group Component Types
 */
export interface BlendComp extends Comp {
    blend: BlendMode;
}

export function blend(blend: BlendMode): BlendComp {
    return {
        id: "color",
        blend: blend ?? BlendMode.Normal,
        inspect() {
            return `blend: ${
                this.blend == BlendMode.Normal
                    ? "normal"
                    : this.blend == BlendMode.Add
                    ? "add"
                    : this.blend == BlendMode.Multiply
                    ? "multiply"
                    : "screen"
            }`;
        },
    };
}

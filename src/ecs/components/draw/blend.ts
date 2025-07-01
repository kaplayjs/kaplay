import { BlendMode, type Comp } from "../../../types";

/**
 * The {@link blend `blend()`} component.
 *
 * @group Component Types
 */
export interface BlendComp extends Comp {
    blend: BlendMode;
    serialize(): { blend: BlendMode },
}

export function blend(blend: BlendMode): BlendComp {
    return {
        id: "blend",
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
        serialize() {
            return { blend: this.blend }
        }
    };
}

export function blendFactory(data: { blend: BlendMode }) {
    return blend(data.blend)
}
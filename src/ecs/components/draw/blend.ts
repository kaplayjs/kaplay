import { BlendMode, type Comp } from "../../../types";

/**
 * The serialized {@link blend `blend()`} component.
 *
 * @group Component Serialization
 */
export interface SerializedBlendComp {
    blend: BlendMode;
}

/**
 * The {@link blend `blend()`} component.
 *
 * @group Component Types
 */
export interface BlendComp extends Comp {
    blend: BlendMode;
    serialize(): SerializedBlendComp;
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
            return { blend: this.blend };
        },
    };
}

export function blendFactory(data: SerializedBlendComp) {
    return blend(data.blend);
}

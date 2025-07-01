import { BlendMode, type Comp } from "../../../types";

/**
 * The serialized {@link blend `blend()`} component.
 *
 * @group Component Serializations
 */
export interface SerializeBlendComp {
    blend: BlendMode
}

/**
 * The {@link blend `blend()`} component.
 *
 * @group Component Types
 */
export interface BlendComp extends Comp {
    blend: BlendMode;
    serialize(): SerializeBlendComp,
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

export function blendFactory(data: any) {
    return blend(data.blend)
}
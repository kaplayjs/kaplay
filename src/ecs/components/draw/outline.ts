import type { LineCap, LineJoin } from "../../../gfx/draw/drawLine";
import { Color, rgb, type SerializedColor } from "../../../math/color";
import type { Comp, Outline } from "../../../types";

/**
 * The serialized {@link outline `outline()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedOutlineComp {
    outline: {
        width: number;
        color: SerializedColor;
        opacity: number;
        join: LineJoin;
        miterLimit: number;
        cap: LineCap;
    };
}

/**
 * The {@link outline `outline()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface OutlineComp extends Comp {
    outline: Outline;
    serialize(): SerializedOutlineComp;
}

export function outline(
    width: number = 1,
    color: Color = rgb(0, 0, 0),
    opacity: number = 1,
    join: LineJoin = "miter",
    miterLimit: number = 10,
    cap: LineCap = "butt",
): OutlineComp {
    return {
        id: "outline",
        outline: {
            width,
            color,
            opacity,
            join,
            miterLimit,
            cap,
        },
        inspect() {
            return `outline: ${this.outline.width}px, ${this.outline.color}`;
        },
        serialize() {
            return {
                outline: {
                    width: this.outline.width ?? 1,
                    color: {
                        r: this.outline.color?.r ?? 255,
                        g: this.outline.color?.g ?? 255,
                        b: this.outline.color?.b ?? 255,
                    },
                    opacity: this.outline.opacity ?? 1,
                    join: this.outline.join ?? "miter",
                    miterLimit: this.outline.miterLimit ?? 10,
                    cap: this.outline.cap ?? "butt",
                },
            };
        },
    };
}

export function outlineFactory(data: SerializedOutlineComp) {
    return outline(
        data.outline.width,
        Color.deserialize(data.outline.color),
        data.outline.opacity,
        data.outline.join,
        data.outline.miterLimit,
        data.outline.cap,
    );
}

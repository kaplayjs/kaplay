import type { Asset } from "../assets/asset";
import type { ShaderData, Uniform } from "../assets/shader";
import type { BlendComp } from "../ecs/components/draw/blend";
import type { ColorComp } from "../ecs/components/draw/color";
import type { OpacityComp } from "../ecs/components/draw/opacity";
import type { OutlineComp } from "../ecs/components/draw/outline";
import type { ShaderComp } from "../ecs/components/draw/shader";
import type { AnchorComp } from "../ecs/components/transform/anchor";
import type { Color } from "../math/color";
import type { Vec2 } from "../math/Vec2";
import type { Anchor, BlendMode, Outline } from "../types";

type WithOtherKeys<T> = T & {
    [key: string]: any;
};

export interface TransformProps {
    pos?: Vec2;
    scale?: Vec2;
    angle?: number;
    fixed?: boolean;
}

export interface DrawProps {
    color?: Color;
    opacity?: number;
    /**
     * The anchor point.
     */
    anchor?: Anchor | Vec2;
    shader?: string | ShaderData | Asset<ShaderData> | null;
    uniform?: Uniform;
    blend?: BlendMode;
    outline?: Outline;
}

export type DrawPropsAnd<T> = Required<DrawProps> & T;

export type DrawPropsComps =
    | ColorComp
    | OpacityComp
    | AnchorComp
    | ShaderComp
    | BlendComp
    | OutlineComp;

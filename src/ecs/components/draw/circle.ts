import { drawCircle, type DrawCircleOpt } from "../../../gfx/draw/drawCircle";
import type { DrawPropsAnd, DrawPropsComps } from "../../../gfx/renderTypes";
import { Circle, Rect } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import type { Comp, GameObj } from "../../../types";
import type { AnchorComp } from "../transform/anchor";
import type { outline } from "./outline";

/**
 * The serialized {@link circle `circle()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedCircleComp {
    radius: number;
    fill?: boolean;
}

/**
 * The {@link circle `circle()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface CircleComp extends Comp {
    draw: Comp["draw"];
    /** Radius of circle. */
    radius: number;
    /**
     * Render area of the circle.
     *
     * @since v3000.0
     */
    renderArea(): Circle;
    serialize(): SerializedCircleComp;
}

/**
 * Options for the {@link circle `circle()``} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface CircleCompOpt {
    /**
     * If fill the circle (useful if you only want to render outline with
     * {@link outline `outline()`} component).
     */
    fill?: boolean;
}

export function circle(radius: number, opt: CircleCompOpt = {}): CircleComp {
    let _shape: Circle | undefined;
    let _radius = radius;
    return {
        id: "circle",
        get radius() {
            return _radius;
        },
        set radius(value: number) {
            _radius = value;
            if (_shape) _shape.radius = value;
        },
        draw(this: GameObj<CircleComp | DrawPropsComps>) {
            drawCircle(
                {
                    color: this.color,
                    opacity: this.opacity,
                    anchor: this.anchor,
                    shader: this.shader,
                    uniform: this.uniform!,
                    blend: this.blend,
                    outline: this.outline,
                    radius: _radius,
                    fill: opt.fill,
                } satisfies DrawPropsAnd<DrawCircleOpt>,
            );
        },
        renderArea(this: GameObj<AnchorComp | CircleComp>) {
            if (!_shape) {
                _shape = new Circle(
                    new Vec2(0),
                    _radius,
                );
            }
            return _shape;
        },
        inspect() {
            return `radius: ${Math.ceil(_radius)}`;
        },
        serialize() {
            const data: SerializedCircleComp = { radius: _radius };
            if (opt.fill) data.fill = true;
            return data;
        },
    };
}

export function circleFactory(data: SerializedCircleComp) {
    const opt: CircleCompOpt = {};
    if (data.fill) opt.fill = data.fill;
    return circle(
        data.radius,
        opt,
    );
}

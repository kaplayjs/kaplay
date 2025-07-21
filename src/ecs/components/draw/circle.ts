import { getRenderProps } from "../../../game/utils";
import { drawCircle } from "../../../gfx/draw/drawCircle";
import { Circle, Rect } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import type { Comp, GameObj } from "../../../types";
import type { AreaComp } from "../physics/area";
import type { AnchorComp } from "../transform/anchor";
import type { outline } from "./outline";

/**
 * The serialized {@link circle `circle()`} component.
 *
 * @group Component Serialization
 */
export interface SerializedCircleComp {
    radius: number;
    fill?: boolean;
}

/**
 * The {@link circle `circle()`} component.
 *
 * @group Component Types
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
 * @group Component Types
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
            if ((this as any as GameObj).has("area")) {
                (this as any as GameObj<AreaComp>)._worldAreaDirty = true;
            }
        },
        draw(this: GameObj<CircleComp>) {
            drawCircle(Object.assign(getRenderProps(this), {
                radius: _radius,
                fill: opt.fill,
            }));
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

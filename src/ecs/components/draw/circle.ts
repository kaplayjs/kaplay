import { getRenderProps } from "../../../game/utils";
import { drawCircle } from "../../../gfx/draw/drawCircle";
import { Circle, Rect } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import type { Comp, GameObj } from "../../../types";
import { nextRenderAreaVersion } from "../physics/area";
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

export function circle(
    radius: number,
    opt: CircleCompOpt = {},
): CircleComp & { _renderAreaVersion: number } {
    let _shape: Circle | undefined;
    let _radius = radius;
    return {
        id: "circle",
        get radius() {
            return _radius;
        },
        set radius(value: number) {
            if (_radius != value) {
                _radius = value;
                if (_shape) _shape.radius = value;
                this._renderAreaVersion = nextRenderAreaVersion();
            }
        },
        draw(this: GameObj<CircleComp>) {
            drawCircle(Object.assign(getRenderProps(this), {
                radius: _radius,
                fill: opt.fill,
            }));
        },
        renderArea(
            this: GameObj<
                AnchorComp | CircleComp | { _renderAreaVersion: number }
            >,
        ) {
            if (!_shape) {
                _shape = new Circle(
                    new Vec2(0),
                    _radius,
                );
                this._renderAreaVersion = nextRenderAreaVersion();
            }
            return _shape;
        },
        _renderAreaVersion: 0,
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

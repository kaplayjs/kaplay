import { getRenderProps } from "../../../game/utils";
import { drawRect } from "../../../gfx/draw/drawRect";
import { Rect, vec2 } from "../../../math/math";
import type { Comp, GameObj } from "../../../types";

/**
 * The {@link rect `rect()`} component.
 *
 * @group Component Types
 */
export interface RectComp extends Comp {
    draw: Comp["draw"];
    /**
     * Width of rectangle.
     */
    width: number;
    /**
     * Height of rectangle.
     */
    height: number;
    /**
     * The radius of each corner.
     */
    radius?: number | [number, number, number, number];
    /**
     * @since v3000.0
     */
    renderArea(): Rect;
}

/**
 * Options for the {@link rect `rect()`} component.
 *
 * @group Component Types
 */
export interface RectCompOpt {
    /**
     * Radius of the rectangle corners.
     */
    radius?: number | [number, number, number, number];
    /**
     * If fill the rectangle (useful if you only want to render outline with outline() component).
     */
    fill?: boolean;
}

export function rect(w: number, h: number, opt: RectCompOpt = {}): RectComp {
    let _shape: Rect | undefined;
    let _width = w;
    let _height = h;
    return {
        id: "rect",
        get width() {
            return _width;
        },
        set width(value) {
            _width = value;
            if (_shape) _shape.width = value;
        },
        get height() {
            return _height;
        },
        set height(value) {
            _height = value;
            if (_shape) _shape.height = value;
        },
        radius: opt.radius || 0,
        draw(this: GameObj<RectComp>) {
            drawRect(Object.assign(getRenderProps(this), {
                width: _width,
                height: _height,
                radius: this.radius,
                fill: opt.fill,
            }));
        },
        renderArea() {
            if (!_shape) {
                _shape = new Rect(vec2(0), _width, _height);
            }
            return _shape;
        },
        inspect() {
            return `rect: (${Math.ceil(_width)}w, ${Math.ceil(_height)}h)`;
        },
    };
}

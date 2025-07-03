import { getRenderProps } from "../../../game/utils.js";
import { drawUVQuad } from "../../../gfx/draw/drawUVQuad.js";
import { Rect, vec2 } from "../../../math/math.js";
import type { Comp, GameObj } from "../../../types.js";

/**
 * The {@link uvquad `uvquad()`} component.
 *
 * @group Component Types
 */
export interface UVQuadComp extends Comp {
    draw: Comp["draw"];
    /**
     * Width of rect.
     */
    width: number;
    /**
     * Height of height.
     */
    height: number;
    /**
     * @since v3000.0
     */
    renderArea(): Rect;
}

export function uvquad(w: number, h: number): UVQuadComp {
    let _shape: Rect | undefined;
    let _width = w;
    let _height = h;
    return {
        id: "uvquad",
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
        draw(this: GameObj<UVQuadComp>) {
            drawUVQuad(Object.assign(getRenderProps(this), {
                width: _width,
                height: _height,
            }));
        },
        renderArea() {
            if (!_shape) {
                _shape = new Rect(vec2(0), _width, _height);
            }
            return _shape;
        },
        inspect() {
            return `uvquad: (${Math.ceil(_width)}w, ${Math.ceil(_height)})h`;
        },
    };
}

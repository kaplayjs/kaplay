import { getRenderProps } from "../../../game/utils";
import { drawUVQuad } from "../../../gfx/draw/drawUVQuad";
import { Rect, vec2 } from "../../../math/math";
import type { Comp, GameObj } from "../../../types";
import { nextRenderAreaVersion } from "../physics/area";

/**
 * The {@link uvquad `uvquad()`} component.
 *
 * @group Components
 * @subgroup Component Types
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

export function uvquad(
    w: number,
    h: number,
): UVQuadComp & { _renderAreaVersion: number } {
    let _shape: Rect | undefined;
    let _width = w;
    let _height = h;
    return {
        id: "uvquad",
        get width() {
            return _width;
        },
        set width(value) {
            if (_width != value) {
                _width = value;
                if (_shape) _shape.width = value;
                this._renderAreaVersion = nextRenderAreaVersion();
            }
        },
        get height() {
            return _height;
        },
        set height(value) {
            if (_height != value) {
                _height = value;
                if (_shape) _shape.height = value;
                this._renderAreaVersion = nextRenderAreaVersion();
            }
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
                this._renderAreaVersion = nextRenderAreaVersion();
            }
            return _shape;
        },
        _renderAreaVersion: 0,
        inspect() {
            return `uvquad: (${Math.ceil(_width)}w, ${Math.ceil(_height)})h`;
        },
    };
}

import { getRenderProps } from "../../../game/utils.js";
import { drawEllipse } from "../../../gfx/draw/drawEllipse.js";
import { Ellipse } from "../../../math/math.js";
import { Vec2 } from "../../../math/Vec2.js";
import type { Comp, GameObj } from "../../../types.js";
import type { AnchorComp } from "../transform/anchor.js";
import type { outline } from "./outline.js";

/**
 * The {@link ellipse `ellipse()`} component.
 *
 * @group Component Types
 */
export interface EllipseComp extends Comp {
    draw: Comp["draw"];
    /** Semi-major axis of ellipse. */
    radiusX: number;
    /** Semi-minor axis of ellipse. */
    radiusY: number;
    /**
     * Render area of the ellipse.
     */
    renderArea(): Ellipse;
}

/**
 * Options for the {@link ellipse `ellipse()``} component.
 *
 * @group Component Types
 */
export interface EllipseCompOpt {
    /**
     * If fill is false, the ellipse is not filled (useful if you only want to render outline with
     * {@link outline `outline()`} component).
     */
    fill?: boolean;
}

export function ellipse(
    radiusX: number,
    radiusY: number,
    opt: EllipseCompOpt = {},
): EllipseComp {
    let _shape: Ellipse | undefined;
    let _radiusX = radiusX;
    let _radiusY = radiusY;
    return {
        id: "ellipse",
        get radiusX() {
            return _radiusX;
        },
        set radiusX(value: number) {
            _radiusX = value;
            if (_shape) _shape.radiusX = value;
        },
        get radiusY() {
            return _radiusY;
        },
        set radiusY(value: number) {
            _radiusY = value;
            if (_shape) _shape.radiusY = value;
        },
        draw(this: GameObj<EllipseComp>) {
            drawEllipse(Object.assign(getRenderProps(this), {
                radiusX: this.radiusX,
                radiusY: this.radiusY,
                fill: opt.fill,
            }));
        },
        renderArea(this: GameObj<AnchorComp | EllipseComp>) {
            if (!_shape) {
                return new Ellipse(
                    new Vec2(0),
                    _radiusX,
                    _radiusY,
                );
            }
            return _shape;
        },
        inspect() {
            return `radiusX: ${Math.ceil(_radiusX)} radiusY: ${
                Math.ceil(_radiusY)
            }`;
        },
    };
}

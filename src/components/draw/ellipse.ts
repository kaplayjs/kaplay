import { getRenderProps } from "../../game/utils";
import { drawEllipse } from "../../gfx";
import { Ellipse, Rect, Vec2 } from "../../math/math";
import type { Comp, GameObj } from "../../types";
import type { AnchorComp } from "../transform/anchor";
import type { outline } from "./outline";

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
    return {
        id: "ellipse",
        radiusX: radiusX,
        radiusY: radiusY,
        draw(this: GameObj<EllipseComp>) {
            drawEllipse(Object.assign(getRenderProps(this), {
                radiusX: this.radiusX,
                radiusY: this.radiusY,
                fill: opt.fill,
            }));
        },
        renderArea(this: GameObj<AnchorComp | EllipseComp>) {
            return new Ellipse(
                new Vec2(0),
                this.radiusX,
                this.radiusY,
            );
        },
        inspect() {
            return `radiusX: ${Math.ceil(this.radiusX)} radiusY: ${
                Math.ceil(this.radiusY)
            }`;
        },
    };
}

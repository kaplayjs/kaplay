import { Vec2 } from "../../math/math";
import { getArcPts } from "../../math/various";
import type { DrawEllipseOpt } from "../../types";
import { anchorPt } from "../anchor";
import { drawPolygon } from "./drawPolygon";

export function drawEllipse(opt: DrawEllipseOpt) {
    if (opt.radiusX === undefined || opt.radiusY === undefined) {
        throw new Error(
            "drawEllipse() requires properties \"radiusX\" and \"radiusY\".",
        );
    }

    if (opt.radiusX === 0 || opt.radiusY === 0) {
        return;
    }

    const start = opt.start ?? 0;
    const end = opt.end ?? 360;
    const offset = anchorPt(opt.anchor ?? "center").scale(
        new Vec2(-opt.radiusX, -opt.radiusY),
    );

    const pts = getArcPts(
        offset,
        opt.radiusX,
        opt.radiusY,
        start,
        end,
        opt.resolution,
    );

    // center
    pts.unshift(offset);

    const polyOpt = Object.assign({}, opt, {
        pts,
        radius: 0,
        ...(opt.gradient
            ? {
                colors: [
                    opt.gradient[0],
                    ...Array(pts.length - 1).fill(opt.gradient[1]),
                ],
            }
            : {}),
    });

    // full circle with outline shouldn't have the center point
    if (end - start >= 360 && opt.outline) {
        if (opt.fill !== false) {
            drawPolygon(Object.assign({}, polyOpt, {
                outline: null,
            }));
        }
        drawPolygon(Object.assign({}, polyOpt, {
            pts: pts.slice(1),
            fill: false,
        }));
        return;
    }

    drawPolygon(polyOpt);
}

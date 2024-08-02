import { gfx } from "../../kaplay";
import { Color } from "../../math/color";
import { triangulate, Vec2 } from "../../math/math";
import type { DrawPolygonOpt } from "../../types";
import {
    popTransform,
    pushRotate,
    pushScale,
    pushTransform,
    pushTranslate,
} from "../stack";
import { drawLines } from "./drawLine";
import { drawRaw } from "./drawRaw";

export function drawPolygon(opt: DrawPolygonOpt) {
    if (!opt.pts) {
        throw new Error("drawPolygon() requires property \"pts\".");
    }

    const npts = opt.pts.length;

    if (npts < 3) {
        return;
    }

    pushTransform();
    pushTranslate(opt.pos!);
    pushScale(opt.scale);
    pushRotate(opt.angle);
    pushTranslate(opt.offset!);

    if (opt.fill !== false) {
        const color = opt.color ?? Color.WHITE;

        const verts = opt.pts.map((pt, i) => ({
            pos: new Vec2(pt.x, pt.y),
            uv: opt.uv
                ? opt.uv[i]
                : new Vec2(0, 0),
            color: opt.colors
                ? (opt.colors[i] ? opt.colors[i].mult(color) : color)
                : color,
            opacity: opt.opacity ?? 1,
        }));

        let indices;

        if (opt.triangulate /* && !isConvex(opt.pts)*/) {
            const triangles = triangulate(opt.pts);
            // TODO rewrite triangulate to just return new indices
            indices = triangles.map(t => t.map(p => opt.pts.indexOf(p)))
                .flat();
        }
        else {
            indices = [...Array(npts - 2).keys()]
                .map((n) => [0, n + 1, n + 2])
                .flat();
        }

        drawRaw(
            verts,
            opt.indices ?? indices,
            opt.fixed,
            opt.uv ? opt.tex : gfx.defTex,
            opt.shader,
            opt.uniform ?? undefined,
        );
    }

    if (opt.outline) {
        drawLines({
            pts: [...opt.pts, opt.pts[0]],
            radius: opt.radius,
            width: opt.outline.width,
            color: opt.outline.color,
            join: opt.outline.join,
            uniform: opt.uniform,
            fixed: opt.fixed,
            opacity: opt.opacity ?? opt.outline.opacity,
        });
    }

    popTransform();
}

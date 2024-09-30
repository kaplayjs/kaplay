import { gfx } from "../../kaplay";
import { Color } from "../../math/color";
import { triangulate, Vec2 } from "../../math/math";
import type { DrawPolygonOpt } from "../../types";
import {
    popTransform,
    pushRotate,
    pushScaleV,
    pushTransform,
    pushTranslateV,
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
    pushTranslateV(opt.pos!);
    pushScaleV(opt.scale);
    pushRotate(opt.angle);
    pushTranslateV(opt.offset!);

    if (opt.fill !== false) {
        const color = opt.color ?? Color.WHITE;

        const attributes = {
            pos: new Array<number>(opt.pts.length * 2),
            uv: new Array<number>(opt.pts.length * 2),
            color: new Array<number>(opt.pts.length * 3),
            opacity: new Array<number>(opt.pts.length),
        };

        for (let i = 0; i < opt.pts.length; i++) {
            attributes.pos[i * 2] = opt.pts[i].x;
            attributes.pos[i * 2 + 1] = opt.pts[i].y;
        }

        if (opt.uv) {
            for (let i = 0; i < opt.uv.length; i++) {
                attributes.uv[i * 2] = opt.uv[i].x;
                attributes.uv[i * 2 + 1] = opt.uv[i].y;
            }
        }
        else {
            attributes.uv.fill(0);
        }

        if (opt.colors) {
            for (let i = 0; i < opt.colors.length; i++) {
                attributes.color[i * 3] = opt.colors[i].r;
                attributes.color[i * 3 + 1] = opt.colors[i].g;
                attributes.color[i * 3 + 2] = opt.colors[i].b;
            }
        }
        else {
            for (let i = 0; i < opt.pts.length; i++) {
                attributes.color[i * 3] = color.r;
                attributes.color[i * 3 + 1] = color.g;
                attributes.color[i * 3 + 2] = color.b;
            }
        }

        attributes.opacity.fill(opt.opacity ?? 1);

        /*const verts = opt.pts.map((pt, i) => ({
            pos: new Vec2(pt.x, pt.y),
            uv: opt.uv
                ? opt.uv[i]
                : new Vec2(0, 0),
            color: opt.colors
                ? (opt.colors[i] ? opt.colors[i].mult(color) : color)
                : color,
            opacity: opt.opacity ?? 1,
        }));*/

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
            attributes,
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

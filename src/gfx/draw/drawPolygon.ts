import { Color } from "../../math/color";
import { triangulate } from "../../math/math";
import { Vec2 } from "../../math/Vec2";
import { _k } from "../../shared";
import { BlendMode, type RenderProps } from "../../types";
import type { Texture } from "../gfx";
import {
    multRotate,
    multScaleV,
    multSkew,
    multSkewV,
    multTranslateV,
    popTransform,
    pushTransform,
} from "../stack";
import { drawLines } from "./drawLine";
import { drawRaw } from "./drawRaw";

/**
 * How the polygon should look like.
 *
 * @group Draw
 * @subgroup Types
 */
export type DrawPolygonOpt = RenderProps & {
    /**
     * The points that make up the polygon
     */
    pts: Vec2[];
    /**
     * If fill the shape with color (set this to false if you only want an outline).
     */
    fill?: boolean;
    /**
     * Manual triangulation.
     */
    indices?: number[];
    /**
     * The center point of transformation in relation to the position.
     */
    offset?: Vec2;
    /**
     * The radius of each corner.
     */
    radius?: number | number[];
    /**
     * The color of each vertex.
     *
     * @since v3000.0
     */
    colors?: Color[];
    /**
     * The opacity of each vertex.
     *
     * @since v4000.0
     */
    opacities?: number[];
    /**
     * The uv of each vertex.
     *
     * @since v3001.0
     */
    uv?: Vec2[];
    /**
     * The texture if uv are supplied.
     *
     * @since v3001.0
     */
    tex?: Texture;
    /**
     * Triangulate concave polygons.
     *
     * @since v3001.0
     */
    triangulate?: boolean;
};

export function drawPolygon(opt: DrawPolygonOpt) {
    if (!opt.pts) {
        throw new Error("drawPolygon() requires property \"pts\".");
    }

    const npts = opt.pts.length;

    if (npts < 3) {
        return;
    }

    pushTransform();
    multTranslateV(opt.pos);
    multRotate(opt.angle);
    multScaleV(opt.scale);
    multSkewV(opt.skew);
    multTranslateV(opt.offset);

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

        if (opt.opacities) {
            for (let i = 0; i < opt.pts.length; i++) {
                attributes.opacity[i] = opt.opacities[i];
            }
        }
        else {
            attributes.opacity.fill(opt.opacity ?? 1);
        }

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
            opt.uv ? opt.tex : _k.gfx.defTex,
            opt.shader,
            opt.uniform ?? undefined,
            opt.blend ?? BlendMode.Normal,
        );
    }

    if (opt.outline) {
        drawLines({
            pts: opt.pts[0].eq(opt.pts[opt.pts.length - 1])
                ? opt.pts
                : [...opt.pts, opt.pts[0]],
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

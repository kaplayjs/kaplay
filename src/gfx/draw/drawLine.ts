import { opacity } from "../../components";
import { gfx } from "../../kaplay";
import { Color } from "../../math/color";
import { deg2rad, Vec2, vec2 } from "../../math/math";
import type { RenderProps } from "../../types";
import { drawCircle } from "./drawCircle";
import { drawRaw } from "./drawRaw";

/**
 * How the line should look like.
 */
export type DrawLineOpt = Omit<RenderProps, "angle" | "scale"> & {
    /**
     * Starting point of the line.
     */
    p1: Vec2;
    /**
     * Ending point of the line.
     */
    p2: Vec2;
    /**
     * The width, or thickness of the line,
     */
    width?: number;
};

export function drawLine(opt: DrawLineOpt) {
    const { p1, p2 } = opt;

    if (!p1 || !p2) {
        throw new Error(
            "drawLine() requires properties \"p1\" and \"p2\".",
        );
    }

    const w = opt.width || 1;

    // the displacement from the line end point to the corner point
    const dis = p2.sub(p1).unit().normal().scale(w * 0.5);

    // calculate the 4 corner points of the line polygon
    /*const verts = [
        p1.sub(dis),
        p1.add(dis),
        p2.add(dis),
        p2.sub(dis),
    ].map((p) => ({
        pos: new Vec2(p.x, p.y),
        uv: new Vec2(0),
        color: opt.color ?? Color.WHITE,
        opacity: opt.opacity ?? 1,
    }));*/

    const color = opt.color ?? Color.WHITE;
    const opacity = opt.opacity ?? 1;

    const attributes = {
        pos: [
            p1.x - dis.x,
            p1.y - dis.y,
            p1.x + dis.x,
            p1.y + dis.y,
            p2.x + dis.x,
            p2.y + dis.y,
            p2.x - dis.x,
            p2.y - dis.y,
        ],
        uv: [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ],
        color: [
            color.r,
            color.g,
            color.b,
            color.r,
            color.g,
            color.b,
            color.r,
            color.g,
            color.b,
            color.r,
            color.g,
            color.b,
        ],
        opacity: [
            opacity,
            opacity,
            opacity,
            opacity,
        ],
    };

    drawRaw(
        attributes,
        [0, 1, 3, 1, 2, 3],
        opt.fixed,
        gfx.defTex,
        opt.shader,
        opt.uniform ?? undefined,
    );
}

export type LineJoin =
    | "none"
    | "round"
    | "bevel"
    | "miter";

export type LineCap =
    | "butt"
    | "round"
    | "square";

/**
 * How the lines should look like.
 */
export type DrawLinesOpt = Omit<RenderProps, "angle" | "scale"> & {
    /**
     * The points that should be connected with a line.
     */
    pts: Vec2[];
    /**
     * The width, or thickness of the lines,
     */
    width?: number;
    /**
     * The radius of each corner.
     */
    radius?: number | number[];
    /**
     * Line join style (default "none").
     */
    join?: LineJoin;
    /**
     * Line cap style (default "none").
     */
    cap?: LineCap;
    /**
     * Maximum miter length, anything longer becomes bevel.
     */
    miterLimit?: number;
};

export function _drawLinesBevel(opt: DrawLinesOpt) {
    const pts = opt.pts;
    const vertices = [];
    const halfWidth = (opt.width || 1) * 0.5;
    const isLoop = pts[0] === pts[pts.length - 1]
        || pts[0].eq(pts[pts.length - 1]);
    const offset = opt.pos || vec2(0, 0);
    let segment;

    if (isLoop) {
        segment = pts[0].sub(pts[pts.length - 2]);
    }
    else {
        segment = pts[1].sub(pts[0]);
    }

    let length = segment.len();
    let normal = segment.normal().scale(-halfWidth / length);

    let pt1;
    let pt2 = pts[0];

    if (!isLoop) {
        switch (opt.cap) {
            case "square": {
                const dir = segment.scale(-halfWidth / length);
                vertices.push(pt2.add(dir).add(normal));
                vertices.push(pt2.add(dir).sub(normal));
                break;
            }
            case "round": {
                const n = Math.max(halfWidth, 10);
                const angle = Math.PI / n;
                let vector = normal.scale(-1);
                const cs = Math.cos(angle);
                const sn = Math.sin(angle);
                for (let j = 0; j < n; j++) {
                    vertices.push(pt2);
                    vertices.push(pt2.sub(vector));
                    vector = vec2(
                        vector.x * cs - vector.y * sn,
                        vector.x * sn + vector.y * cs,
                    );
                }
            }
        }
    }

    for (let i = 1; i < pts.length; i++) {
        if (pt2 === pts[i] || pt2.eq(pts[i])) continue;
        pt1 = pt2;
        pt2 = pts[i];

        const nextSegment = pt2.sub(pt1);
        const nextLength = nextSegment.len();
        const nextNormal = nextSegment.normal().scale(
            -halfWidth / nextLength,
        );

        const det = segment.cross(nextSegment);

        if (Math.abs(det) / (length * nextLength) < 0.05) {
            // Parallel
            vertices.push(pt1.add(normal));
            vertices.push(pt1.sub(normal));

            if (segment.dot(nextSegment) < 0) {
                vertices.push(pt1.sub(normal));
                vertices.push(pt1.add(normal));
            }

            segment = nextSegment;
            length = nextLength;
            normal = nextNormal;
            continue;
        }

        const lambda = (nextNormal.sub(normal)).cross(nextSegment) / det;
        const d = normal.add(segment.scale(lambda));

        if (det > 0) {
            vertices.push(pt1.add(d));
            vertices.push(pt1.sub(normal));
            vertices.push(pt1.add(d));
            vertices.push(pt1.sub(nextNormal));
        }
        else {
            vertices.push(pt1.add(normal));
            vertices.push(pt1.sub(d));
            vertices.push(pt1.add(nextNormal));
            vertices.push(pt1.sub(d));
        }

        segment = nextSegment;
        length = nextLength;
        normal = nextNormal;
    }

    if (!isLoop) {
        vertices.push(pt2.add(normal));
        vertices.push(pt2.sub(normal));
        switch (opt.cap) {
            case "square": {
                const dir = segment.scale(halfWidth / length);
                vertices.push(pt2.add(dir).add(normal));
                vertices.push(pt2.add(dir).sub(normal));
                break;
            }
            case "round": {
                const n = Math.max(halfWidth, 10);
                const angle = Math.PI / n;
                let vector = normal.scale(1);
                const cs = Math.cos(angle);
                const sn = Math.sin(angle);
                for (let j = 0; j < n; j++) {
                    vector = vec2(
                        vector.x * cs - vector.y * sn,
                        vector.x * sn + vector.y * cs,
                    );
                    vertices.push(pt2);
                    vertices.push(pt2.sub(vector));
                }
            }
        }
    }

    if (vertices.length < 4) return;

    const indices = [];
    let index = 0;
    for (let i = 0; i < vertices.length - 2; i += 2) {
        indices[index++] = i + 1;
        indices[index++] = i;
        indices[index++] = i + 2;
        indices[index++] = i + 2;
        indices[index++] = i + 3;
        indices[index++] = i + 1;
    }

    if (isLoop) {
        indices[index++] = vertices.length - 1;
        indices[index++] = vertices.length - 2;
        indices[index++] = 0;
        indices[index++] = 0;
        indices[index++] = 1;
        indices[index++] = vertices.length - 1;
    }

    /*const verts = vertices.map(v => ({
        pos: offset.add(v),
        uv: vec2(),
        color: opt.color || Color.WHITE,
        opacity: opt.opacity ?? 1,
    }));*/

    const attributes = {
        pos: new Array<number>(vertices.length * 2),
        uv: new Array<number>(vertices.length * 2).fill(0),
        color: new Array<number>(vertices.length * 3).fill(255),
        opacity: new Array<number>(vertices.length).fill(opt.opacity ?? 1),
    };

    for (let i = 0; i < vertices.length; i++) {
        attributes.pos[i * 2] = vertices[i].x + offset.x;
        attributes.pos[i * 2 + 1] = vertices[i].y + offset.y;
        if (opt.color) {
            attributes.color[i * 3] = opt.color.r;
            attributes.color[i * 3 + 1] = opt.color.g;
            attributes.color[i * 3 + 2] = opt.color.b;
        }
    }

    drawRaw(
        attributes,
        indices,
        opt.fixed,
        gfx.defTex,
        opt.shader,
        opt.uniform ?? undefined,
    );
}

export function _drawLinesRound(opt: DrawLinesOpt) {
    const pts = opt.pts;
    const vertices = [];
    const halfWidth = (opt.width || 1) * 0.5;
    const isLoop = pts[0] === pts[pts.length - 1]
        || pts[0].eq(pts[pts.length - 1]);
    const offset = opt.pos || vec2(0, 0);
    let segment;

    if (isLoop) {
        segment = pts[0].sub(pts[pts.length - 2]);
    }
    else {
        segment = pts[1].sub(pts[0]);
    }

    let length = segment.len();
    let normal = segment.normal().scale(-halfWidth / length);

    let pt1;
    let pt2 = pts[0];

    if (!isLoop) {
        switch (opt.cap) {
            case "square": {
                const dir = segment.scale(-halfWidth / length);
                vertices.push(pt2.add(dir).add(normal));
                vertices.push(pt2.add(dir).sub(normal));
                break;
            }
            case "round": {
                const n = Math.max(halfWidth, 10);
                const angle = Math.PI / n;
                let vector = normal.scale(-1);
                const cs = Math.cos(angle);
                const sn = Math.sin(angle);
                for (let j = 0; j < n; j++) {
                    vertices.push(pt2);
                    vertices.push(pt2.sub(vector));
                    vector = vec2(
                        vector.x * cs - vector.y * sn,
                        vector.x * sn + vector.y * cs,
                    );
                }
            }
        }
    }

    for (let i = 1; i < pts.length; i++) {
        if (pt2 === pts[i] || pt2.eq(pts[i])) continue;
        pt1 = pt2;
        pt2 = pts[i];

        const nextSegment = pt2.sub(pt1);
        const nextLength = nextSegment.len();
        const nextNormal = nextSegment.normal().scale(
            -halfWidth / nextLength,
        );

        const det = segment.cross(nextSegment);

        if (Math.abs(det) / (length * nextLength) < 0.05) {
            // Parallel
            vertices.push(pt1.add(normal));
            vertices.push(pt1.sub(normal));

            if (segment.dot(nextSegment) < 0) {
                vertices.push(pt1.sub(normal));
                vertices.push(pt1.add(normal));
            }

            segment = nextSegment;
            length = nextLength;
            normal = nextNormal;
            continue;
        }

        const lambda = (nextNormal.sub(normal)).cross(nextSegment) / det;
        const d = normal.add(segment.scale(lambda));

        if (det > 0) {
            const fixedPoint = pt1.add(d);
            const n = Math.max(halfWidth, 10);
            const angle = deg2rad(normal.angleBetween(nextNormal) / n);
            let vector = normal;
            const cs = Math.cos(angle);
            const sn = Math.sin(angle);
            for (let j = 0; j < n; j++) {
                vertices.push(fixedPoint);
                vertices.push(pt1.sub(vector));
                vector = vec2(
                    vector.x * cs - vector.y * sn,
                    vector.x * sn + vector.y * cs,
                );
            }
        }
        else {
            const fixedPoint = pt1.sub(d);
            const n = Math.max(halfWidth, 10);
            const angle = deg2rad(normal.angleBetween(nextNormal) / n);
            let vector = normal;
            const cs = Math.cos(angle);
            const sn = Math.sin(angle);
            for (let j = 0; j < n; j++) {
                vertices.push(pt1.add(vector));
                vertices.push(fixedPoint);
                vector = vec2(
                    vector.x * cs - vector.y * sn,
                    vector.x * sn + vector.y * cs,
                );
            }
        }

        segment = nextSegment;
        length = nextLength;
        normal = nextNormal;
    }

    if (!isLoop) {
        vertices.push(pt2.add(normal));
        vertices.push(pt2.sub(normal));
        switch (opt.cap) {
            case "square": {
                const dir = segment.scale(halfWidth / length);
                vertices.push(pt2.add(dir).add(normal));
                vertices.push(pt2.add(dir).sub(normal));
                break;
            }
            case "round": {
                const n = Math.max(halfWidth, 10);
                const angle = Math.PI / n;
                let vector = normal.scale(1);
                const cs = Math.cos(angle);
                const sn = Math.sin(angle);
                for (let j = 0; j < n; j++) {
                    vector = vec2(
                        vector.x * cs - vector.y * sn,
                        vector.x * sn + vector.y * cs,
                    );
                    vertices.push(pt2);
                    vertices.push(pt2.sub(vector));
                }
            }
        }
    }

    if (vertices.length < 4) return;

    const verts = vertices.map(v => ({
        pos: offset.add(v),
        uv: vec2(),
        color: opt.color || Color.WHITE,
        opacity: opt.opacity ?? 1,
    }));

    const indices = [];
    let index = 0;
    for (let i = 0; i < vertices.length - 2; i += 2) {
        indices[index++] = i + 1;
        indices[index++] = i;
        indices[index++] = i + 2;
        indices[index++] = i + 2;
        indices[index++] = i + 3;
        indices[index++] = i + 1;
    }

    if (isLoop) {
        indices[index++] = vertices.length - 1;
        indices[index++] = vertices.length - 2;
        indices[index++] = 0;
        indices[index++] = 0;
        indices[index++] = 1;
        indices[index++] = vertices.length - 1;
    }

    const attributes = {
        pos: new Array<number>(vertices.length * 2),
        uv: new Array<number>(vertices.length * 2).fill(0),
        color: new Array<number>(vertices.length * 3).fill(255),
        opacity: new Array<number>(vertices.length).fill(opt.opacity ?? 1),
    };

    for (let i = 0; i < vertices.length; i++) {
        attributes.pos[i * 2] = vertices[i].x + offset.x;
        attributes.pos[i * 2 + 1] = vertices[i].y + offset.y;
        if (opt.color) {
            attributes.color[i * 3] = opt.color.r;
            attributes.color[i * 3 + 1] = opt.color.g;
            attributes.color[i * 3 + 2] = opt.color.b;
        }
    }

    drawRaw(
        attributes,
        indices,
        opt.fixed,
        gfx.defTex,
        opt.shader,
        opt.uniform ?? undefined,
    );
}

export function _drawLinesMiter(opt: DrawLinesOpt) {
    const pts = opt.pts;
    const vertices = [];
    const halfWidth = (opt.width || 1) * 0.5;
    const isLoop = pts[0] === pts[pts.length - 1]
        || pts[0].eq(pts[pts.length - 1]);
    const offset = opt.pos || vec2(0, 0);
    let segment;

    if (isLoop) {
        segment = pts[0].sub(pts[pts.length - 2]);
    }
    else {
        segment = pts[1].sub(pts[0]);
    }

    let length = segment.len();
    let normal = segment.normal().scale(-halfWidth / length);

    let pt1;
    let pt2 = pts[0];

    if (!isLoop) {
        switch (opt.cap) {
            case "square": {
                const dir = segment.scale(-halfWidth / length);
                vertices.push(pt2.add(dir).add(normal));
                vertices.push(pt2.add(dir).sub(normal));
                break;
            }
            case "round": {
                const n = Math.max(halfWidth, 10);
                const angle = Math.PI / n;
                let vector = normal.scale(-1);
                const cs = Math.cos(angle);
                const sn = Math.sin(angle);
                for (let j = 0; j < n; j++) {
                    vertices.push(pt2);
                    vertices.push(pt2.sub(vector));
                    vector = vec2(
                        vector.x * cs - vector.y * sn,
                        vector.x * sn + vector.y * cs,
                    );
                }
            }
        }
    }

    for (let i = 1; i < pts.length; i++) {
        if (pt2 === pts[i] || pt2.eq(pts[i])) continue;
        pt1 = pt2;
        pt2 = pts[i];

        const nextSegment = pt2.sub(pt1);
        const nextLength = nextSegment.len();
        const nextNormal = nextSegment.normal().scale(
            -halfWidth / nextLength,
        );

        const det = segment.cross(nextSegment);

        if (Math.abs(det) / (length * nextLength) < 0.05) {
            // Parallel
            vertices.push(pt1.add(normal));
            vertices.push(pt1.sub(normal));

            if (segment.dot(nextSegment) < 0) {
                vertices.push(pt1.sub(normal));
                vertices.push(pt1.add(normal));
            }

            segment = nextSegment;
            length = nextLength;
            normal = nextNormal;
            continue;
        }

        const lambda = (nextNormal.sub(normal)).cross(nextSegment) / det;
        const d = normal.add(segment.scale(lambda));

        vertices.push(pt1.add(d));
        vertices.push(pt1.sub(d));

        segment = nextSegment;
        length = nextLength;
        normal = nextNormal;
    }

    if (!isLoop) {
        vertices.push(pt2.add(normal));
        vertices.push(pt2.sub(normal));
        switch (opt.cap) {
            case "square": {
                const dir = segment.scale(halfWidth / length);
                vertices.push(pt2.add(dir).add(normal));
                vertices.push(pt2.add(dir).sub(normal));
                break;
            }
            case "round": {
                const n = Math.max(halfWidth, 10);
                const angle = Math.PI / n;
                let vector = normal.scale(1);
                const cs = Math.cos(angle);
                const sn = Math.sin(angle);
                for (let j = 0; j < n; j++) {
                    vector = vec2(
                        vector.x * cs - vector.y * sn,
                        vector.x * sn + vector.y * cs,
                    );
                    vertices.push(pt2);
                    vertices.push(pt2.sub(vector));
                }
            }
        }
    }

    if (vertices.length < 4) return;

    const verts = vertices.map(v => ({
        pos: offset.add(v),
        uv: vec2(),
        color: opt.color || Color.WHITE,
        opacity: opt.opacity ?? 1,
    }));

    const indices = [];
    let index = 0;
    for (let i = 0; i < vertices.length - 2; i += 2) {
        indices[index++] = i + 1;
        indices[index++] = i;
        indices[index++] = i + 2;
        indices[index++] = i + 2;
        indices[index++] = i + 3;
        indices[index++] = i + 1;
    }

    if (isLoop) {
        indices[index++] = vertices.length - 1;
        indices[index++] = vertices.length - 2;
        indices[index++] = 0;
        indices[index++] = 0;
        indices[index++] = 1;
        indices[index++] = vertices.length - 1;
    }

    const attributes = {
        pos: new Array<number>(vertices.length * 2),
        uv: new Array<number>(vertices.length * 2).fill(0),
        color: new Array<number>(vertices.length * 3).fill(255),
        opacity: new Array<number>(vertices.length).fill(opt.opacity ?? 1),
    };

    for (let i = 0; i < vertices.length; i++) {
        attributes.pos[i * 2] = vertices[i].x + offset.x;
        attributes.pos[i * 2 + 1] = vertices[i].y + offset.y;
        if (opt.color) {
            attributes.color[i * 3] = opt.color.r;
            attributes.color[i * 3 + 1] = opt.color.g;
            attributes.color[i * 3 + 2] = opt.color.b;
        }
    }

    drawRaw(
        attributes,
        indices,
        opt.fixed,
        gfx.defTex,
        opt.shader,
        opt.uniform ?? undefined,
    );
}

export function drawLines(opt: DrawLinesOpt) {
    const pts = opt.pts;
    const width = opt.width ?? 1;

    if (!pts) {
        throw new Error("drawLines() requires property \"pts\".");
    }

    if (pts.length < 2) {
        return;
    }

    if (pts.length > 2) {
        switch (opt.join) {
            case "bevel":
                return _drawLinesBevel(opt);
            case "round":
                return _drawLinesRound(opt);
            case "miter":
                return _drawLinesMiter(opt);
        }
    }

    if (opt.radius && pts.length >= 3) {
        // TODO: line joines
        // TODO: rounded vertices for arbitrary polygonic shape
        drawLine(Object.assign({}, opt, { p1: pts[0], p2: pts[1] }));

        for (let i = 1; i < pts.length - 2; i++) {
            const p1 = pts[i];
            const p2 = pts[i + 1];
            drawLine(Object.assign({}, opt, {
                p1: p1,
                p2: p2,
            }));
        }

        drawLine(Object.assign({}, opt, {
            p1: pts[pts.length - 2],
            p2: pts[pts.length - 1],
        }));
    }
    else {
        for (let i = 0; i < pts.length - 1; i++) {
            drawLine(Object.assign({}, opt, {
                p1: pts[i],
                p2: pts[i + 1],
            }));
            // TODO: other line join types
            if (opt.join !== "none") {
                drawCircle(Object.assign({}, opt, {
                    pos: pts[i],
                    radius: width / 2,
                }));
            }
        }
    }
}

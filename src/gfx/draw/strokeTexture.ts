import { resolveSprite } from "../../assets/sprite";

import { Color } from "../../math/color";
import type { Vec2 } from "../../math/Vec2";
import { _k } from "../../shared";
import { BlendMode, type Attributes, type RenderProps, type StrokeTexture } from "../../types";
import type { Frame } from "../TexPacker";
import { drawRaw } from "./drawRaw";

interface StrokeSource {
    frame: Frame;
    repeatLength: number;
}

interface StrokeVertex {
    x: number;
    y: number;
    u: number;
    v: number;
}

const MAX_STROKE_TILES = 65_536;

export function resolveStrokeTexture(
    texture: StrokeTexture,
): StrokeSource | null {
    const frameIndex = texture.frame ?? 0;
    if (!texture.sprite) {
        throw new Error("Stroke texture sprite is required");
    }
    if (!Number.isInteger(frameIndex) || frameIndex < 0) {
        throw new Error("Invalid stroke texture frame");
    }
    if (
        texture.repeatLength !== undefined
        && (!Number.isFinite(texture.repeatLength) || texture.repeatLength <= 0)
    ) {
        throw new Error(
            "Stroke texture repeatLength must be finite and positive",
        );
    }
    const sprite = resolveSprite(texture.sprite);
    if (!sprite?.data) return null;
    const frame = sprite.data.frames[frameIndex];
    if (!frame) throw new Error(`Frame not found: ${frameIndex}`);
    return {
        frame,
        repeatLength: texture.repeatLength === undefined
            ? frame.q.w * frame.tex.width
            : texture.repeatLength,
    };
}

function clipAtU(points: StrokeVertex[], boundary: number, keepAbove: boolean) {
    const result: StrokeVertex[] = [];
    let previous = points[points.length - 1];
    let previousInside = keepAbove
        ? previous.u >= boundary
        : previous.u <= boundary;
    for (const point of points) {
        const inside = keepAbove ? point.u >= boundary : point.u <= boundary;
        if (inside !== previousInside) {
            const t = (boundary - previous.u) / (point.u - previous.u);
            result.push({
                x: previous.x + (point.x - previous.x) * t,
                y: previous.y + (point.y - previous.y) * t,
                u: boundary,
                v: previous.v + (point.v - previous.v) * t,
            });
        }
        if (inside) result.push(point);
        previous = point;
        previousInside = inside;
    }
    return result;
}

// Split at repeat boundaries so interpolation never crosses the atlas outside this frame.
function drawTexturedTriangles(
    vertices: StrokeVertex[],
    indices: number[],
    source: StrokeSource,
    opt: RenderProps,
) {
    const { frame } = source;
    const q = frame.q;
    const color = opt.color ?? Color.WHITE;
    const opacity = opt.opacity ?? 1;
    const attributes: Attributes = { pos: [], uv: [], color: [], opacity: [] };
    const outputIndices: number[] = [];
    const { maxVertices, maxIndices, stride } = _k.gfx.renderer;
    const halfTexelX = 0.5 / frame.tex.width;
    const halfTexelY = 0.5 / frame.tex.height;
    const flush = () => {
        if (!outputIndices.length) return;
        drawRaw(
            attributes,
            outputIndices,
            opt.fixed,
            frame.tex,
            opt.shader,
            opt.uniform ?? undefined,
            opt.blend ?? BlendMode.Normal,
        );
        attributes.pos.length = 0;
        attributes.uv.length = 0;
        attributes.color.length = 0;
        attributes.opacity.length = 0;
        outputIndices.length = 0;
    };
    const ranges: [number, number][] = [];
    let tileCount = 0;
    for (let i = 0; i < indices.length; i += 3) {
        const triangle = indices.slice(i, i + 3).map(index => vertices[index]);
        const min = Math.min(...triangle.map(p => p.u));
        const max = Math.max(...triangle.map(p => p.u));
        const first = Math.floor(min);
        const last = Math.max(first, Math.ceil(max) - 1);
        const count = last - first + 1;
        if (
            !Number.isFinite(count)
            || first + 1 === first
            || last + 1 === last
            || tileCount + count > MAX_STROKE_TILES
        ) {
            throw new RangeError("Stroke texture has too many repeats to draw");
        }
        tileCount += count;
        ranges.push([first, last]);
    }
    for (let i = 0; i < indices.length; i += 3) {
        const triangle = indices.slice(i, i + 3).map(index => vertices[index]);
        const [first, last] = ranges[i / 3];
        for (let tile = first; tile <= last; tile++) {
            let polygon = clipAtU(triangle, tile, true);
            if (polygon.length < 3) continue;
            polygon = clipAtU(polygon, tile + 1, false);
            if (polygon.length < 3) continue;
            if (
                attributes.pos.length / 2 + polygon.length
                    > maxVertices / stride
                || outputIndices.length + (polygon.length - 2) * 3
                    > maxIndices
            ) {
                flush();
            }
            const start = attributes.pos.length / 2;
            for (const p of polygon) {
                attributes.pos.push(p.x, p.y);
                attributes.uv.push(
                    Math.max(
                        q.x + halfTexelX,
                        Math.min(
                            q.x + q.w - halfTexelX,
                            q.x + (p.u - tile) * q.w,
                        ),
                    ),
                    Math.max(
                        q.y + halfTexelY,
                        Math.min(q.y + q.h - halfTexelY, q.y + p.v * q.h),
                    ),
                );
                attributes.color.push(color.r, color.g, color.b);
                attributes.opacity.push(opacity);
            }
            for (let j = 1; j < polygon.length - 1; j++) {
                outputIndices.push(start, start + j, start + j + 1);
            }
        }
    }
    flush();
}

export function drawTexturedLine(
    p1: Vec2,
    p2: Vec2,
    width: number,
    source: StrokeSource,
    opt: RenderProps,
) {
    const normal = p2.sub(p1).unit().normal().scale(width / 2);
    const length = p2.dist(p1);
    const end = length / source.repeatLength;
    const vertices = [
        {
            x: p1.x - normal.x,
            y: p1.y - normal.y,
            u: 0,
            v: 1,
        },
        {
            x: p1.x + normal.x,
            y: p1.y + normal.y,
            u: 0,
            v: 0,
        },
        {
            x: p2.x - normal.x,
            y: p2.y - normal.y,
            u: end,
            v: 1,
        },
        {
            x: p2.x + normal.x,
            y: p2.y + normal.y,
            u: end,
            v: 0,
        },
    ];
    drawTexturedTriangles(vertices, [1, 0, 2, 2, 3, 1], source, opt);
}

export function drawTexturedStroke(
    points: Vec2[],
    indices: number[],
    stations: {
        index: number;
        distance: number;
        point: Vec2;
        direction: Vec2;
    }[],
    length: number,
    loop: boolean,
    source: StrokeSource,
    opt: RenderProps & { width?: number; bias?: number },
) {
    const offset = opt.pos;
    let station = 0;
    const pointStations = points.map((_, i) => {
        while (
            station + 1 < stations.length && i >= stations[station + 1].index
        ) station++;
        return stations[station];
    });
    const width = opt.width || 1;
    const ratio = length / source.repeatLength;
    const cycles = loop && Number.isFinite(ratio) && length > 0
        ? Math.max(1, Math.round(ratio))
        : 0;
    const targetLength = cycles * source.repeatLength;
    const correction = loop && Number.isFinite(targetLength)
        ? targetLength - length
        : 0;
    // Ease any fractional cycle adjustment into the final repeat so the loop
    // meets itself at the same texture phase.
    const correctionStart = Math.max(0, length - source.repeatLength);
    const remapDistance = (distance: number) => {
        if (!correction || length <= correctionStart) return distance;
        const t = Math.max(
            0,
            Math.min(1, (distance - correctionStart) / (length - correctionStart)),
        );
        const eased = t * t * (3 - 2 * t);
        return distance + correction * eased;
    };
    const vertices: StrokeVertex[] = [];
    const outputIndices: number[] = [];
    for (let i = 0; i < indices.length; i += 3) {
        const triangle = indices.slice(i, i + 3);
        let origin = pointStations[triangle[0]];
        let distance = Infinity;
        for (const index of triangle) {
            const at = pointStations[index];
            // Closing vertices belong to the end of the path for this triangle.
            const d = loop && i >= indices.length - 6 && index < 2
                ? length
                : at.distance;
            if (d < distance) {
                distance = d;
                origin = at;
            }
        }
        const normal = origin.direction.normal();
        for (const index of triangle) {
            const p = points[index];
            const relative = p.sub(origin.point);
            outputIndices.push(vertices.length);
            vertices.push({
                x: p.x + (offset?.x ?? 0),
                y: p.y + (offset?.y ?? 0),
                u: remapDistance(distance + relative.dot(origin.direction))
                    / source.repeatLength,
                v: 0.5 + (opt.bias ?? 0) / 2 - relative.dot(normal) / width,
            });
        }
    }
    drawTexturedTriangles(vertices, outputIndices, source, opt);
}

import { Vec2 } from "./Vec2";

export function traceRegion(
    width: number,
    height: number,
    isInRegion: (x: number, y: number) => boolean,
    RDP: boolean,
    epsilon: number,
): Vec2[] {
    const points: Vec2[] = [];

    for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width - 1; x++) {
            // clockwise from top-left (canvas-style)
            const tl = isInRegion(x, y) ? 1 : 0;
            const tr = isInRegion(x + 1, y) ? 1 : 0;
            const br = isInRegion(x + 1, y + 1) ? 1 : 0;
            const bl = isInRegion(x, y + 1) ? 1 : 0;

            // build case index
            const idx = (tl << 3) | (tr << 2) | (br << 1) | bl;

            // for each cell, draw edges along inside/outside transitions
            switch (idx) {
                case 1:
                    points.push(new Vec2(x, y + 0.5), new Vec2(x + 0.5, y + 1));
                    break;
                case 2:
                    points.push(
                        new Vec2(x + 0.5, y + 1),
                        new Vec2(x + 1, y + 0.5),
                    );
                    break;
                case 3:
                    points.push(new Vec2(x, y + 0.5), new Vec2(x + 1, y + 0.5));
                    break;
                case 4:
                    points.push(new Vec2(x + 0.5, y), new Vec2(x + 1, y + 0.5));
                    break;
                case 6:
                    points.push(new Vec2(x + 0.5, y), new Vec2(x + 0.5, y + 1));
                    break;
                case 7:
                    points.push(new Vec2(x, y + 0.5), new Vec2(x + 0.5, y));
                    break;
                case 8:
                    points.push(new Vec2(x, y + 0.5), new Vec2(x + 0.5, y));
                    break;
                case 9:
                    points.push(new Vec2(x + 0.5, y), new Vec2(x + 0.5, y + 1));
                    break;
                case 11:
                    points.push(new Vec2(x + 0.5, y), new Vec2(x + 1, y + 0.5));
                    break;
                case 12:
                    points.push(new Vec2(x, y + 0.5), new Vec2(x + 1, y + 0.5));
                    break;
                case 13:
                    points.push(
                        new Vec2(x + 0.5, y + 1),
                        new Vec2(x + 1, y + 0.5),
                    );
                    break;
                case 14:
                    points.push(new Vec2(x, y + 0.5), new Vec2(x + 0.5, y + 1));
                    break;
                default:
                    break;
            }
        }
    }

    return RDP ? simplifyClosed(points, epsilon) : points;
}

function simplifyClosed(points: Vec2[], epsilon: number): Vec2[] {
    const open = points.slice();
    if (open.length > 1 && open[0].dist(open[open.length - 1]) < 1e-3) {
        open.pop();
    }
    const simplified = RDP(open, epsilon);

    simplified.push(simplified[0]);
    return simplified;
}

// ****************************************************************************
// Calculates the perpendicular distance between c and the line formed by a, b
// ****************************************************************************
function getDistance(c: Vec2, a: Vec2, b: Vec2): number {
    const A = b.y - a.y;
    const B = a.x - b.x;
    const C = b.x * a.y - a.x * b.y;

    return Math.abs(A * c.x + B * c.y + C) / Math.sqrt(A * A + B * B);
}

// *****************************************************
// Ramer–Douglas–Peucker - Used to simplify the polygons
// *****************************************************
function RDP(points: Vec2[], epsilon: number): Vec2[] {
    if (points.length < 3) return points;

    var start_indx = 0;
    var end_indx = points.length - 1;
    var max_dist = 0;
    var max_indx = 0;

    for (var i = start_indx + 1; i < end_indx; i++) {
        var d = getDistance(points[i], points[start_indx], points[end_indx]);
        if (d > max_dist) {
            max_dist = d;
            max_indx = i;
        }
    }

    if (points[0].eq(points[points.length - 1])) {
        points = points.slice(0, -1);
    }

    if (max_dist > epsilon) {
        var l = RDP(points.slice(start_indx, max_indx + 1), epsilon);
        var r = RDP(points.slice(max_indx, end_indx + 1), epsilon);

        return [...l.slice(0, -1), ...r];
    }
    else {
        return [points[start_indx], points[end_indx]];
    }
}

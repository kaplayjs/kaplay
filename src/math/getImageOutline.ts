import { Vec2 } from "./Vec2";

export function traceRegion(
    width: number,
    height: number,
    isInRegion: (x: number, y: number) => boolean,
    RDP: boolean,
    epsilon: number,
): Vec2[] {
    // Directions for clockwise boundary tracing (Moore-neighborhood)
    const directions = [
        new Vec2(1, 0),
        new Vec2(1, 1),
        new Vec2(0, 1),
        new Vec2(-1, 1),
        new Vec2(-1, 0),
        new Vec2(-1, -1),
        new Vec2(0, -1),
        new Vec2(1, -1),
    ];

    // Find a starting pixel in the region
    let start: Vec2 | null = null;
    for (let y = 0; y < height && !start; y++) {
        for (let x = 0; x < width && !start; x++) {
            if (isInRegion(x, y)) {
                start = new Vec2(x, y);
                break;
            }
        }
    }
    if (!start) return [];

    const outline: Vec2[] = [];
    let current = { ...start };
    let prevDir = 0;

    do {
        outline.push(new Vec2(current.x, current.y));
        // Search neighbors clockwise from previous direction - 2
        let dir = (prevDir + 6) % 8;
        for (let i = 0; i < 8; i++) {
            const d = directions[(dir + i) % 8];
            const nx = current.x + d.x;
            const ny = current.y + d.y;
            if (
                nx >= 0 && nx < width && ny >= 0 && ny < height
                && isInRegion(nx, ny)
            ) {
                current = { x: nx, y: ny };
                prevDir = (dir + i) % 8;
                break;
            }
        }
    } while (
        current.x !== start.x || current.y !== start.y || outline.length === 1
    );

    // Optional Ramer–Douglas–Peucker simplification
    if (RDP) {
        return simplifyClosed(outline, epsilon);
    }

    return outline;
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

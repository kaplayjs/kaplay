import { Vec2 } from "./Vec2";

export function trace_region(
    width: number,
    height: number,
    isInRegion: (x: number, y: number) => boolean
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
                case 1:  points.push(new Vec2(x, y + 0.5), new Vec2(x + 0.5, y + 1)); break;
                case 2:  points.push(new Vec2(x + 0.5, y + 1), new Vec2(x + 1, y + 0.5)); break;
                case 3:  points.push(new Vec2(x, y + 0.5), new Vec2(x + 1, y + 0.5)); break;
                case 4:  points.push(new Vec2(x + 0.5, y), new Vec2(x + 1, y + 0.5)); break;
                case 6:  points.push(new Vec2(x + 0.5, y), new Vec2(x + 0.5, y + 1)); break;
                case 7:  points.push(new Vec2(x, y + 0.5), new Vec2(x + 0.5, y)); break;
                case 8:  points.push(new Vec2(x, y + 0.5), new Vec2(x + 0.5, y)); break;
                case 9:  points.push(new Vec2(x + 0.5, y), new Vec2(x + 0.5, y + 1)); break;
                case 11: points.push(new Vec2(x + 0.5, y), new Vec2(x + 1, y + 0.5)); break;
                case 12: points.push(new Vec2(x, y + 0.5), new Vec2(x + 1, y + 0.5)); break;
                case 13: points.push(new Vec2(x + 0.5, y + 1), new Vec2(x + 1, y + 0.5)); break;
                case 14: points.push(new Vec2(x, y + 0.5), new Vec2(x + 0.5, y + 1)); break;
                default: break;
            }
        }
    }

    return points;
}

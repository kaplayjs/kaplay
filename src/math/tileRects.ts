export interface TileRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function tileRects(
    rows: readonly (readonly boolean[])[],
): TileRect[] {
    const rectangles: TileRect[] = [];
    let previous = new Map<string, TileRect>();

    for (let y = 0; y < rows.length; y++) {
        const row = rows[y];
        const current = new Map<string, TileRect>();
        let x = 0;
        while (x < row.length) {
            if (!row[x]) {
                x++;
                continue;
            }
            const start = x;
            while (x < row.length && row[x]) x++;
            const width = x - start;
            const key = `${start}:${width}`;
            const above = previous.get(key);
            if (above) {
                above.height++;
                current.set(key, above);
            }
            else {
                const rect = { x: start, y, width, height: 1 };
                rectangles.push(rect);
                current.set(key, rect);
            }
        }
        previous = current;
    }

    return rectangles;
}

kaplay();
loadBean();

function polygonArea(poly) {
    let total = 0;
    const l = poly.length;

    for (let i = 0; i < l; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % l];
        total += p1.x * p2.y * 0.5;
        total -= p2.x * p1.y * 0.5;
    }

    return Math.abs(total);
}

function soft() {
    let po, pl, pa;
    let circ, area;

    return {
        add() {
            const poly = this.pts;

            po = new Array(poly.length);
            pl = new Array(poly.length).fill(0);
            pa = new Array(poly.length * 3).fill(0);

            let p1 = poly[poly.length - 1];
            for (let i = 0; i < poly.length; i++) {
                const p2 = poly[i];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                // Save the length of the segment
                pl[i] = Math.sqrt(dx * dx + dy * dy);
                // No velocity yet
                po[i] = p2.clone();
                p1 = p2;
            }
            // Calculate circumference
            circ = pl.reduce((a, l) => a + l, 0);
            area = polygonArea(poly);
        },

        update() {
            const poly = this.pts;

            // Integrate and apply gravity
            for (let i = 0; i < poly.length; i++) {
                const p = poly[i];
                // Verlet
                const x = p.x;
                const y = p.y;
                p.x += p.x - po[i].x;
                p.y += p.y - po[i].y;
                po[i].x = x;
                po[i].y = y;
                // Gravity
                p.y += 2 * dt();
            }
            for (let loop = 0; loop < 10; loop++) {
                // Restore length
                let i1 = poly.length - 1;
                let p1 = poly[i1];
                for (let i = 0; i < poly.length; i++) {
                    const p2 = poly[i];
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const l = Math.sqrt(dx * dx + dy * dy);
                    if (l > 0 && l != pl[i]) {
                        const s = (l - pl[i]) / l;
                        pa[i1 * 3] += dx * s / 2;
                        pa[i1 * 3 + 1] += dy * s / 2;
                        pa[i1 * 3 + 2]++;
                        pa[i * 3] -= dx * s / 2;
                        pa[i * 3 + 1] -= dy * s / 2;
                        pa[i * 3 + 2]++;
                    }
                    i1 = i;
                    p1 = p2;
                }
                // Restore area
                const narea = polygonArea(poly);
                if (narea < area) {
                    const diff = area - narea;
                    const inflate = diff / circ;
                    for (let i = 0; i < poly.length; i++) {
                        const i1 = (poly.length + i - 1) % poly.length;
                        const i2 = (i + 1) % poly.length;
                        const nx = poly[i2].y - poly[i1].y;
                        const ny = -(poly[i2].x - poly[i1].x);
                        const l = Math.sqrt(nx * nx + ny * ny);
                        if (l > 0) {
                            pa[i * 3] += nx * inflate / l;
                            pa[i * 3 + 1] += ny * inflate / l;
                            pa[i * 3 + 2]++;
                        }
                    }
                }
                for (let i = 0; i < poly.length; i++) {
                    if (pa[i * 3 + 2] > 0) {
                        poly[i].x += pa[i * 3] / pa[i * 3 + 2];
                        poly[i].y += pa[i * 3 + 1] / pa[i * 3 + 2];
                        pa[i * 3] = 0;
                        pa[i * 3 + 1] = 0;
                        pa[i * 3 + 2] = 0;
                    }
                    if (poly[i].y > 300) {
                        poly[i].y = 300;
                    }
                }
            }
        }
    }
}

onLoad(() => {
    const poly = createRegularPolygon(50, 16, 0);
    const min = vec2(Math.min(...poly.map(v => v.x)), Math.min(...poly.map(v => v.y)));
    const max = vec2(Math.max(...poly.map(v => v.x)), Math.max(...poly.map(v => v.y)));

    console.log(min, max)

    const data = getSprite("bean").data
    const frame = data.frames[0];

    const obj = add([
        pos(100, 100),
        polygon(poly, {
            uv: poly.map(v => vec2(map(v.x, min.x, max.x, frame.x, frame.x + frame.w), map(v.y, min.y, max.y, frame.y, frame.y + frame.h))),
            tex: data.tex
        }),
        soft()
    ])
});
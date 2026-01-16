import { Rect } from "../../../math/math";
import type { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp, GameObj } from "../../../types";
import type { PolygonComp } from "../draw/polygon";
import type { PosComp } from "../transform/pos";

function polygonArea(poly: Vec2[]) {
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

export type SoftCompOpt = {};

export interface SoftComp extends Comp {
}

export function soft(opt?: SoftCompOpt): SoftComp {
    let po: Vec2[], /* Previous position Vec2[] */
        pl: number[], /* Segment length number[] */
        pa: number[] /* Accumulated changes [x,y,count,..] */;
    let circ: number, area: number;

    return {
        id: "soft",
        require: ["polygon"],
        add(this: GameObj<PolygonComp>) {
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

        update(this: GameObj<PosComp | PolygonComp>) {
            const poly = this.pts;

            // Integrate and apply gravity
            const dt = _k.app.dt();
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
                p.y += 2 * dt;
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
                    if (l != pl[i]) {
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
                    // Apply accumulated changes
                    if (pa[i * 3 + 2] > 0) {
                        poly[i].x += pa[i * 3] / pa[i * 3 + 2];
                        poly[i].y += pa[i * 3 + 1] / pa[i * 3 + 2];
                        pa[i * 3] = 0;
                        pa[i * 3 + 1] = 0;
                        pa[i * 3 + 2] = 0;
                    }
                    // Apply collision response
                    const wp = this.toWorld(poly[i]);
                    _k.game.retrieve(new Rect(wp, 1, 1), obj => {
                        if (obj.worldArea().bbox().contains(wp)) {
                            if (obj.worldArea().contains(wp)) {
                                poly[i] = this.fromWorld(
                                    obj.worldArea().closestPt(wp),
                                );
                            }
                        }
                    });
                }
            }
        },
    };
}

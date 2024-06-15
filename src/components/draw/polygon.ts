import { getInternalContext, getKaboomContext } from "../../kaboom";
import { Polygon } from "../../math";
import type { GameObj, PolygonComp, PolygonCompOpt, Vec2 } from "../../types";

export function polygon(pts: Vec2[], opt: PolygonCompOpt = {}): PolygonComp {
    const k = getKaboomContext(this);
    const internal = getInternalContext(k);

    if (pts.length < 3) {
        throw new Error(
            `Polygon's need more than two points, ${pts.length} points provided`,
        );
    }
    return {
        id: "polygon",
        pts,
        colors: opt.colors,
        uv: opt.uv,
        tex: opt.tex,
        radius: opt.radius,
        draw(this: GameObj<PolygonComp>) {
            k.drawPolygon(Object.assign(internal.getRenderProps(this), {
                pts: this.pts,
                colors: this.colors,
                uv: this.uv,
                tex: this.tex,
                radius: this.radius,
                fill: opt.fill,
                triangulate: opt.triangulate,
            }));
        },
        renderArea(this: GameObj<PolygonComp>) {
            return new Polygon(this.pts);
        },
        inspect() {
            return this.pts.map(p => `[${p.x},${p.y}]`).join(",");
        },
    };
}

import { getKaboomContext } from "../../kaboom";
import { Rect, Vec2 } from "../../math";
import type {
    AnchorComp,
    CircleComp,
    CircleCompOpt,
    GameObj,
    KaboomCtx,
} from "../../types";

function getRenderProps(obj: GameObj<any>) {
    return {
        color: obj.color,
        opacity: obj.opacity,
        anchor: obj.anchor,
        outline: obj.outline,
        shader: obj.shader,
        uniform: obj.uniform,
    };
}

export function circle(
    this: KaboomCtx,
    radius: number,
    opt: CircleCompOpt = {},
): CircleComp {
    const k = getKaboomContext(this);

    return {
        id: "circle",
        radius: radius,
        draw(this: GameObj<CircleComp>) {
            k.drawCircle(Object.assign(getRenderProps(this), {
                radius: this.radius,
                fill: opt.fill,
            }));
        },
        renderArea(this: GameObj<AnchorComp | CircleComp>) {
            return new Rect(
                new Vec2(this.anchor ? 0 : -this.radius),
                this.radius * 2,
                this.radius * 2,
            );
        },
        inspect() {
            return `${Math.ceil(this.radius)}`;
        },
    };
}

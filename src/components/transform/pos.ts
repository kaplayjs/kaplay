import { getInternalContext, getKaboomContext } from "../../kaboom";
import { vec2 } from "../../math";
import { FixedComp, GameObj, PosComp, Vec2, Vec2Args } from "../../types";

function isFixed(obj: GameObj) {
    if (obj.fixed) return true;
    return obj.parent ? isFixed(obj.parent) : false;
}

export function pos(...args: Vec2Args): PosComp {
    const k = getKaboomContext(this);
    const internal = getInternalContext(k);

    return {
        id: "pos",
        pos: vec2(...args),

        moveBy(...args: Vec2Args) {
            this.pos = this.pos.add(vec2(...args));
        },

        // move with velocity (pixels per second)
        move(...args: Vec2Args) {
            this.moveBy(vec2(...args).scale(k.dt()));
        },

        // move to a destination, with optional speed
        moveTo(...args) {
            if (
                typeof args[0] === "number" && typeof args[1] === "number"
            ) {
                return this.moveTo(vec2(args[0], args[1]), args[2]);
            }
            const dest = args[0];
            const speed = args[1];
            if (speed === undefined) {
                this.pos = vec2(dest);
                return;
            }
            const diff = dest.sub(this.pos);
            if (diff.len() <= speed * k.dt()) {
                this.pos = vec2(dest);
                return;
            }
            this.move(diff.unit().scale(speed));
        },

        worldPos(this: GameObj<PosComp>): Vec2 {
            return this.parent
                ? this.parent.transform.multVec2(this.pos)
                : this.pos;
        },

        // get the screen position (transformed by camera)
        screenPos(this: GameObj<PosComp | FixedComp>): Vec2 {
            const pos = this.worldPos();
            return isFixed(this)
                ? pos
                : k.toScreen(pos);
        },

        inspect() {
            return `(${Math.round(this.pos.x)}, ${Math.round(this.pos.y)})`;
        },

        drawInspect() {
            k.drawCircle({
                color: k.rgb(255, 0, 0),
                radius: 4 / internal.getViewportScale(),
            });
        },
    };
}

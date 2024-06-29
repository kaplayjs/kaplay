import { getKaboomContext } from "../../kaboom";
import { Vec2, vec2, type Vec2Args } from "../../math";
import type { Comp, GameObj } from "../../types";
import type { FixedComp } from "./fixed";

/**
 * The {@link pos `pos()`} component.
 *
 * @group Component Types
 */
export interface PosComp extends Comp {
    /**
     * Object's current world position.
     */
    pos: Vec2;
    /**
     * Move how many pixels per second. If object is 'solid', it won't move into other 'solid' objects.
     */
    move(xVel: number, yVel: number): void;
    move(vel: Vec2): void;
    /**
     * Move how many pixels, without multiplying dt, but still checking for 'solid'.
     */
    moveBy(dx: number, dy: number): void;
    moveBy(d: Vec2): void;
    /**
     * Move to a spot with a speed (pixels per second), teleports if speed is not given.
     */
    moveTo(dest: Vec2, speed?: number): void;
    moveTo(x: number, y: number, speed?: number): void;
    /**
     * Get the position of the object on the screen.
     */
    screenPos(): Vec2;
    /**
     * Get the position of the object relative to the root.
     */
    worldPos(): Vec2;
    /**
     * Transform a local point (relative to this) to a screen point (relative to the camera)
     */
    toScreen(this: GameObj<PosComp | FixedComp>, p: Vec2);
    /**
     * Transform a local point (relative to this) to a world point (relative to the root)
     * @since v3001.0
     */
    toWorld(this: GameObj<PosComp>, p: Vec2);
    /**
     * Transform a screen point (relative to the camera) to a local point (relative to this)
     * @since v3001.0
     */
    fromScreen(this: GameObj<PosComp | FixedComp>, p: Vec2);
    /**
     * Transform a world point (relative to the root) to a local point (relative to this)
     * @since v3001.0
     */
    fromWorld(this: GameObj<PosComp>, p: Vec2);
    /**
     * Transform a point relative to this to a point relative to other
     * @since v3001.0
     */
    toOther(this: GameObj<PosComp>, other: GameObj<PosComp>, p: Vec2);
    /**
     * Transform a point relative to other to a point relative to this
     * @since v3001.0
     */
    fromOther(this: GameObj<PosComp>, other: GameObj<PosComp>, p: Vec2);
}

function isFixed(obj: GameObj) {
    if (obj.fixed) return true;
    return obj.parent ? isFixed(obj.parent) : false;
}

export function pos(...args: Vec2Args): PosComp {
    const k = getKaboomContext(this);
    const { getViewportScale } = k._k;

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

        // Get the position of the object relative to the root
        worldPos(this: GameObj<PosComp>, pos: Vec2 | null = null): Vec2 {
            if (pos) {
                this.pos = this.pos.add(this.fromWorld(pos));
            } else {
                return this.parent
                    ? this.parent.transform.multVec2(this.pos)
                    : this.pos;
            }
        },

        // Transform a local point to a world point
        toWorld(this: GameObj<PosComp>, p: Vec2): Vec2 {
            return this.parent
                ? this.parent.transform.multVec2(this.pos.add(p))
                : this.pos.add(p);
        },

        // Transform a world point (relative to the root) to a local point (relative to this)
        fromWorld(this: GameObj<PosComp>, p: Vec2): Vec2 {
            return this.parent
                ? this.parent.transform.invert().multVec2(p).sub(this.pos)
                : p.sub(this.pos);
        },

        // Transform a screen point (relative to the camera) to a local point (relative to this)
        screenPos(
            this: GameObj<PosComp | FixedComp>,
            pos: Vec2 | null = null,
        ): Vec2 {
            if (pos) {
                this.pos = this.pos.add(this.fromScreen(pos));
            } else {
                const pos = this.worldPos();
                return isFixed(this)
                    ? pos
                    : k.toScreen(pos);
            }
        },

        // Transform a local point (relative to this) to a screen point (relative to the camera)
        toScreen(this: GameObj<PosComp | FixedComp>, p: Vec2): Vec2 {
            const pos = this.toWorld(p);
            return isFixed(this)
                ? pos
                : k.toScreen(pos);
        },

        // Transform a screen point (relative to the camera) to a local point (relative to this)
        fromScreen(this: GameObj<PosComp>, p: Vec2): Vec2 {
            return isFixed(this)
                ? this.fromWorld(p)
                : this.fromWorld(k.toWorld(p));
        },

        // Transform a point relative to this to a point relative to other
        toOther(this: GameObj<PosComp>, other: GameObj<PosComp>, p: Vec2) {
            return other.fromWorld(this.toWorld(p));
        },

        // Transform a point relative to other to a point relative to this
        fromOther(this: GameObj<PosComp>, other: GameObj<PosComp>, p: Vec2) {
            return other.toOther(this, p);
        },

        inspect() {
            return `pos: (${Math.round(this.pos.x)}x, ${Math.round(this.pos.y)}y)`;
        },

        drawInspect() {
            k.drawCircle({
                color: k.rgb(255, 0, 0),
                radius: 4 / getViewportScale(),
            });
        },
    };
}

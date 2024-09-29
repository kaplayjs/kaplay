import { isFixed } from "../../game/utils";
import { getViewportScale } from "../../gfx";
import { k } from "../../kaplay";
import { Vec2, vec2, type Vec2Args } from "../../math/math";
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
    screenPos(): Vec2 | null;
    /**
     * Get the position of the object relative to the root.
     */
    worldPos(): Vec2 | null;
    /**
     * Transform a local point (relative to this) to a screen point (relative to the camera)
     */
    toScreen(this: GameObj<PosComp | FixedComp>, p: Vec2): Vec2;
    /**
     * Transform a local point (relative to this) to a world point (relative to the root)
     * @since v3001.0
     */
    toWorld(this: GameObj<PosComp>, p: Vec2): Vec2;
    /**
     * Transform a screen point (relative to the camera) to a local point (relative to this)
     * @since v3001.0
     */
    fromScreen(this: GameObj<PosComp | FixedComp>, p: Vec2): Vec2;
    /**
     * Transform a world point (relative to the root) to a local point (relative to this)
     * @since v3001.0
     */
    fromWorld(this: GameObj<PosComp>, p: Vec2): Vec2;
    /**
     * Transform a point relative to this to a point relative to other
     * @since v3001.0
     */
    toOther(this: GameObj<PosComp>, other: GameObj<PosComp>, p: Vec2): Vec2;
    /**
     * Transform a point relative to other to a point relative to this
     * @since v3001.0
     */
    fromOther(this: GameObj<PosComp>, other: GameObj<PosComp>, p: Vec2): Vec2;
}

export function pos(...args: Vec2Args): PosComp {
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
        // Adress all ts ignores
        moveTo(...args) {
            if (
                typeof args[0] === "number" && typeof args[1] === "number"
            ) {
                // @ts-ignore Use overload functions here?
                return this.moveTo(vec2(args[0], args[1]), args[2]);
            }
            const dest = args[0];
            const speed = args[1];
            if (speed === undefined) {
                this.pos = vec2(dest);
                return;
            }
            // @ts-ignore
            const diff = dest.sub(this.pos);
            if (diff.len() <= speed * k.dt()) {
                this.pos = vec2(dest);
                return;
            }
            this.move(diff.unit().scale(speed));
        },

        // Get the position of the object relative to the root
        worldPos(this: GameObj<PosComp>, pos: Vec2 | null = null) {
            if (pos) {
                this.pos = this.pos.add(this.fromWorld(pos));
                return null;
            }
            else {
                return this.parent
                    ? this.parent.transform.transformPoint(this.pos, vec2())
                    : this.pos;
            }
        },

        // Transform a local point to a world point
        toWorld(this: GameObj<PosComp>, p: Vec2): Vec2 {
            return this.parent
                ? this.parent.transform.transformPoint(this.pos.add(p), vec2())
                : this.pos.add(p);
        },

        // Transform a world point (relative to the root) to a local point (relative to this)
        fromWorld(this: GameObj<PosComp>, p: Vec2): Vec2 {
            return this.parent
                ? this.parent.transform.inverse.transformPoint(p, vec2()).sub(
                    this.pos,
                )
                : p.sub(this.pos);
        },

        // Transform a screen point (relative to the camera) to a local point (relative to this)
        screenPos(
            this: GameObj<PosComp | FixedComp>,
            pos: Vec2 | null = null,
        ) {
            if (pos) {
                this.pos = this.pos.add(this.fromScreen(pos));
                return null;
            }
            else {
                const pos = this.worldPos();

                // This is not really possible, because worldPos() will always return a value
                // if it doesn't have arguments

                // I left this like that for compatibility, maybe if it returns a value
                // will break something?

                if (!pos) {
                    return null;
                }

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
            return `pos: (${Math.round(this.pos.x)}x, ${
                Math.round(this.pos.y)
            }y)`;
        },

        drawInspect() {
            k.drawCircle({
                color: k.rgb(255, 0, 0),
                radius: 4 / getViewportScale(),
            });
        },
    };
}

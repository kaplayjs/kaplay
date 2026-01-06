import { toScreen, toWorld } from "../../../game/camera";
import { drawCircle } from "../../../gfx/draw/drawCircle";
import { rgb } from "../../../math/color";
import { vec2, type Vec2Args } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp, GameObj } from "../../../types";
import {
    type InternalGameObjRaw,
    nextTransformVersion,
} from "../../entity/GameObjRaw";
import { isFixed } from "../../entity/utils";
import type { FixedComp } from "./fixed";

/**
 * The serialized {@link pos `pos()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedPosComp {
    pos: { x: number; y: number };
}

/**
 * The {@link pos `pos()`} component.
 *
 * @group Components
 * @subgroup Component Types
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
     * Get / Set the position of the object on the screen.
     *
     * @since v2000.0
     */
    screenPos: Vec2;
    /**
     * Get / Set the position of the object relative to the root.
     *
     * @since v2000.0
     */
    worldPos: Vec2;
    /**
     * Transform a local point (relative to this) to a screen point (relative to the camera)
     */
    toScreen(this: GameObj<PosComp | FixedComp>, p: Vec2): Vec2;
    /**
     * Transform a local point (relative to this) to a world point (relative to the root)
     *
     * @since v3001.0
     */
    toWorld(this: GameObj<PosComp>, p: Vec2): Vec2;
    /**
     * Transform a screen point (relative to the camera) to a local point (relative to this)
     *
     * @since v3001.0
     */
    fromScreen(this: GameObj<PosComp | FixedComp>, p: Vec2): Vec2;
    /**
     * Transform a world point (relative to the root) to a local point (relative to this)
     *
     * @since v3001.0
     */
    fromWorld(this: GameObj<PosComp>, p: Vec2): Vec2;
    /**
     * Transform a point relative to this to a point relative to other
     *
     * @since v3001.0
     */
    toOther(this: GameObj<PosComp>, other: GameObj<PosComp>, p: Vec2): Vec2;
    /**
     * Transform a point relative to other to a point relative to this
     *
     * @since v3001.0
     */
    fromOther(this: GameObj<PosComp>, other: GameObj<PosComp>, p: Vec2): Vec2;
    /**
     * Serialize the current state comp
     */
    serialize(): SerializedPosComp;
}

export function pos(...args: Vec2Args): PosComp {
    const _pos = vec2(...args);
    const _posReadOnly = vec2(...args);

    return {
        id: "pos",

        add() {
            (this as any as InternalGameObjRaw)._transformVersion =
                nextTransformVersion();
        },

        get pos(): Vec2 {
            return _posReadOnly;
        },
        set pos(value: Vec2) {
            _pos.x = value.x;
            _pos.y = value.y;
            _posReadOnly.x = value.x;
            _posReadOnly.y = value.y;
            (this as any as InternalGameObjRaw)._transformVersion =
                nextTransformVersion();
        },

        moveBy(...args: Vec2Args) {
            this.pos = this.pos.add(vec2(...args));
        },

        // move with velocity (pixels per second)
        move(...args: Vec2Args) {
            this.moveBy(vec2(...args).scale(_k.app.dt()));
        },

        // move to a destination, with optional speed
        // Address all ts ignores
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
            if (diff.len() <= speed * _k.app.dt()) {
                this.pos = vec2(dest);
                return;
            }
            this.move(diff.unit().scale(speed));
        },

        // Set the position of the object relative to the root
        set worldPos(pos: Vec2) {
            const obj = this as unknown as GameObj<PosComp>;
            this.pos = obj.parent
                ? obj.parent.transform.transformPointV(pos, vec2())
                : pos;
        },

        get worldPos(): Vec2 {
            const obj = this as unknown as GameObj<PosComp>;
            return obj.parent
                ? obj.parent.transform.transformPointV(obj.pos, vec2())
                : obj.pos;
        },

        // Transform a local point to a world point
        toWorld(this: GameObj<PosComp>, p: Vec2): Vec2 {
            return this.transform.transformPointV(p, vec2());
        },

        // Transform a world point (relative to the root) to a local point (relative to this)
        fromWorld(this: GameObj<PosComp>, p: Vec2): Vec2 {
            return this.transform.inverse.transformPointV(p, vec2());
        },

        // Transform a screen point (relative to the camera) to a local point (relative to this)
        set screenPos(pos: Vec2) {
            const obj = this as unknown as GameObj<PosComp>;
            this.worldPos = isFixed(obj)
                ? pos
                : toWorld(pos);
        },

        get screenPos() {
            const obj = this as unknown as GameObj<PosComp>;
            const pos = obj.worldPos;
            return isFixed(obj)
                ? pos
                : toScreen(pos);
        },

        // Transform a local point (relative to this) to a screen point (relative to the camera)
        toScreen(this: GameObj<PosComp | FixedComp>, pos: Vec2): Vec2 {
            pos = this.toWorld(pos);
            return isFixed(this)
                ? pos
                : toScreen(pos);
        },

        // Transform a screen point (relative to the camera) to a local point (relative to this)
        fromScreen(this: GameObj<PosComp>, pos: Vec2): Vec2 {
            return isFixed(this)
                ? this.fromWorld(pos)
                : this.fromWorld(toWorld(pos));
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
            drawCircle({
                color: rgb(255, 0, 0),
                radius: 4 / _k.gfx.viewport.scale,
            });
        },

        serialize() {
            return { pos: this.pos.serialize() };
        },
    };
}

export function posFactory(data: SerializedPosComp) {
    return pos(data.pos.x, data.pos.y);
}

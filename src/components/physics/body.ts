import { fixedDt } from "../../app";
import { DEF_JUMP_FORCE, MAX_VEL } from "../../constants";
import { game, k } from "../../kaplay";
import { type Vec2, vec2 } from "../../math/math";
import { calcTransform } from "../../math/various";
import type { Collision, Comp, GameObj } from "../../types";
import type { KEventController } from "../../utils/";
import type { PosComp } from "../transform/pos";
import type { AreaComp } from "./area";

/**
 * The {@link body `body()`} component.
 *
 * @group Component Types
 */
export interface BodyComp extends Comp {
    /**
     * Object current velocity.
     *
     * @since v3001.0
     */
    vel: Vec2;
    /**
     * How much velocity decays (velocity *= 1 / (1 + damping * dt) every frame).
     *
     * @since v3001.0
     */
    damping: number;
    /**
     * If object is static, won't move, and all non static objects won't move past it.
     */
    isStatic: boolean;
    /**
     * Initial speed in pixels per second for jump().
     */
    jumpForce: number;
    /**
     * Gravity multiplier.
     */
    gravityScale: number;
    /**
     * Mass of the body, decides how much a non-static body should move when resolves with another non-static body. (default 1).
     *
     * @since v3000.0
     */
    mass: number;
    /**
     * If object should move with moving platform (default true).
     *
     * @since v3000.0
     */
    stickToPlatform?: boolean;
    /**
     * Current platform landing on.
     */
    curPlatform(): GameObj | null;
    /**
     * If currently landing on a platform.
     *
     * @since v2000.1
     */
    isGrounded(): boolean;
    /**
     * If currently falling.
     *
     * @since v2000.1
     */
    isFalling(): boolean;
    /**
     * If currently rising.
     *
     * @since v3000.0
     */
    isJumping(): boolean;
    /**
     * Applies an impulse
     * @param impulse The impulse vector, applied directly
     */
    applyImpulse(impulse: Vec2): void;
    /**
     * Applies a force
     * @param force The force vector, applied after scaled by the inverse mass
     */
    addForce(force: Vec2): void;
    /**
     * Upward thrust.
     */
    jump(force?: number): void;
    /**
     * Register an event that runs when a collision is resolved.
     *
     * @since v3000.0
     */
    onPhysicsResolve(action: (col: Collision) => void): KEventController;
    /**
     * Register an event that runs before a collision would be resolved.
     *
     * @since v3000.0
     */
    onBeforePhysicsResolve(action: (col: Collision) => void): KEventController;
    /**
     * Register an event that runs when the object is grounded.
     *
     * @since v2000.1
     */
    onGround(action: () => void): KEventController;
    /**
     * Register an event that runs when the object starts falling.
     *
     * @since v2000.1
     */
    onFall(action: () => void): KEventController;
    /**
     * Register an event that runs when the object falls off platform.
     *
     * @since v3000.0
     */
    onFallOff(action: () => void): KEventController;
    /**
     * Register an event that runs when the object bumps into something on the head.
     *
     * @since v2000.1
     */
    onHeadbutt(action: () => void): KEventController;
    /**
     * Register an event that runs when an object lands on this object.
     *
     * @since v3001.0
     */
    onLand(action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs when the object is bumped by another object head.
     */
    onHeadbutted(action: (obj: GameObj) => void): KEventController;
}

/**
 * Options for the {@link body `body()`} component.
 *
 * @group Component Types
 */
export interface BodyCompOpt {
    /**
     * How much velocity decays (velocity *= 1 / (1 + damping * dt) every frame).
     *
     * @since v3001.0
     */
    damping?: number;
    /**
     * Initial speed in pixels per second for jump().
     */
    jumpForce?: number;
    /**
     * Maximum velocity when falling.
     */
    maxVelocity?: number;
    /**
     * Gravity multiplier.
     */
    gravityScale?: number;
    /**
     * If object is static, won't move, and all non static objects won't move past it.
     *
     * @since v3000.0
     */
    isStatic?: boolean;
    /**
     * If object should move with moving platform (default true).
     *
     * @since v3000.0
     */
    stickToPlatform?: boolean;
    /**
     * Mass of the body, decides how much a non-static body should move when resolves with another non-static body. (default 1).
     *
     * @since v3000.0
     */
    mass?: number;
}

export function body(opt: BodyCompOpt = {}): BodyComp {
    let curPlatform: GameObj<PosComp | AreaComp | BodyComp> | null = null;
    let lastPlatformPos: null | Vec2 = null;
    let willFall = false;
    const acc = vec2(0);
    let prevPhysicsPos: Vec2 | null = null;
    let nextPhysicsPos: Vec2 | null = null;
    let prevDrawPos: Vec2;

    return {
        id: "body",
        require: ["pos"],
        vel: vec2(0),
        damping: opt.damping ?? 0,
        jumpForce: opt.jumpForce ?? DEF_JUMP_FORCE,
        gravityScale: opt.gravityScale ?? 1,
        isStatic: opt.isStatic ?? false,
        // TODO: prefer density * area
        mass: opt.mass ?? 1,
        add(this: GameObj<PosComp | BodyComp | AreaComp>) {
            prevPhysicsPos = this.pos.clone();
            nextPhysicsPos = this.pos.clone();
            prevDrawPos = this.pos.clone();
            if (this.mass === 0) {
                throw new Error("Can't set body mass to 0");
            }

            if (this.is("area")) {
                // static vs static: don't resolve
                // static vs non-static: always resolve non-static
                // non-static vs non-static: resolve the first one
                this.onCollideUpdate(
                    (other, col) => {
                        if (!col) return;
                        if (!other.is("body")) return;
                        if (col.resolved) return;

                        this.trigger("beforePhysicsResolve", col);
                        const rcol = col.reverse();
                        other.trigger("beforePhysicsResolve", rcol);

                        // user can mark 'resolved' in beforePhysicsResolve to stop a resolution
                        if (col.resolved || rcol.resolved) {
                            return;
                        }

                        if (this.isStatic && other.isStatic) {
                            return;
                        }
                        else if (!this.isStatic && !other.isStatic) {
                            // TODO: update all children transform?
                            const tmass = this.mass + other.mass;
                            this.pos = this.pos.add(
                                col.displacement.scale(other.mass / tmass),
                            );
                            other.pos = other.pos.add(
                                col.displacement.scale(-this.mass / tmass),
                            );
                            calcTransform(this, this.transform);
                            calcTransform(other, other.transform);
                        }
                        else {
                            // if one is static and on is not, resolve the non static one
                            const col2 = (!this.isStatic && other.isStatic)
                                ? col
                                : col.reverse();
                            col2.source.pos = col2.source.pos.add(
                                col2.displacement,
                            );
                            calcTransform(col2.source, col2.source.transform);
                        }

                        col.resolved = true;
                        this.trigger("physicsResolve", col);
                        other.trigger("physicsResolve", col.reverse());
                    },
                );

                this.onPhysicsResolve((col) => {
                    if (game.gravity) {
                        if (col.isBottom() && this.isFalling()) {
                            // We need the past platform to check if we already were on a platform
                            const pastPlatform = curPlatform;
                            curPlatform = col.target as GameObj<
                                PosComp | BodyComp | AreaComp
                            >;
                            if (pastPlatform != curPlatform) {
                                // If we are on a new platform, update the sticky position
                                lastPlatformPos = col.target.pos;
                            }
                            if (willFall) {
                                // We would have fallen, but didn't.
                                // This happens when we leave one platform block and move onto another
                                willFall = false;
                            }
                            else if (!pastPlatform) {
                                // We weren't on a platform, land
                                this.trigger("ground", curPlatform);
                                col.target.trigger("land", this);
                            }
                        }
                        else if (col.isTop() && this.isJumping()) {
                            this.trigger("headbutt", col.target);
                            col.target.trigger("headbutted", this);
                        }
                    }

                    const restitution = Math.max(
                        col.source.restitution || 0,
                        col.target.restitution || 0,
                    );

                    const friction = Math.sqrt(
                        (col.source.friction || 0)
                            * (col.target.friction || 0),
                    );

                    const projection = this.vel.project(col.normal);
                    const rejection = this.vel.sub(projection);

                    // Clear the velocity in the direction of the normal, as we've hit something
                    if (this.vel.dot(col.normal) < 0) {
                        // Modulate the velocity tangential to the normal
                        this.vel = rejection.sub(projection.scale(restitution));
                    }

                    if (friction != 0) {
                        // TODO: This should work with dt, not frame, but then friction 1 will brake in 1 second, not one frame
                        // TODO: This should depend with gravity, stronger gravity means more friction
                        //       getGravityDirection().scale(getGravity()).project(col.normal).len()
                        this.vel = this.vel.sub(rejection.scale(friction));
                    }
                });
            }
        },

        update(this: GameObj<PosComp | BodyComp | AreaComp>) {
            // Sticky platform
            if (curPlatform) {
                if (
                    // We are still colliding with the platform and the platform exists
                    this.isColliding(curPlatform)
                    && curPlatform.exists()
                    && curPlatform.is("body")
                ) {
                    // This needs to happen in onUpdate. Otherwise the player position will jitter.
                    if (
                        lastPlatformPos
                        && !curPlatform.pos.eq(lastPlatformPos)
                        && opt.stickToPlatform !== false
                    ) {
                        // Stick to the platform
                        this.moveBy(
                            curPlatform.pos.sub(lastPlatformPos),
                        );
                    }
                    lastPlatformPos = curPlatform.pos;
                }
            }

            const dt = k.restDt();
            if (dt) {
                // Check if no external changes were made
                if (this.pos.x == prevDrawPos.x) {
                    // Interpolate physics steps
                    this.pos.x = k.lerp(
                        prevPhysicsPos!.x,
                        nextPhysicsPos!.x,
                        dt / k.fixedDt(),
                    );
                    // Copy to check for changes
                    prevDrawPos.x = this.pos.x;
                }
                if (this.pos.y == prevDrawPos.y) {
                    // Interpolate physics steps
                    this.pos.y = k.lerp(
                        prevPhysicsPos!.y,
                        nextPhysicsPos!.y,
                        dt / k.fixedDt(),
                    );
                    // Copy to check for changes
                    prevDrawPos.y = this.pos.y;
                }
            }
        },

        fixedUpdate(this: GameObj<PosComp | BodyComp | AreaComp>) {
            // If we were interpolating, and the position wasn't set manually, reset to last physics position
            if (prevPhysicsPos) {
                if (this.pos.x == prevDrawPos.x) {
                    this.pos.x = prevPhysicsPos.x;
                }
                if (this.pos.y == prevDrawPos.y) {
                    this.pos.y = prevPhysicsPos.y;
                }
                prevPhysicsPos = null;
            }

            if (game.gravity && !this.isStatic) {
                // If we are falling over the edge of the current a platform
                if (willFall) {
                    curPlatform = null;
                    lastPlatformPos = null;
                    this.trigger("fallOff");
                    willFall = false;
                }

                // If we were previously on a platform
                if (curPlatform) {
                    if (
                        // If we are no longer on the platform, or the platform was deleted
                        !this.isColliding(curPlatform)
                        || !curPlatform.exists()
                        || !curPlatform.is("body")
                    ) {
                        willFall = true;
                    }
                }

                const prevVel = this.vel.clone();

                // Apply gravity
                this.vel = this.vel.add(
                    game.gravity.scale(this.gravityScale * k.dt()),
                );

                // Clamp velocity
                const maxVel = opt.maxVelocity ?? MAX_VEL;
                if (this.vel.slen() > maxVel * maxVel) {
                    this.vel = this.vel.unit().scale(maxVel);
                }

                // Check if we have started to fall.
                // We do this by looking at the velocity vector along the direction of gravity
                if (
                    prevVel.dot(game.gravity) < 0
                    && this.vel.dot(game.gravity) >= 0
                ) {
                    this.trigger("fall");
                }
            }

            // Apply velocity and position changes
            this.vel.x += acc.x * k.dt();
            this.vel.y += acc.y * k.dt();

            this.vel.x *= 1 / (1 + this.damping * k.dt());
            this.vel.y *= 1 / (1 + this.damping * k.dt());

            this.move(this.vel);

            // If we need to interpolate physics, prepare interpolation data
            const dt = k.restDt();
            if (dt) {
                // Save this position as previous
                prevPhysicsPos = this.pos.clone();
                // Calculate next (future) position
                const nextVel = this.vel.add(acc.scale(k.dt()));
                nextPhysicsPos = this.pos.add(nextVel.scale(k.dt()));
                // Copy to check for changes
                prevDrawPos = this.pos.clone();
            }

            // Reset acceleration
            acc.x = 0;
            acc.y = 0;
        },

        onPhysicsResolve(this: GameObj, action) {
            return this.on("physicsResolve", action);
        },

        onBeforePhysicsResolve(this: GameObj, action) {
            return this.on("beforePhysicsResolve", action);
        },

        curPlatform(): GameObj | null {
            return curPlatform;
        },

        isGrounded() {
            return curPlatform !== null;
        },

        isFalling(): boolean {
            return this.vel.dot(k.getGravityDirection()) > 0;
        },

        isJumping(): boolean {
            return this.vel.dot(k.getGravityDirection()) < 0;
        },

        applyImpulse(impulse: Vec2) {
            this.vel = this.vel.add(impulse);
        },

        addForce(force: Vec2) {
            acc.x += force.x / this.mass;
            acc.y += force.y / this.mass;
        },

        jump(force: number) {
            curPlatform = null;
            lastPlatformPos = null;
            this.vel = k.getGravityDirection().scale(
                -force || -this.jumpForce,
            );
        },

        onGround(this: GameObj, action: () => void): KEventController {
            return this.on("ground", action);
        },

        onFall(this: GameObj, action: () => void): KEventController {
            return this.on("fall", action);
        },

        onFallOff(this: GameObj, action: () => void): KEventController {
            return this.on("fallOff", action);
        },

        onHeadbutt(this: GameObj, action: () => void): KEventController {
            return this.on("headbutt", action);
        },

        onLand(this: GameObj, action: (obj: GameObj) => void) {
            return this.on("land", action);
        },

        onHeadbutted(this: GameObj, action: (obj: GameObj) => void) {
            return this.on("headbutted", action);
        },

        inspect() {
            return `gravityScale: ${this.gravityScale}x`;
        },
    };
}

import { DEF_JUMP_FORCE, MAX_VEL } from "@/constants";
import { getInternalContext, getKaboomContext } from "@/kaboom";
import { vec2 } from "@/math";
import {
    AreaComp,
    BodyComp,
    BodyCompOpt,
    EventController,
    GameObj,
    PosComp,
} from "@/types";

export function body(opt: BodyCompOpt = {}): BodyComp {
    const k = getKaboomContext(this);
    const internal = getInternalContext(k);
    let curPlatform: GameObj<PosComp | AreaComp | BodyComp> | null = null;
    let lastPlatformPos = null;
    let willFall = false;

    return {
        id: "body",
        require: ["pos"],
        vel: vec2(0),
        drag: opt.drag ?? 0,
        jumpForce: opt.jumpForce ?? DEF_JUMP_FORCE,
        gravityScale: opt.gravityScale ?? 1,
        isStatic: opt.isStatic ?? false,
        // TODO: prefer density * area
        mass: opt.mass ?? 1,

        add(this: GameObj<PosComp | BodyComp | AreaComp>) {
            if (this.mass === 0) {
                throw new Error("Can't set body mass to 0");
            }

            if (this.is("area")) {
                // static vs static: don't resolve
                // static vs non-static: always resolve non-static
                // non-static vs non-static: resolve the first one
                this.onCollideUpdate(
                    (other: GameObj<PosComp | BodyComp>, col) => {
                        if (!other.is("body")) {
                            return;
                        }

                        if (col.resolved) {
                            return;
                        }

                        this.trigger("beforePhysicsResolve", col);
                        const rcol = col.reverse();
                        other.trigger("beforePhysicsResolve", rcol);

                        // user can mark 'resolved' in beforePhysicsResolve to stop a resolution
                        if (col.resolved || rcol.resolved) {
                            return;
                        }

                        if (this.isStatic && other.isStatic) {
                            return;
                        } else if (!this.isStatic && !other.isStatic) {
                            // TODO: update all children transform?
                            const tmass = this.mass + other.mass;
                            this.pos = this.pos.add(
                                col.displacement.scale(other.mass / tmass),
                            );
                            other.pos = other.pos.add(
                                col.displacement.scale(-this.mass / tmass),
                            );
                            this.transform = internal.calcTransform(this);
                            other.transform = internal.calcTransform(other);
                        } else {
                            // if one is static and on is not, resolve the non static one
                            const col2 = (!this.isStatic && other.isStatic)
                                ? col
                                : col.reverse();
                            col2.source.pos = col2.source.pos.add(
                                col2.displacement,
                            );
                            col2.source.transform = internal.calcTransform(
                                col2.source,
                            );
                        }

                        col.resolved = true;
                        this.trigger("physicsResolve", col);
                        other.trigger("physicsResolve", col.reverse());
                    },
                );

                this.onPhysicsResolve((col) => {
                    if (internal.game.gravity) {
                        if (col.isBottom() && this.isFalling()) {
                            this.vel = this.vel.reject(
                                internal.game.gravity.unit(),
                            );
                            curPlatform = col.target as GameObj<
                                PosComp | BodyComp | AreaComp
                            >;
                            lastPlatformPos = col.target.pos;
                            if (willFall) {
                                willFall = false;
                            } else {
                                this.trigger("ground", curPlatform);
                            }
                        } else if (col.isTop() && this.isJumping()) {
                            this.vel = this.vel.reject(
                                internal.game.gravity.unit(),
                            );
                            this.trigger("headbutt", col.target);
                        }
                    }
                });
            }
        },

        update(this: GameObj<PosComp | BodyComp | AreaComp>) {
            if (internal.game.gravity && !this.isStatic) {
                if (willFall) {
                    curPlatform = null;
                    lastPlatformPos = null;
                    this.trigger("fallOff");
                    willFall = false;
                }

                let addGravity = true;

                if (curPlatform) {
                    if (
                        // TODO: this prevents from falling when on edge
                        !this.isColliding(curPlatform)
                        || !curPlatform.exists()
                        || !curPlatform.is("body")
                    ) {
                        willFall = true;
                    } else {
                        if (
                            !curPlatform.pos.eq(lastPlatformPos)
                            && opt.stickToPlatform !== false
                        ) {
                            this.moveBy(
                                curPlatform.pos.sub(lastPlatformPos),
                            );
                        }
                        lastPlatformPos = curPlatform.pos;
                        addGravity = false;
                    }
                }

                if (addGravity) {
                    const prevVel = this.vel.clone();

                    // Apply gravity
                    this.vel = this.vel.add(
                        internal.game.gravity.scale(this.gravityScale * k.dt()),
                    );

                    // Clamp velocity
                    const maxVel = opt.maxVelocity ?? MAX_VEL;
                    if (this.vel.slen() > maxVel * maxVel) {
                        this.vel = this.vel.unit().scale(maxVel);
                    }

                    if (
                        prevVel.dot(internal.game.gravity) < 0
                        && this.vel.dot(internal.game.gravity) >= 0
                    ) {
                        this.trigger("fall");
                    }
                }
            }

            this.vel.x *= 1 - this.drag;
            this.vel.y *= 1 - this.drag;

            this.move(this.vel);
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
            return this.vel.dot(internal.game.gravity) > 0;
        },

        isJumping(): boolean {
            return this.vel.dot(internal.game.gravity) < 0;
        },

        jump(force: number) {
            curPlatform = null;
            lastPlatformPos = null;
            this.vel = internal.game.gravity.unit().scale(
                -force || -this.jumpForce,
            );
        },

        onGround(this: GameObj, action: () => void): EventController {
            return this.on("ground", action);
        },

        onFall(this: GameObj, action: () => void): EventController {
            return this.on("fall", action);
        },

        onFallOff(this: GameObj, action: () => void): EventController {
            return this.on("fallOff", action);
        },

        onHeadbutt(this: GameObj, action: () => void): EventController {
            return this.on("headbutt", action);
        },
    };
}

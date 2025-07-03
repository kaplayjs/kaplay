"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.body = body;
var general_1 = require("../../../constants/general");
var gravity_1 = require("../../../game/gravity");
var lerp_1 = require("../../../math/lerp");
var math_1 = require("../../../math/math");
var various_1 = require("../../../math/various");
var shared_1 = require("../../../shared");
function body(opt) {
    var _a, _b, _c, _d, _e;
    if (opt === void 0) { opt = {}; }
    var curPlatform = null;
    var lastPlatformPos = null;
    var willFall = false;
    var acc = (0, math_1.vec2)(0);
    var prevPhysicsPos = null;
    var nextPhysicsPos = null;
    var prevDrawPos;
    return {
        id: "body",
        require: ["pos"],
        vel: (0, math_1.vec2)(0),
        damping: (_a = opt.damping) !== null && _a !== void 0 ? _a : 0,
        jumpForce: (_b = opt.jumpForce) !== null && _b !== void 0 ? _b : general_1.DEF_JUMP_FORCE,
        gravityScale: (_c = opt.gravityScale) !== null && _c !== void 0 ? _c : 1,
        isStatic: (_d = opt.isStatic) !== null && _d !== void 0 ? _d : false,
        // TODO: prefer density * area
        mass: (_e = opt.mass) !== null && _e !== void 0 ? _e : 1,
        add: function () {
            var _this = this;
            prevPhysicsPos = this.pos.clone();
            nextPhysicsPos = this.pos.clone();
            prevDrawPos = this.pos.clone();
            if (this.mass === 0) {
                throw new Error("Can't set body mass to 0");
            }
            if (this.has("area")) {
                // static vs static: don't resolve
                // static vs non-static: always resolve non-static
                // non-static vs non-static: resolve the first one
                this.onCollideUpdate(function (other, col) {
                    if (!col)
                        return;
                    if (!other.has("body"))
                        return;
                    if (col.resolved)
                        return;
                    _this.trigger("beforePhysicsResolve", col);
                    var rcol = col.reverse();
                    other.trigger("beforePhysicsResolve", rcol);
                    // user can mark 'resolved' in beforePhysicsResolve to stop a resolution
                    if (col.resolved || rcol.resolved) {
                        return;
                    }
                    if (_this.isStatic && other.isStatic) {
                        return;
                    }
                    else if (!_this.isStatic && !other.isStatic) {
                        // TODO: update all children transform?
                        var tmass = _this.mass + other.mass;
                        _this.pos = _this.pos.add(col.displacement.scale(other.mass / tmass));
                        other.pos = other.pos.add(col.displacement.scale(-_this.mass / tmass));
                        (0, various_1.calcTransform)(_this, _this.transform);
                        (0, various_1.calcTransform)(other, other.transform);
                    }
                    else {
                        // if one is static and on is not, resolve the non static one
                        var col2 = (!_this.isStatic && other.isStatic)
                            ? col
                            : col.reverse();
                        col2.source.pos = col2.source.pos.add(col2.displacement);
                        (0, various_1.calcTransform)(col2.source, col2.source.transform);
                    }
                    col.resolved = true;
                    _this.trigger("physicsResolve", col);
                    other.trigger("physicsResolve", col.reverse());
                });
                this.onPhysicsResolve(function (col) {
                    if (shared_1._k.game.gravity) {
                        if (col.isBottom() && _this.isFalling()) {
                            // We need the past platform to check if we already were on a platform
                            var pastPlatform = curPlatform;
                            curPlatform = col.target;
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
                                _this.trigger("ground", curPlatform);
                                col.target.trigger("land", _this);
                            }
                        }
                        else if (col.isTop() && _this.isJumping()) {
                            _this.trigger("headbutt", col.target);
                            col.target.trigger("headbutted", _this);
                        }
                    }
                    var restitution = Math.max(col.source.restitution || 0, col.target.restitution || 0);
                    var friction = Math.sqrt((col.source.friction || 0)
                        * (col.target.friction || 0));
                    var projection = _this.vel.project(col.normal);
                    var rejection = _this.vel.sub(projection);
                    // Clear the velocity in the direction of the normal, as we've hit something
                    if (_this.vel.dot(col.normal) < 0) {
                        // Modulate the velocity tangential to the normal
                        _this.vel = rejection.sub(projection.scale(restitution));
                    }
                    if (friction != 0) {
                        // TODO: This should work with dt, not frame, but then friction 1 will brake in 1 second, not one frame
                        // TODO: This should depend with gravity, stronger gravity means more friction
                        //       getGravityDirection().scale(getGravity()).project(col.normal).len()
                        _this.vel = _this.vel.sub(rejection.scale(friction));
                    }
                });
            }
        },
        update: function () {
            // Sticky platform
            if (curPlatform) {
                if (
                // We are still colliding with the platform and the platform exists
                this.isColliding(curPlatform)
                    && curPlatform.exists()
                    && curPlatform.has("body")) {
                    // This needs to happen in onUpdate. Otherwise the player position will jitter.
                    if (lastPlatformPos
                        && !curPlatform.pos.eq(lastPlatformPos)
                        && opt.stickToPlatform !== false) {
                        // Stick to the platform
                        this.moveBy(curPlatform.pos.sub(lastPlatformPos));
                    }
                    lastPlatformPos = curPlatform.pos;
                }
            }
            var dt = shared_1._k.app.restDt();
            if (dt) {
                // Check if no external changes were made
                if (this.pos.x == prevDrawPos.x) {
                    // Interpolate physics steps
                    this.pos.x = (0, lerp_1.lerp)(prevPhysicsPos.x, nextPhysicsPos.x, dt / shared_1._k.app.fixedDt());
                    // Copy to check for changes
                    prevDrawPos.x = this.pos.x;
                }
                if (this.pos.y == prevDrawPos.y) {
                    // Interpolate physics steps
                    this.pos.y = (0, lerp_1.lerp)(prevPhysicsPos.y, nextPhysicsPos.y, dt / shared_1._k.app.fixedDt());
                    // Copy to check for changes
                    prevDrawPos.y = this.pos.y;
                }
            }
        },
        fixedUpdate: function () {
            var _a;
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
            if (shared_1._k.game.gravity && !this.isStatic) {
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
                        || !curPlatform.has("body")) {
                        willFall = true;
                    }
                }
                var prevVel = this.vel.clone();
                // Apply gravity
                this.vel = this.vel.add(shared_1._k.game.gravity.scale(this.gravityScale * shared_1._k.app.dt()));
                // Clamp velocity
                var maxVel = (_a = opt.maxVelocity) !== null && _a !== void 0 ? _a : general_1.MAX_VEL;
                if (this.vel.slen() > maxVel * maxVel) {
                    this.vel = this.vel.unit().scale(maxVel);
                }
                // Check if we have started to fall.
                // We do this by looking at the velocity vector along the direction of gravity
                if (prevVel.dot(shared_1._k.game.gravity) < 0
                    && this.vel.dot(shared_1._k.game.gravity) >= 0) {
                    this.trigger("fall");
                }
            }
            // Apply velocity and position changes
            this.vel.x += acc.x * shared_1._k.app.dt();
            this.vel.y += acc.y * shared_1._k.app.dt();
            this.vel.x *= 1 / (1 + this.damping * shared_1._k.app.dt());
            this.vel.y *= 1 / (1 + this.damping * shared_1._k.app.dt());
            this.move(this.vel);
            // If we need to interpolate physics, prepare interpolation data
            var rDt = shared_1._k.app.restDt();
            if (rDt) {
                // Save this position as previous
                prevPhysicsPos = this.pos.clone();
                // Calculate next (future) position
                var nextVel = this.vel.add(acc.scale(shared_1._k.app.dt()));
                nextPhysicsPos = this.pos.add(nextVel.scale(shared_1._k.app.dt()));
                // Copy to check for changes
                prevDrawPos = this.pos.clone();
            }
            // Reset acceleration
            acc.x = 0;
            acc.y = 0;
        },
        onPhysicsResolve: function (action) {
            return this.on("physicsResolve", action);
        },
        onBeforePhysicsResolve: function (action) {
            return this.on("beforePhysicsResolve", action);
        },
        curPlatform: function () {
            return curPlatform;
        },
        isGrounded: function () {
            return curPlatform !== null;
        },
        isFalling: function () {
            return this.vel.dot((0, gravity_1.getGravityDirection)()) > 0;
        },
        isJumping: function () {
            return this.vel.dot((0, gravity_1.getGravityDirection)()) < 0;
        },
        applyImpulse: function (impulse) {
            if (this.isStatic)
                return;
            this.vel = this.vel.add(impulse);
        },
        addForce: function (force) {
            if (this.isStatic)
                return;
            acc.x += force.x / this.mass;
            acc.y += force.y / this.mass;
        },
        jump: function (force) {
            if (this.isStatic)
                return;
            curPlatform = null;
            lastPlatformPos = null;
            this.vel = (0, gravity_1.getGravityDirection)().scale(-force || -this.jumpForce);
        },
        onGround: function (action) {
            return this.on("ground", action);
        },
        onFall: function (action) {
            return this.on("fall", action);
        },
        onFallOff: function (action) {
            return this.on("fallOff", action);
        },
        onHeadbutt: function (action) {
            return this.on("headbutt", action);
        },
        onLand: function (action) {
            return this.on("land", action);
        },
        onHeadbutted: function (action) {
            return this.on("headbutted", action);
        },
        inspect: function () {
            return "gravityScale: ".concat(this.gravityScale, "x");
        },
    };
}

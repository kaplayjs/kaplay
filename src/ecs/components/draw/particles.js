"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.particles = particles;
var events_1 = require("../../../events/events");
var drawRaw_1 = require("../../../gfx/draw/drawRaw");
var color_1 = require("../../../math/color");
var lerp_1 = require("../../../math/lerp");
var math_1 = require("../../../math/math");
var Vec2_1 = require("../../../math/Vec2");
var shared_1 = require("../../../shared");
/**
 * A particle. Used on the {@link particles `particles()`} component.
 */
var Particle = /** @class */ function() {
    function Particle() {
        this.pos = (0, math_1.vec2)(0);
        this.vel = (0, math_1.vec2)(0);
        this.acc = (0, math_1.vec2)(0);
        this.angle = 0;
        this.angularVelocity = 0;
        this.damping = 0;
        this.t = 0;
        this.lt = null;
        this.gc = true;
    }
    Object.defineProperty(Particle.prototype, "progress", {
        get: function() {
            return this.lt ? this.t / this.lt : this.t;
        },
        enumerable: false,
        configurable: true,
    });
    return Particle;
}();
function particles(popt, eopt) {
    var emitterLifetime = eopt.lifetime;
    var particles = new Array(popt.max);
    var colors = popt.colors || [color_1.Color.WHITE];
    var opacities = popt.opacities || [1];
    var quads = popt.quads || [new math_1.Quad(0, 0, 1, 1)];
    var scales = popt.scales || [1];
    var lifetime = popt.lifeTime;
    var spread = eopt.spread || 0;
    var speed = popt.speed || [0, 0];
    var angleRange = popt.angle || [0, 0];
    var angularVelocityRange = popt.angularVelocity || [0, 0];
    var accelerationRange = popt.acceleration
        || [(0, math_1.vec2)(0), (0, math_1.vec2)(0)];
    var dampingRange = popt.damping || [0, 0];
    var indices = new Array(popt.max * 6);
    var attributes = {
        pos: new Array(popt.max * 4 * 2),
        uv: new Array(popt.max * 4 * 2),
        color: new Array(popt.max * 4 * 3),
        opacity: new Array(popt.max * 4),
    };
    var count = 0;
    var time = 0;
    for (var i = 0; i < popt.max; i++) {
        indices[i * 6 + 0] = i * 4 + 0;
        indices[i * 6 + 1] = i * 4 + 1;
        indices[i * 6 + 2] = i * 4 + 3;
        indices[i * 6 + 3] = i * 4 + 1;
        indices[i * 6 + 4] = i * 4 + 2;
        indices[i * 6 + 5] = i * 4 + 3;
        attributes.pos.fill(0);
        attributes.uv.fill(0);
        attributes.color.fill(255);
        attributes.opacity.fill(1);
        particles[i] = new Particle();
    }
    var onEndEvents = new events_1.KEvent();
    function nextFree(index) {
        if (index === void 0) index = 0;
        while (index < popt.max) {
            if (particles[index].gc) {
                return index;
            }
            index++;
        }
        return null;
    }
    return {
        id: "particles",
        emitter: {
            position: eopt.position || (0, math_1.vec2)(),
            direction: eopt.direction || 0,
        },
        emit: function(n) {
            n = Math.min(n, popt.max - count);
            var index = 0;
            for (var i = 0; i < n; i++) {
                index = nextFree(index);
                if (index == null) {
                    return;
                }
                var velocityAngle = (0, math_1.rand)(
                    this.emitter.direction - spread,
                    this.emitter.direction + spread,
                );
                var vel = Vec2_1.Vec2.fromAngle(velocityAngle).scale(
                    (0, math_1.rand)(speed[0], speed[1]),
                );
                var angle = (0, math_1.rand)(angleRange[0], angleRange[1]);
                var angularVelocity = (0, math_1.rand)(
                    angularVelocityRange[0],
                    angularVelocityRange[1],
                );
                var acceleration = (0, math_1.vec2)(
                    (0, math_1.rand)(
                        accelerationRange[0].x,
                        accelerationRange[1].x,
                    ),
                    (0, math_1.rand)(
                        accelerationRange[0].y,
                        accelerationRange[1].y,
                    ),
                );
                var damping = (0, math_1.rand)(
                    dampingRange[0],
                    dampingRange[1],
                );
                var lt = lifetime
                    ? (0, math_1.rand)(lifetime[0], lifetime[1])
                    : null;
                var pos = this.emitter.position.add(
                    eopt.shape
                        ? eopt.shape.random()
                        : (0, math_1.vec2)(),
                );
                var p = particles[index];
                p.t = 0;
                p.lt = lt;
                p.pos = pos;
                p.vel = vel;
                p.acc = acceleration;
                p.angle = angle;
                p.angularVelocity = angularVelocity;
                p.damping = damping;
                p.gc = false;
            }
            count += n;
        },
        update: function() {
            if (emitterLifetime !== undefined && emitterLifetime <= 0) {
                return;
            }
            var DT = shared_1._k.app.dt();
            // Update all particles
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                if (p.gc) {
                    continue;
                }
                p.t += DT;
                if (p.lt !== null && p.t >= p.lt) {
                    p.gc = true;
                    count--;
                    continue;
                }
                p.vel = p.vel.add(p.acc.scale(DT)).scale(1 - p.damping * DT);
                p.pos = p.pos.add(p.vel.scale(DT));
                p.angle += p.angularVelocity * DT;
            }
            // Check if the emitter has a limited lifetime
            if (emitterLifetime !== undefined) {
                emitterLifetime -= DT;
                if (emitterLifetime <= 0) {
                    onEndEvents.trigger();
                }
            }
            // Create new particles according to accumulated time
            time += DT;
            while (
                count < popt.max && eopt.rate
                && time > 1 / eopt.rate
            ) {
                this.emit(1);
                time -= 1 / eopt.rate;
            }
        },
        draw: function() {
            if (
                (emitterLifetime !== undefined && emitterLifetime <= 0)
                || count == 0
            ) {
                return;
            }
            // Draw active particles
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                if (p.gc) {
                    attributes.opacity[i * 4] = 0;
                    attributes.opacity[i * 4 + 1] = 0;
                    attributes.opacity[i * 4 + 2] = 0;
                    attributes.opacity[i * 4 + 3] = 0;
                    continue;
                }
                var progress = p.progress;
                var colorIndex = Math.floor(progress * colors.length);
                var color = colorIndex < colors.length - 1
                    ? (0, lerp_1.lerp)(
                        colors[colorIndex],
                        colors[colorIndex + 1],
                        (0, math_1.map)(
                            progress,
                            colorIndex / colors.length,
                            (colorIndex + 1) / colors.length,
                            0,
                            1,
                        ),
                    )
                    : colors[colorIndex];
                var opacityIndex = Math.floor(progress * opacities.length);
                var opacity = opacityIndex < opacities.length - 1
                    ? (0, lerp_1.lerp)(
                        opacities[opacityIndex],
                        opacities[opacityIndex + 1],
                        (0, math_1.map)(
                            progress,
                            opacityIndex / opacities.length,
                            (opacityIndex + 1) / opacities.length,
                            0,
                            1,
                        ),
                    )
                    : opacities[opacityIndex];
                var quadIndex = Math.floor(progress * quads.length);
                var quad = quads[quadIndex];
                var scaleIndex = Math.floor(progress * scales.length);
                var scale = scales[scaleIndex];
                // TODO: lerp scale
                var angle = (0, math_1.deg2rad)(p.angle);
                var c = Math.cos(angle);
                var s = Math.sin(angle);
                var hw = popt.texture.width * quad.w / 2;
                var hh = popt.texture.height * quad.h / 2;
                var j = i * 4;
                // Left top
                attributes.pos[j * 2] = p.pos.x + (-hw) * scale * c
                    - (-hh) * scale * s;
                attributes.pos[j * 2 + 1] = p.pos.y + (-hw) * scale * s
                    + (-hh) * scale * c;
                attributes.uv[j * 2] = quad.x;
                attributes.uv[j * 2 + 1] = quad.y;
                attributes.color[j * 3] = color.r;
                attributes.color[j * 3 + 1] = color.g;
                attributes.color[j * 3 + 2] = color.b;
                attributes.opacity[j] = opacity;
                // Right top
                j++;
                attributes.pos[j * 2] = p.pos.x + hw * scale * c
                    - (-hh) * scale * s;
                attributes.pos[j * 2 + 1] = p.pos.y + hw * scale * s
                    + (-hh) * scale * c;
                attributes.uv[j * 2] = quad.x + quad.w;
                attributes.uv[j * 2 + 1] = quad.y;
                attributes.color[j * 3] = color.r;
                attributes.color[j * 3 + 1] = color.g;
                attributes.color[j * 3 + 2] = color.b;
                attributes.opacity[j] = opacity;
                // Right bottom
                j++;
                attributes.pos[j * 2] = p.pos.x + hw * scale * c
                    - hh * scale * s;
                attributes.pos[j * 2 + 1] = p.pos.y + hw * scale * s
                    + hh * scale * c;
                attributes.uv[j * 2] = quad.x + quad.w;
                attributes.uv[j * 2 + 1] = quad.y + quad.h;
                attributes.color[j * 3] = color.r;
                attributes.color[j * 3 + 1] = color.g;
                attributes.color[j * 3 + 2] = color.b;
                attributes.opacity[j] = opacity;
                // Left bottom
                j++;
                attributes.pos[j * 2] = p.pos.x + (-hw) * scale * c
                    - hh * scale * s;
                attributes.pos[j * 2 + 1] = p.pos.y + (-hw) * scale * s
                    + hh * scale * c;
                attributes.uv[j * 2] = quad.x;
                attributes.uv[j * 2 + 1] = quad.y + quad.h;
                attributes.color[j * 3] = color.r;
                attributes.color[j * 3 + 1] = color.g;
                attributes.color[j * 3 + 2] = color.b;
                attributes.opacity[j] = opacity;
            }
            (0, drawRaw_1.drawRaw)(
                attributes,
                indices,
                this.fixed,
                popt.texture,
                this.shader,
                this.uniform,
            );
        },
        onEnd: function(action) {
            return onEndEvents.add(action);
        },
        inspect: function() {
            return "count: ".concat(count, "/").concat(popt.max);
        },
    };
}

import { KEvent } from "../../../events/events";
import { drawRaw } from "../../../gfx/draw/drawRaw";
import type { Texture } from "../../../gfx/gfx";
import { Color } from "../../../math/color";
import { lerp } from "../../../math/lerp";
import {
    deg2rad,
    map,
    Quad,
    rand,
    type ShapeType,
    vec2,
} from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp } from "../../../types";

/**
 * A particle. Used on the {@link particles `particles()`} component.
 */
class Particle {
    pos: Vec2 = vec2(0);
    vel: Vec2 = vec2(0);
    acc: Vec2 = vec2(0);
    angle: number = 0;
    angularVelocity: number = 0;
    damping: number = 0;
    t: number = 0;
    lt: number | null = null;
    gc: boolean = true;

    constructor() {
    }

    get progress() {
        return this.lt ? this.t / this.lt : this.t;
    }
}

/**
 * Options for the {@link particles `particles()`}'s component.
 *
 * @group Components
 * @subgroup Component Types
 */
export type EmitterOpt = {
    /**
     * Shape of the emitter. If given, particles spawn within this shape.
     */
    shape?: ShapeType;
    /**
     * Lifetime of the emitter.
     */
    lifetime?: number;
    /**
     * Rate of emission in particles per second if the emitter should emit out of itself.
     */
    rate?: number;
    /**
     * Position (relative) of emission.
     */
    position: Vec2;
    /**
     * Direction of emission.
     */
    direction: number;
    /**
     * Spread (cone) of emission around the direction.
     */
    spread: number;
};

/**
 * Options for the {@link particles `particles()`}'s component
 *
 * @group Components
 * @subgroup Component Types
 */
export type ParticlesOpt = {
    /**
     * Maximum number of simultaneously rendered particles.
     */
    max: number;
    /**
     * Minimum and maximum lifetime of a particle in seconds.
     */
    lifeTime?: [number, number];
    /**
     * Minimum and maximum speed of a particle in pixels per second.
     */
    speed?: [number, number];
    /**
     * Minimum and maximum acceleration of a particle in pixels per second^2.
     */
    acceleration?: [Vec2, Vec2];
    /**
     * Minimum and maximum damping of a particle.
     */
    damping?: [number, number];
    /**
     * Minimum and maximum start angle of a particle.
     */
    angle?: [number, number];
    /**
     * Minimum and maximum angular velocity of a particle.
     */
    angularVelocity?: [number, number];
    /**
     * Scale from start to end for a particle.
     */
    scales?: number[] | Vec2[];
    /**
     * Colors from start to end for a particle.
     */
    colors?: Color[];
    /**
     * Opacity from start to end for a particle.
     */
    opacities?: number[];
    /**
     * Quads from start to end for a particle.
     */
    quads?: Quad[];
    /**
     * Texture used for the particle.
     */
    texture: Texture;
};

/**
 * The {@link particles `particles()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface ParticlesComp extends Comp {
    emitter: {
        /**
         * Relative position of the emitter
         */
        position: Vec2;
        /**
         * Relative direction of the emitter
         */
        direction: number;
    };
    /**
     * Emit a number of particles
     */
    emit(n: number): void;
    /**
     * Called when the emitter expires
     */
    onEnd(cb: () => void): void;
}

export function particles(popt: ParticlesOpt, eopt: EmitterOpt): ParticlesComp {
    let emitterLifetime = eopt.lifetime;

    const particles: Particle[] = new Array<Particle>(popt.max);
    const colors = popt.colors || [Color.WHITE];
    const opacities = popt.opacities || [1];
    const quads = popt.quads || [new Quad(0, 0, 1, 1)];
    const scales = popt.scales ? popt.scales.map(s => vec2(s)) : [vec2(1)];
    const lifetime = popt.lifeTime;
    const spread = eopt.spread || 0;
    const speed = popt.speed || [0, 0];
    const angleRange = popt.angle || [0, 0];
    const angularVelocityRange = popt.angularVelocity || [0, 0];
    const accelerationRange = popt.acceleration || [vec2(0), vec2(0)];
    const dampingRange = popt.damping || [0, 0];

    const indices: number[] = new Array<number>(popt.max * 6);
    const attributes = {
        pos: new Array<number>(popt.max * 4 * 2),
        uv: new Array<number>(popt.max * 4 * 2),
        color: new Array<number>(popt.max * 4 * 3),
        opacity: new Array<number>(popt.max * 4),
    };
    let count = 0;
    let time = 0;

    for (let i = 0; i < popt.max; i++) {
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

    const onEndEvents = new KEvent();

    function nextFree(index: number = 0): number | null {
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
            position: eopt.position || vec2(),
            direction: eopt.direction || 0,
        },
        emit(n: number) {
            n = Math.min(n, popt.max - count);
            let index: number | null = 0;
            for (let i = 0; i < n; i++) {
                index = nextFree(index);
                if (index == null) return;

                const velocityAngle = rand(
                    this.emitter.direction - spread,
                    this.emitter.direction + spread,
                );
                const vel = Vec2.fromAngle(velocityAngle).scale(
                    rand(speed[0], speed[1]),
                );
                const angle = rand(angleRange[0], angleRange[1]);
                const angularVelocity = rand(
                    angularVelocityRange[0],
                    angularVelocityRange[1],
                );
                const acceleration = vec2(
                    rand(accelerationRange[0].x, accelerationRange[1].x),
                    rand(accelerationRange[0].y, accelerationRange[1].y),
                );
                const damping = rand(
                    dampingRange[0],
                    dampingRange[1],
                );
                const lt = lifetime ? rand(lifetime[0], lifetime[1]) : null;
                const pos = this.emitter.position.add(
                    eopt.shape
                        ? eopt.shape.random()
                        : vec2(),
                );

                const p = particles[index];
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
        update() {
            if (emitterLifetime !== undefined && emitterLifetime <= 0) {
                return;
            }

            const DT = _k.app.dt();
            // Update all particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
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
        draw() {
            if (
                (emitterLifetime !== undefined && emitterLifetime <= 0)
                || count == 0
            ) {
                return;
            }

            // Draw active particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.gc) {
                    attributes.opacity[i * 4] = 0;
                    attributes.opacity[i * 4 + 1] = 0;
                    attributes.opacity[i * 4 + 2] = 0;
                    attributes.opacity[i * 4 + 3] = 0;
                    continue;
                }
                const progress = p.progress;
                const colorIndex = Math.floor(progress * colors.length);
                const color = colorIndex < colors.length - 1
                    ? lerp(
                        colors[colorIndex],
                        colors[colorIndex + 1],
                        map(
                            progress,
                            colorIndex / colors.length,
                            (colorIndex + 1) / colors.length,
                            0,
                            1,
                        ),
                    )
                    : colors[colorIndex];
                const opacityIndex = Math.floor(progress * opacities.length);
                const opacity = opacityIndex < opacities.length - 1
                    ? lerp(
                        opacities[opacityIndex],
                        opacities[opacityIndex + 1],
                        map(
                            progress,
                            opacityIndex / opacities.length,
                            (opacityIndex + 1) / opacities.length,
                            0,
                            1,
                        ),
                    )
                    : opacities[opacityIndex];

                const quadIndex = Math.floor(progress * quads.length);
                const quad = quads[quadIndex];
                const scaleIndex = Math.floor(progress * scales.length);
                const scale = scales[scaleIndex];
                // TODO: lerp scale
                const angle = deg2rad(p.angle);
                const c = Math.cos(angle);
                const s = Math.sin(angle);

                const hw = popt.texture.width * quad.w / 2;
                const hh = popt.texture.height * quad.h / 2;

                let j = i * 4;
                // Left top
                attributes.pos[j * 2] = p.pos.x + (-hw) * scale.x * c
                    - (-hh) * scale.y * s;
                attributes.pos[j * 2 + 1] = p.pos.y + (-hw) * scale.x * s
                    + (-hh) * scale.y * c;
                attributes.uv[j * 2] = quad.x;
                attributes.uv[j * 2 + 1] = quad.y;
                attributes.color[j * 3] = color.r;
                attributes.color[j * 3 + 1] = color.g;
                attributes.color[j * 3 + 2] = color.b;
                attributes.opacity[j] = opacity;
                // Right top
                j++;
                attributes.pos[j * 2] = p.pos.x + hw * scale.x * c
                    - (-hh) * scale.y * s;
                attributes.pos[j * 2 + 1] = p.pos.y + hw * scale.x * s
                    + (-hh) * scale.y * c;
                attributes.uv[j * 2] = quad.x + quad.w;
                attributes.uv[j * 2 + 1] = quad.y;
                attributes.color[j * 3] = color.r;
                attributes.color[j * 3 + 1] = color.g;
                attributes.color[j * 3 + 2] = color.b;
                attributes.opacity[j] = opacity;
                // Right bottom
                j++;
                attributes.pos[j * 2] = p.pos.x + hw * scale.x * c
                    - hh * scale.y * s;
                attributes.pos[j * 2 + 1] = p.pos.y + hw * scale.x * s
                    + hh * scale.y * c;
                attributes.uv[j * 2] = quad.x + quad.w;
                attributes.uv[j * 2 + 1] = quad.y + quad.h;
                attributes.color[j * 3] = color.r;
                attributes.color[j * 3 + 1] = color.g;
                attributes.color[j * 3 + 2] = color.b;
                attributes.opacity[j] = opacity;
                // Left bottom
                j++;
                attributes.pos[j * 2] = p.pos.x + (-hw) * scale.x * c
                    - hh * scale.y * s;
                attributes.pos[j * 2 + 1] = p.pos.y + (-hw) * scale.x * s
                    + hh * scale.y * c;
                attributes.uv[j * 2] = quad.x;
                attributes.uv[j * 2 + 1] = quad.y + quad.h;
                attributes.color[j * 3] = color.r;
                attributes.color[j * 3 + 1] = color.g;
                attributes.color[j * 3 + 2] = color.b;
                attributes.opacity[j] = opacity;
            }

            drawRaw(
                attributes,
                indices,
                (this as any).fixed,
                popt.texture,
                (this as any).shader,
                (this as any).uniform,
            );
        },
        onEnd(action: () => void) {
            return onEndEvents.add(action);
        },
        inspect() {
            return `count: ${count}/${popt.max}`;
        },
    };
}

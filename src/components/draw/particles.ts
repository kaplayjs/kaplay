import type { Texture } from "../../gfx";
import { getKaboomContext } from "../../kaboom";
import { Color, lerp, map, Quad, Vec2, vec2 } from "../../math";
import type { Comp, ShapeType, Vertex } from "../../types";
import { KEvent } from "../../utils";

class Particle {
    pos: Vec2;
    vel: Vec2;
    acc: Vec2;
    angle: number;
    angularVelocity: number;
    damping: number;
    t: number;
    lt: number | null;
    gc: boolean;

    constructor() {
        this.t = 0;
        this.gc = true;
    }

    get progress() {
        return this.lt ? this.t / this.lt : this.t;
    }
}

export type EmitterOpt = {
    /*
     * Shape of the emitter. If given, particles spwan within this shape.
     */
    shape?: ShapeType;
    /*
     * Lifetime of the emitter.
     */
    lifetime?: number;
    /*
     * Rate of emission in particles per second if the emitter should emit out of itself.
     */
    rate?: number;
    /*
     * Direction of emission.
     */
    direction: number;
    /*
     * Spread (cone) of emission around the direction.
     */
    spread: number;
};

export type ParticlesOpt = {
    /*
     * Maximum number of simultaneously rendered particles.
     */
    max: number;
    /*
     * Minimum and maximum lifetime of a particle in seconds.
     */
    lifeTime?: [number, number];
    /*
     * Minimum and maximum speed of a particle in pixels per second.
     */
    speed?: [number, number];
    /*
     * Minimum and maximum acceleration of a particle in pixels per second^2.
     */
    acceleration?: [Vec2, Vec2];
    /*
     * Minimum and maximum damping of a particle.
     */
    damping?: [number, number];
    /*
     * Minimum and maximum start angle of a particle.
     */
    angle?: [number, number];
    /*
     * Minimum and maximum angular velocity of a particle.
     */
    angularVelocity?: [number, number];
    /*
     * Scale from start to end for a particle.
     */
    scales?: number[];
    /*
     * Colors from start to end for a particle.
     */
    colors?: Color[];
    /*
     * Opacity from start to end for a particle.
     */
    opacities?: number[];
    /*
     * Quads from start to end for a particle.
     */
    quads?: Quad[];
    /*
     * Texture used for the particle.
     */
    texture?: Texture;
};

export interface ParticlesComp extends Comp {
    /*
     * Emit a number of particles
     */
    emit(n: number): void;
    /*
     * Called when the emitter expires
     */
    onEnd(cb: () => void): void;
}

export function particles(popt: ParticlesOpt, eopt: EmitterOpt): ParticlesComp {
    const k = getKaboomContext(this);

    let emitterLifetime = eopt.lifetime;

    const particles: Particle[] = [];
    const colors = popt.colors || [k.WHITE];
    const opacities = popt.opacities || [1];
    const quads = popt.quads || [new Quad(0, 0, 1, 1)];
    const scales = popt.scales || [1];
    const lifetime = popt.lifeTime;
    const direction = eopt.direction;
    const spread = eopt.spread;
    const speed = popt.speed || [0, 0];
    const angleRange = popt.angle || [0, 0];
    const angularVelocityRange = popt.angularVelocity || [0, 0];
    const accelerationRange = popt.acceleration || [vec2(0), vec2(0)];
    const dampingRange = popt.damping || [0, 0];

    const indices: number[] = [];
    const vertices: Vertex[] = new Array<Vertex>(popt.max);
    let count = 0;
    let time = 0;

    for (let i = 0; i < popt.max; i++) {
        indices[i * 6 + 0] = i * 4 + 0;
        indices[i * 6 + 1] = i * 4 + 1;
        indices[i * 6 + 2] = i * 4 + 3;
        indices[i * 6 + 3] = i * 4 + 1;
        indices[i * 6 + 4] = i * 4 + 2;
        indices[i * 6 + 5] = i * 4 + 3;

        for (let j = 0; j < 4; j++) {
            vertices[i * 4 + j] = {
                pos: new Vec2(0, 0),
                uv: new Vec2(0, 0),
                color: k.rgb(255, 255, 255),
                opacity: 1,
            };
        }
        particles[i] = new Particle()
    }

    const onEndEvents = new KEvent();

    function nextFree(index: number = 0): number | null {
        while (index < popt.max) {
            if (particles[index].gc) {
                return index
            }
            index++
        }
        return null
    }

    return {
        id: "particles",
        emit(n: number) {
            let index = 0
            for (let i = 0; i < n; i++) {
                index = nextFree(index)
                if (index == null) { return }

                const velocityAngle = k.rand(
                    direction - spread,
                    direction + spread,
                );
                const vel = Vec2.fromAngle(velocityAngle).scale(
                    k.rand(speed[0], speed[1]),
                );
                const angle = k.rand(angleRange[0], angleRange[1]);
                const angularVelocity = k.rand(
                    angularVelocityRange[0],
                    angularVelocityRange[1],
                );
                const acceleration = vec2(
                    k.rand(accelerationRange[0].x, accelerationRange[1].x),
                    k.rand(accelerationRange[0].y, accelerationRange[1].y)
                );
                const damping = k.rand(
                    dampingRange[0],
                    dampingRange[1],
                );
                const lt = lifetime ? k.rand(lifetime[0], lifetime[1]) : null;
                const pos = eopt.shape
                    ? eopt.shape.random()
                    : vec2();

                const p = particles[index]
                p.lt = lt
                p.pos = pos
                p.vel = vel
                p.acc = acceleration
                p.angle = angle
                p.angularVelocity = angularVelocity
                p.damping = damping
                p.angularVelocity = angularVelocity
                p.gc = false
            }
            count += n;
        },
        update() {
            if (eopt.lifetime <= 0) {
                return;
            }
            const DT = k.dt();
            // Update all particles
            for (const p of particles) {
                if (p.gc) {
                    continue;
                }
                p.t += DT;
                if (p.lt && p.t >= p.lt) {
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
                && time > eopt.rate
            ) {
                this.emit(1);
                count++;
                time -= eopt.rate;
            }
        },
        draw() {
            if (emitterLifetime <= 0) {
                return;
            }

            // Draw active particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.gc) {
                    continue;
                }
                const progress = p.progress;
                const colorIndex = Math.floor(p.progress * colors.length);
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
                const opacityIndex = Math.floor(p.progress * opacities.length);
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

                const quadIndex = Math.floor(p.progress * quads.length);
                const quad = quads[quadIndex];
                const scaleIndex = Math.floor(p.progress * scales.length);
                const scale = scales[scaleIndex];
                const c = Math.cos(p.angle * Math.PI / 180);
                const s = Math.sin(p.angle * Math.PI / 180);

                const hw = (popt.texture ? popt.texture.width : 10) * quad.w / 2;
                const hh = (popt.texture ? popt.texture.height : 10) * quad.h / 2;

                let j = i * 4;
                // Left top
                let v = vertices[j];
                v.pos.x = p.pos.x + (-hw) * scale * c - (-hh) * scale * s;
                v.pos.y = p.pos.y + (-hw) * scale * s + (-hh) * scale * c;
                v.uv.x = quad.x;
                v.uv.y = quad.y;
                v.color.r = color.r;
                v.color.g = color.g;
                v.color.b = color.b;
                v.opacity = opacity;
                // Right top
                v = vertices[j + 1];
                v.pos.x = p.pos.x + hw * scale * c - (-hh) * scale * s;
                v.pos.y = p.pos.y + hw * scale * s + (-hh) * scale * c;
                v.uv.x = quad.x + quad.w;
                v.uv.y = quad.y;
                v.color.r = color.r;
                v.color.g = color.g;
                v.color.b = color.b;
                v.opacity = opacity;
                // Right bottom
                v = vertices[j + 2];
                v.pos.x = p.pos.x + hw * scale * c - hh * scale * s;
                v.pos.y = p.pos.y + hw * scale * s + hh * scale * c;
                v.uv.x = quad.x + quad.w;
                v.uv.y = quad.y + quad.h;
                v.color.r = color.r;
                v.color.g = color.g;
                v.color.b = color.b;
                v.opacity = opacity;
                // Left bottom
                v = vertices[j + 3];
                v.pos.x = p.pos.x + (-hw) * scale * c - hh * scale * s;
                v.pos.y = p.pos.y + (-hw) * scale * s + hh * scale * c;
                v.uv.x = quad.x;
                v.uv.y = quad.y + quad.h;
                v.color.r = color.r;
                v.color.g = color.g;
                v.color.b = color.b;
                v.opacity = opacity;
            }

            k._k.drawRaw(
                vertices,
                indices,
                this.fixed,
                popt.texture,
                this.shader,
                this.uniform,
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

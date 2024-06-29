import type { Texture } from "../../gfx";
import { getKaboomContext } from "../../kaboom";
import { Color, lerp, map, Quad, Vec2, vec2 } from "../../math";
import type { Comp, ShapeType, Vertex } from "../../types";
import { KEvent } from "../../utils";

class Particle {
    pos: Vec2;
    vel: Vec2;
    angle: number;
    angularVelocity: number;
    t: number;
    lt: number | null;
    gc: boolean;

    constructor(
        lt: number,
        pos: Vec2,
        vel: Vec2,
        angle: number,
        angularVelocity: number,
    ) {
        this.pos = pos.clone();
        this.vel = vel;
        this.angle = angle;
        this.angularVelocity = angularVelocity;
        this.t = 0;
        this.lt = lt;
        this.gc = false;
    }

    get progress() {
        return this.lt ? this.t / this.lt : this.t;
    }
}

export type EmitterOpt = {
    shape?: ShapeType;
    lifetime?: number;
    rate: number;
    direction: number;
    spread: number;
};

export type ParticlesOpt = {
    max: number;
    lifeTime?: [number, number];
    speed?: [number, number];
    angle?: [number, number];
    angularVelocity?: [number, number];
    colors?: Color[];
    opacities?: number[];
    quads?: Quad[];
    texture?: Texture;
};

export interface ParticlesComp extends Comp {
    emit(n: number): void;
    onEnd(cb: () => void): void;
}

export function particles(popt: ParticlesOpt, eopt: EmitterOpt): ParticlesComp {
    const k = getKaboomContext(this);

    let emitterLifetime = eopt.lifetime;

    const particles: Particle[] = [];
    const colors = popt.colors || [k.WHITE];
    const opacities = popt.opacities || [1];
    const quads = popt.quads || [new Quad(0, 0, 1, 1)];
    const lifetime = popt.lifeTime;
    const direction = eopt.direction;
    const spread = eopt.spread;
    const speed = popt.speed || [0, 0];
    const angleRange = popt.angle || [0, 0];
    const angularVelocityRange = popt.angularVelocity || [0, 0];
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
    }

    const onEndEvents = new KEvent();

    return {
        id: "particles",
        emit(n: number) {
            for (let i = 0; i < n; i++) {
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
                const lt = lifetime ? k.rand(lifetime[0], lifetime[1]) : null;
                const pos = eopt.shape
                    ? eopt.shape.random()
                    : vec2();
                particles.push(
                    new Particle(lt, pos, vel, angle, angularVelocity),
                );
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

                const scale = 1;
                const c = Math.cos(p.angle * Math.PI / 180);
                const s = Math.sin(p.angle * Math.PI / 180);

                const hw = 10 / 2;
                const hh = 10 / 2;

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

import type { Texture } from "../../gfx";
import { getKaboomContext } from "../../kaboom";
import { Color, lerp, map, Quad, Vec2, vec2 } from "../../math";
import type { Comp, ShapeType } from "../../types";
import { Event } from "../../utils";

class Particle {
    pos: Vec2;
    vel: Vec2;
    t: number;
    lt: number;
    gc: boolean;

    constructor(lt: number, pos: Vec2, vel?: Vec2) {
        this.pos = pos.clone();
        this.vel = vel || vec2();
        this.t = 0;
        this.lt = lt;
        this.gc = false;
    }

    get progress() {
        return this.t / this.lt;
    }
}

export type ParticlesOpt = {
    maxParticles: number;
    emitterShape?: ShapeType;
    emitterLifetime?: number;
    emissionRate: number;
    emissionDirection: number;
    emissionSpread: number;
    particleLifeTime: [number, number];
    particleSpeed: [number, number];
    particleColors?: Color[];
    particleOpacities?: number[];
    particleQuads?: Quad[];
    particleTexture?: Texture;
};

export interface ParticlesComp extends Comp {
    emit(n: number): void;
    onEnd(cb: () => void): void;
}

export function particles(opt: ParticlesOpt): ParticlesComp {
    const k = getKaboomContext(this);

    let emitterLifetime = opt.emitterLifetime;

    const particles: Particle[] = [];
    const colors = opt.particleColors || [k.WHITE];
    const opacities = opt.particleOpacities || [1];
    const quads = opt.particleQuads;
    const lifetime = opt.particleLifeTime;
    const direction = opt.emissionDirection;
    const spread = opt.emissionSpread;
    const speed = opt.particleSpeed;
    const indices: number[] = [];
    let count = 0;
    let time = 0;

    const onEndEvents = new Event();

    return {
        id: "particles",
        emit(n: number) {
            for (let i = 0; i < n; i++) {
                const angle = k.rand(direction - spread, direction + spread);
                const vel = Vec2.fromAngle(angle).scale(
                    k.rand(speed[0], speed[1]),
                );
                const lt = k.rand(lifetime[0], lifetime[1]);
                console.log(opt.emitterShape);
                const pos = opt.emitterShape
                    ? opt.emitterShape.random()
                    : vec2();
                particles.push(new Particle(lt, pos, vel));
            }
            count += n;
        },
        update() {
            if (emitterLifetime <= 0) {
                return;
            }
            const DT = k.dt();
            // Update all particles
            for (const p of particles) {
                if (p.gc) {
                    continue;
                }
                p.t += DT;
                if (p.t >= p.lt) {
                    p.gc = true;
                    count--;
                    continue;
                }
                p.pos = p.pos.add(p.vel.scale(DT));
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
                count < opt.maxParticles && opt.emissionRate
                && time > opt.emissionRate
            ) {
                const angle = k.rand(direction - spread, direction + spread);
                const vel = Vec2.fromAngle(angle).scale(
                    k.rand(speed[0], speed[1]),
                );
                const lt = k.rand(lifetime[0], lifetime[1]);
                const pos = opt.emitterShape
                    ? opt.emitterShape.random()
                    : vec2();
                particles.push(new Particle(lt, pos, vel));
                count++;
                time -= opt.emissionRate;
            }
        },
        draw() {
            if (emitterLifetime <= 0) {
                return;
            }
            // Draw active particles
            for (const p of particles) {
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
                if (opt.particleTexture && quads) {
                    const quadIndex = Math.floor(p.progress * quads.length);
                    const quad = quads[quadIndex];
                    k.drawUVQuad(
                        {
                            pos: p.pos,
                            width: quad.w * opt.particleTexture.width,
                            height: quad.h * opt.particleTexture.height,
                            tex: opt.particleTexture,
                            quad: quad,
                            color: color,
                            opacity: opacity,
                        },
                    );
                } else {
                    k.drawRect({
                        pos: p.pos,
                        width: 2,
                        height: 2,
                        color: color,
                        opacity: opacity,
                    });
                }
            }
        },
        onEnd(action: () => void) {
            return onEndEvents.add(action);
        },
        inspect() {
            return `count: ${count}/${opt.maxParticles}`;
        },
    };
}

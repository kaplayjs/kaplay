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

export type EmitterOpt = {
    shape?: ShapeType;
    lifetime?: number;
    rate: number;
    direction: number;
    spread: number;
};

export type ParticlesOpt = {
    max: number;
    lifeTime: [number, number];
    speed: [number, number];
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
    const quads = popt.quads;
    const lifetime = popt.lifeTime;
    const direction = eopt.direction;
    const spread = eopt.spread;
    const speed = popt.speed;
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
                const pos = eopt.shape
                    ? eopt.shape.random()
                    : vec2();
                particles.push(new Particle(lt, pos, vel));
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
                count < popt.max && eopt.rate
                && time > eopt.rate
            ) {
                this.emit(1)
                count++;
                time -= eopt.rate;
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
                if (popt.texture && quads) {
                    const quadIndex = Math.floor(p.progress * quads.length);
                    const quad = quads[quadIndex];
                    k.drawUVQuad(
                        {
                            pos: p.pos,
                            width: quad.w * popt.texture.width,
                            height: quad.h * popt.texture.height,
                            tex: popt.texture,
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
            return `count: ${count}/${popt.max}`;
        },
    };
}

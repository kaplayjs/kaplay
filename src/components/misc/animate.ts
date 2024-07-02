import easings from "../../easings";
import { getKaboomContext } from "../../kaboom";
import { Color, easingLinear, lerp, Vec2 } from "../../math";
import type { Comp, EaseFunc, GameObj, LerpValue } from "../../types";

type AnimateEndBehavior =
    /* Go directly back to the start */
    | "loop"
    /* Animate in reverse when reaching the end */
    | "ping-pong"
    /* Stop */
    | "stop";

type Interpolation =
    /* Linear interpolation */
    | "linear"
    /* Spline interpolation */
    | "spline";

export interface AnimateOpt {
    /**
     * Duration of the animation in seconds
     */
    duration: number;
    /**
     * Behavior when reaching the end of the animation. Default is stop.
     */
    endBehavior?: AnimateEndBehavior;
    /**
     * Easing function. Default is linear time.
     */
    easing?: EaseFunc;
    /**
     * Interpolation function. Default is linear interpolation.
     */
    interpolation?: Interpolation;
}

export interface AnimateComp extends Comp {
    /**
     * Animates a property on this object.
     * @param name Name of the property to animate.
     * @param keys Keys determining the value at a certain point in time.
     * @param times Timestamps in percent for the given keys, if omitted, keys are equally spaced.
     * @param opts Options.
     */
    animate<T extends LerpValue>(
        name: string,
        keys: T[],
        times: number[] | null,
        opts: AnimateOpt,
    ): void;
    /**
     * Removes the animation from the given property.
     * @param name Name of the property to remove the animation from.
     */
    unanimate(name: string): void;
}

class AnimateChannel {
    name: string;
    duration: number;
    endBehavior: AnimateEndBehavior;
    easing: EaseFunc;
    constructor(name: string, opts: AnimateOpt) {
        this.name = name;
        this.duration = opts.duration;
        this.endBehavior = opts.endBehavior || "stop";
        this.easing = opts.easing || easings.linear;
    }

    update(obj: GameObj<any>, t: number) {
    }

    /**
     * Returns the first key index for the given time, as well as the relative time towards the second key.
     * @param t The time in seconds.
     * @param timing The optional timestamps in percent.
     * @returns The first key index for the given time, as well as the relative time towards the second key.
     */
    getLowerKeyIndexAndRelativeTime(
        t: number,
        count: number,
        timing: number[] | null,
    ): [number, number] {
        const maxIndex = count - 1;
        if (t >= this.duration && this.endBehavior == "stop") {
            return [maxIndex, 0];
        }
        let p = t / this.duration;
        const m = Math.trunc(p);
        p -= m;
        if (this.endBehavior == "ping-pong" && (m & 1)) {
            p = 1 - p;
        }
        if (timing) {
            let index = 0;
            while (timing[index + 1] !== undefined && timing[index + 1] < p) {
                index++;
            }
            if (index >= maxIndex) {
                return [maxIndex, 0];
            }
            return [
                index,
                (p - timing[index]) / (timing[index + 1] - timing[index]),
            ];
        } else {
            const index = Math.floor((count - 1) * p);
            return [index, (p - index / maxIndex) * maxIndex];
        }
    }
}

class AnimateChannelNumber extends AnimateChannel {
    keys: number[];
    timing: number[] | null;
    constructor(
        name: string,
        keys: number[],
        timing: number[] | null,
        opts: AnimateOpt,
    ) {
        super(name, opts);
        this.keys = keys;
        this.timing = timing;
    }

    update(obj: GameObj<any>, t: number): void {
        const [index, alpha] = this.getLowerKeyIndexAndRelativeTime(
            t,
            this.keys.length,
            this.timing,
        );
        if (alpha == 0) {
            obj[this.name] = this.keys[index];
        } else {
            obj[this.name] = lerp(
                this.keys[index],
                this.keys[index + 1],
                this.easing(alpha),
            );
        }
    }
}

class AnimateChannelVec2 extends AnimateChannel {
    keys: Vec2[];
    timing: number[] | null;
    constructor(
        name: string,
        keys: Vec2[],
        timing: number[] | null,
        opts: AnimateOpt,
    ) {
        super(name, opts);
        this.keys = keys;
        this.timing = timing;
    }

    update(obj: GameObj<any>, t: number): void {
        const [index, alpha] = this.getLowerKeyIndexAndRelativeTime(
            t,
            this.keys.length,
            this.timing,
        );
        if (alpha == 0) {
            obj[this.name] = this.keys[index];
        } else {
            obj[this.name] = this.keys[index].lerp(
                this.keys[index + 1],
                this.easing(alpha),
            );
        }
    }
}

class AnimateChannelColor extends AnimateChannel {
    keys: Color[];
    timing: number[] | null;
    constructor(
        name: string,
        keys: Color[],
        timing: number[] | null,
        opts: AnimateOpt,
    ) {
        super(name, opts);
        this.keys = keys;
        this.timing = timing;
    }

    update(obj: GameObj<any>, t: number): void {
        const [index, alpha] = this.getLowerKeyIndexAndRelativeTime(
            t,
            this.keys.length,
            this.timing,
        );
        if (alpha == 0) {
            obj[this.name] = this.keys[index];
        } else {
            obj[this.name] = this.keys[index].lerp(
                this.keys[index + 1],
                this.easing(alpha),
            );
        }
    }
}

export function animate(): AnimateComp {
    const k = getKaboomContext(this);
    const channels: AnimateChannel[] = [];
    let t = 0;
    return {
        update() {
            t += k.dt();
            for (const c of channels) {
                c.update(this, t);
            }
        },
        animate<T extends LerpValue>(
            name: string,
            keys: T[],
            times: number[] | null,
            opts: AnimateOpt,
        ) {
            if (typeof keys[0]) {
                channels.push(
                    new AnimateChannelNumber(
                        name,
                        keys as number[],
                        times,
                        opts,
                    ),
                );
            } else if (keys[0] instanceof Vec2) {
                channels.push(
                    new AnimateChannelVec2(name, keys as Vec2[], times, opts),
                );
            } else if (keys[0] instanceof Color) {
                channels.push(
                    new AnimateChannelColor(name, keys as Color[], times, opts),
                );
            }
        },
        unanimate(name: string) {
            const index = channels.findIndex(c => c.name === name);
            if (index >= 0) {
                channels.splice(index, 1);
            }
        },
    };
}

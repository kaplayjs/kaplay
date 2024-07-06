import { getKaboomContext } from "../../kaboom";
import { Color, evaluateCatmullRom, lerp, Vec2 } from "../../math";
import easings from "../../math/easings";
import type {
    Comp,
    EaseFunc,
    GameObj,
    KEventController,
    LerpValue,
} from "../../types";

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
    /**
     * Timestamps in percent for the given keys, if omitted, keys are equally spaced.
     */
    timing?: number[];
    /**
     * Easings for the given keys, if omitted, easing is used.
     */
    easings?: EaseFunc[];
}

export interface AnimateComp extends Comp {
    /**
     * Animates a property on this object.
     * @param name Name of the property to animate.
     * @param keys Keys determining the value at a certain point in time.
     * @param opts Options.
     */
    animate<T extends LerpValue>(
        name: string,
        keys: T[],
        opts: AnimateOpt,
    ): void;
    /**
     * Removes the animation from the given property.
     * @param name Name of the property to remove the animation from.
     */
    unanimate(name: string): void;
    /**
     * Removes the animations from all properties
     */
    unanimateAll(): void;
    /**
     * Attaches an event handler which is called when all the animation channels have finished.
     * @param cb The event handler called when the animation finishes.
     */
    onAnimateFinished(cb: () => void): KEventController;
    /**
     * Attaches an event handler which is called when an animation channels has finished.
     * @param cb The event handler called when an animation channel finishes.
     */
    onAnimateChannelFinished(cb: (name: string) => void): KEventController;
}

class AnimateChannel {
    name: string;
    duration: number;
    endBehavior: AnimateEndBehavior;
    easing: EaseFunc;
    interpolation: Interpolation;
    isFinished: boolean;
    timing: number[] | null;
    easings: EaseFunc[] | null;
    constructor(name: string, opts: AnimateOpt) {
        this.name = name;
        this.duration = opts.duration;
        this.endBehavior = opts.endBehavior || "stop";
        this.easing = opts.easing || easings.linear;
        this.interpolation = opts.interpolation || "linear";
        this.isFinished = false;
        this.timing = opts.timing;
        this.easings = opts.easings;
    }

    update(obj: GameObj<any>, t: number): boolean {
        return true;
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

function reflect(a: Vec2, b: Vec2) {
    return b.add(b.sub(a));
}

class AnimateChannelNumber extends AnimateChannel {
    keys: number[];
    constructor(
        name: string,
        keys: number[],
        opts: AnimateOpt,
    ) {
        super(name, opts);
        this.keys = keys;
    }

    update(obj: GameObj<any>, t: number): boolean {
        const [index, alpha] = this.getLowerKeyIndexAndRelativeTime(
            t,
            this.keys.length,
            this.timing,
        );
        if (alpha == 0) {
            obj[this.name] = this.keys[index];
        } else {
            const easing = this.easings ? this.easings[index] : this.easing;
            obj[this.name] = lerp(
                this.keys[index],
                this.keys[index + 1],
                easing(alpha),
            );
        }
        return alpha == 1;
    }
}

class AnimateChannelVec2 extends AnimateChannel {
    keys: Vec2[];
    constructor(
        name: string,
        keys: Vec2[],
        opts: AnimateOpt,
    ) {
        super(name, opts);
        this.keys = keys;
    }

    update(obj: GameObj<any>, t: number): boolean {
        const [index, alpha] = this.getLowerKeyIndexAndRelativeTime(
            t,
            this.keys.length,
            this.timing,
        );
        if (alpha == 0) {
            obj[this.name] = this.keys[index];
        } else {
            const easing = this.easings ? this.easings[index] : this.easing;
            if (this.interpolation === "linear") {
                obj[this.name] = this.keys[index].lerp(
                    this.keys[index + 1],
                    easing(alpha),
                );
            } else {
                const prevKey = this.keys[index];
                const nextIndex = index + 1;
                const nextKey = this.keys[nextIndex];
                const prevPrevKey = index > 0
                    ? this.keys[index - 1]
                    : reflect(nextKey, prevKey);
                const nextNextKey = nextIndex < this.keys.length - 1
                    ? this.keys[nextIndex + 1]
                    : reflect(prevKey, nextKey);
                obj[this.name] = evaluateCatmullRom(
                    prevPrevKey,
                    prevKey,
                    nextKey,
                    nextNextKey,
                    easing(alpha),
                );
            }
        }
        return alpha == 1;
    }
}

class AnimateChannelColor extends AnimateChannel {
    keys: Color[];
    constructor(
        name: string,
        keys: Color[],
        opts: AnimateOpt,
    ) {
        super(name, opts);
        this.keys = keys;
    }

    update(obj: GameObj<any>, t: number): boolean {
        const [index, alpha] = this.getLowerKeyIndexAndRelativeTime(
            t,
            this.keys.length,
            this.timing,
        );
        if (alpha == 0) {
            obj[this.name] = this.keys[index];
        } else {
            const easing = this.easings ? this.easings[index] : this.easing;
            obj[this.name] = this.keys[index].lerp(
                this.keys[index + 1],
                easing(alpha),
            );
        }
        return alpha == 1;
    }
}

export function animate(): AnimateComp {
    const k = getKaboomContext(this);
    const channels: AnimateChannel[] = [];
    let t = 0;
    let isFinished = false;
    return {
        update() {
            let allFinished: boolean = true;
            let localFinished: boolean;
            t += k.dt();
            for (const c of channels) {
                localFinished = c.update(this, t);
                if (localFinished && !c.isFinished) {
                    c.isFinished = true;
                    this.trigger("animate-channel-finished", c.name);
                }
                allFinished &&= localFinished;
            }
            if (allFinished && !isFinished) {
                isFinished = true;
                this.trigger("animate-finished");
            }
        },
        animate<T extends LerpValue>(
            name: string,
            keys: T[],
            opts: AnimateOpt,
        ) {
            isFinished = false;
            this.unanimate(name);
            if (typeof keys[0] === "number") {
                channels.push(
                    new AnimateChannelNumber(
                        name,
                        keys as number[],
                        opts,
                    ),
                );
            } else if (keys[0] instanceof Vec2) {
                channels.push(
                    new AnimateChannelVec2(name, keys as Vec2[], opts),
                );
            } else if (keys[0] instanceof Color) {
                channels.push(
                    new AnimateChannelColor(name, keys as Color[], opts),
                );
            }
        },
        unanimate(name: string) {
            const index = channels.findIndex(c => c.name === name);
            if (index >= 0) {
                channels.splice(index, 1);
            }
        },
        unanimateAll() {
            channels.splice(0, channels.length);
        },
        onAnimateFinished(cb: () => void) {
            return this.on("animate-finished", cb);
        },
        onAnimateChannelFinished(cb: (name: string) => void) {
            return this.on("animate-channel-finished", cb);
        },
    };
}

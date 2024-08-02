import { dt } from "../../app";
import { Color } from "../../math/color";
import easings from "../../math/easings";
import {
    catmullRom,
    easingLinear,
    hermiteFirstDerivative,
    lerp,
    Vec2,
    vec2,
} from "../../math/math";
import type { Comp, EaseFunc, GameObj, LerpValue } from "../../types";
import type { KEventController } from "../../utils";
import type { NamedComp } from "./named";

type TimeDirection =
    /* Animate forward */
    | "forward"
    /* Animate in reverse */
    | "reverse"
    /* Alternate animating forward and reverse */
    | "ping-pong";

type Interpolation =
    /* No interpolation */
    | "none"
    /* Linear interpolation */
    | "linear"
    /* Spherical linear interpolation */
    | "slerp"
    /* Spline interpolation */
    | "spline";

export interface AnimateOpt {
    /**
     * Duration of the animation in seconds
     */
    duration: number;
    /**
     * Loops, Default is undefined aka infinite
     */
    loops?: number;
    /**
     * Behavior when reaching the end of the animation. Default is forward.
     */
    direction?: TimeDirection;
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

export interface AnimateCompOpt {
    /**
     * Changes the angle so it follows the motion, requires the rotate component
     */
    followMotion?: boolean;
    /**
     * The animation is added to the base values of pos, angle, scale and opacity instead of replacing them
     */
    relative?: boolean;
}

export interface BaseValues {
    pos: Vec2;
    angle: number;
    scale: Vec2;
    opacity: number;
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
    /**
     * Base values for relative animation
     */
    base: BaseValues;
    /**
     * Serializes the animation of this object to plain Javascript types
     */
    serializeAnimationChannels(): Record<string, AnimationChannel>;
    /**
     * Serializes the options of this object to plain Javascript types
     */
    serializeAnimationOptions(): { followMotion?: boolean; relative?: boolean };
}

/**
 * Baseclass for animation channels, only handles parameter normalization and keyframe searches
 */
class AnimateChannel {
    name: string;
    duration: number;
    loops: number;
    direction: TimeDirection;
    easing: EaseFunc;
    interpolation: Interpolation;
    isFinished: boolean;
    timing: number[] | undefined;
    easings: EaseFunc[] | undefined;
    relative: boolean;
    constructor(name: string, opts: AnimateOpt, relative: boolean) {
        this.name = name;
        this.duration = opts.duration;
        this.loops = opts.loops || 0;
        this.direction = opts.direction || "forward";
        this.easing = opts.easing || easings.linear;
        this.interpolation = opts.interpolation || "linear";
        this.isFinished = false;
        this.timing = opts.timing;
        this.easings = opts.easings;
        this.relative = relative;
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
        timing?: number[],
    ): [number, number] {
        const maxIndex = count - 1;
        // Check how many loops we've made
        let p = t / this.duration;
        if (this.loops !== 0 && p >= this.loops) {
            return [maxIndex, 0];
        }
        // Split looped and actual time
        const m = Math.trunc(p);
        p -= m;
        // Reverse if needed
        if (
            this.direction == "reverse"
            || (this.direction == "ping-pong" && (m & 1))
        ) {
            p = 1 - p;
        }
        // If we have individual keyframe positions, use them, otherwise use uniform spread
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
        }
        else {
            const index = Math.floor((count - 1) * p);
            return [index, (p - index / maxIndex) * maxIndex];
        }
    }

    setValue<T>(obj: GameObj<any>, name: string, value: T) {
        if (this.relative) {
            switch (name) {
                case "pos":
                    obj["pos"] = obj.base.pos.add(value as Vec2);
                    break;
                case "angle":
                    obj["angle"] = obj.base.angle + (value as number);
                    break;
                case "scale":
                    obj["scale"] = obj.base.scale.scale(value as Vec2);
                    break;
                case "opacity":
                    obj["opacity"] = obj.base.opacity * (value as number);
                    break;
                default:
                    obj[name] = value;
            }
        }
        else {
            obj[name] = value;
        }
    }

    serialize(): AnimationChannel {
        const serialization: AnimationChannel = {
            duration: this.duration,
            keys: [],
        };
        if (this.loops) {
            serialization.loops = this.loops;
        }
        if (this.direction !== "forward") {
            serialization.direction = this.direction;
        }
        if (this.easing != easings.linear) {
            serialization.easing = this.easing.name;
        }
        if (this.interpolation !== "linear") {
            serialization.interpolation = this.interpolation;
        }
        if (this.timing) {
            serialization.timing = this.timing;
        }
        if (this.easings) {
            serialization.easings = this.easings.map(e => this.easing.name);
        }
        return serialization;
    }
}

/**
 * Reflects a point around another point
 * @param a Point to reflect
 * @param b Point to reflect around
 * @returns Reflected point
 */
function reflect(a: Vec2, b: Vec2) {
    return b.add(b.sub(a));
}

/**
 * Subclass handling number keys
 */
class AnimateChannelNumber extends AnimateChannel {
    keys: number[];
    constructor(
        name: string,
        keys: number[],
        opts: AnimateOpt,
        relative: boolean,
    ) {
        super(name, opts, relative);
        this.keys = keys;
    }

    update(obj: GameObj<any>, t: number): boolean {
        const [index, alpha] = this.getLowerKeyIndexAndRelativeTime(
            t,
            this.keys.length,
            this.timing,
        );
        // Return exact value in case of exact hit or no interpolation, otherwise interpolate
        if (alpha == 0 || this.interpolation === "none") {
            this.setValue(obj, this.name, this.keys[index]);
        }
        else {
            const easing = this.easings ? this.easings[index] : this.easing;
            this.setValue(
                obj,
                this.name,
                lerp(
                    this.keys[index],
                    this.keys[index + 1],
                    easing(alpha),
                ),
            );
        }
        return alpha == 1;
    }

    serialize() {
        return Object.assign(super.serialize(), { keys: this.keys });
    }
}

/**
 * Subclass handling vector keys
 */
class AnimateChannelVec2 extends AnimateChannel {
    keys: Vec2[];
    curves?: ((t: number) => Vec2)[];
    dcurves?: ((t: number) => Vec2)[];
    constructor(
        name: string,
        keys: Vec2[],
        opts: AnimateOpt,
        relative: boolean,
        followMotion: boolean,
    ) {
        super(name, opts, relative);
        this.keys = keys;
        // If spline interpolation is used, bake splines
        if (this.interpolation === "spline") {
            this.curves = [];
            // If following motion, bake derivatives as well
            if (followMotion) {
                this.dcurves = [];
            }
            for (let i = 0; i < this.keys.length - 1; i++) {
                const prevKey = this.keys[i];
                const nextIndex = i + 1;
                const nextKey = this.keys[nextIndex];
                const prevPrevKey = i > 0
                    ? this.keys[i - 1]
                    : reflect(nextKey, prevKey);
                const nextNextKey = nextIndex < this.keys.length - 1
                    ? this.keys[nextIndex + 1]
                    : reflect(prevKey, nextKey);
                this.curves.push(
                    catmullRom(prevPrevKey, prevKey, nextKey, nextNextKey),
                );
                if (followMotion) {
                    this.dcurves?.push(
                        catmullRom(
                            prevPrevKey,
                            prevKey,
                            nextKey,
                            nextNextKey,
                            hermiteFirstDerivative,
                        ),
                    );
                }
            }
        }
    }

    update(obj: GameObj<any>, t: number): boolean {
        const [index, alpha] = this.getLowerKeyIndexAndRelativeTime(
            t,
            this.keys.length,
            this.timing,
        );
        // Return exact value in case of exact hit or no interpolation, otherwise interpolate
        if (alpha == 0 || this.interpolation === "none") {
            this.setValue(obj, this.name, this.keys[index]);
        }
        else {
            const easing = this.easings ? this.easings[index] : this.easing;
            // Use linear or spline interpolation
            switch (this.interpolation) {
                case "linear":
                    this.setValue(
                        obj,
                        this.name,
                        this.keys[index].lerp(
                            this.keys[index + 1],
                            easing(alpha),
                        ),
                    );
                    break;
                case "slerp":
                    this.setValue(
                        obj,
                        this.name,
                        this.keys[index].slerp(
                            this.keys[index + 1],
                            easing(alpha),
                        ),
                    );
                    break;
                case "spline":
                    if (this.curves) {
                        this.setValue(
                            obj,
                            this.name,
                            this.curves[index](easing(alpha)),
                        );
                        if (this.dcurves) {
                            this.setValue(
                                obj,
                                "angle",
                                this.dcurves[index](easing(alpha)).angle(),
                            );
                        }
                        break;
                    }
            }
        }
        return alpha == 1;
    }

    serialize() {
        return Object.assign(super.serialize(), {
            keys: this.keys.map(v => [v.x, v.y]),
        });
    }
}

/**
 * Subclass handling color keys
 */
class AnimateChannelColor extends AnimateChannel {
    keys: Color[];
    constructor(
        name: string,
        keys: Color[],
        opts: AnimateOpt,
        relative: boolean,
    ) {
        super(name, opts, relative);
        this.keys = keys;
    }

    update(obj: GameObj<any>, t: number): boolean {
        const [index, alpha] = this.getLowerKeyIndexAndRelativeTime(
            t,
            this.keys.length,
            this.timing,
        );
        // Return exact value in case of exact hit or no interpolation, otherwise interpolate
        if (alpha == 0 || this.interpolation == "none") {
            this.setValue(obj, this.name, this.keys[index]);
        }
        else {
            const easing = this.easings ? this.easings[index] : this.easing;
            this.setValue(
                obj,
                this.name,
                this.keys[index].lerp(
                    this.keys[index + 1],
                    easing(alpha),
                ),
            );
        }
        return alpha == 1;
    }

    serialize() {
        return Object.assign(super.serialize(), { keys: this.keys });
    }
}

type AnimationChannelKeys = number[] | number[][];

type AnimationOptions = {
    duration: number;
    loops?: number;
    direction?: TimeDirection;
    easing?: string;
    interpolation?: Interpolation;
    timing?: number[];
    easings?: string[];
};

type AnimationChannel = {
    keys: AnimationChannelKeys;
} & AnimationOptions;

type Animation = {
    name: string;
    followMotion?: boolean;
    relative?: boolean;
    channels?: Record<string, AnimationChannel>;
    children?: Animation[];
};

export function animate(gopts: AnimateCompOpt = {}): AnimateComp {
    const channels: AnimateChannel[] = [];
    let t = 0;
    let isFinished = false;
    return {
        id: "animate",
        require: gopts.followMotion ? ["rotate"] : undefined,
        base: {
            pos: vec2(0, 0),
            angle: 0,
            scale: vec2(1, 1),
            opacity: 1,
        },
        add(this: GameObj<AnimateComp>) {
            if (gopts.relative) {
                if (this.is("pos")) {
                    this.base.pos = (this as any).pos.clone();
                }
                if (this.is("rotate")) {
                    this.base.angle = (this as any).angle;
                }
                if (this.is("scale")) {
                    this.base.scale = (this as any).scale;
                }
                if (this.is("opacity")) {
                    this.base.opacity = (this as any).opacity;
                }
            }
        },
        update() {
            let allFinished: boolean = true;
            let localFinished: boolean;
            t += dt();
            for (const c of channels) {
                localFinished = c.update(this as unknown as GameObj<any>, t);
                if (localFinished && !c.isFinished) {
                    c.isFinished = true;
                    (this as unknown as GameObj<any>).trigger(
                        "animateChannelFinished",
                        c.name,
                    );
                }
                allFinished &&= localFinished;
            }
            if (allFinished && !isFinished) {
                isFinished = true;
                (this as unknown as GameObj<any>).trigger("animateFinished");
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
                        gopts.relative || false,
                    ),
                );
            }
            else if (keys[0] instanceof Vec2) {
                channels.push(
                    new AnimateChannelVec2(
                        name,
                        keys as Vec2[],
                        opts,
                        gopts.relative || false,
                        name === "pos" && (gopts.followMotion || false),
                    ),
                );
            }
            else if (keys[0] instanceof Color) {
                channels.push(
                    new AnimateChannelColor(
                        name,
                        keys as Color[],
                        opts,
                        gopts.relative || false,
                    ),
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
            return (this as unknown as GameObj<any>).on("animateFinished", cb);
        },
        onAnimateChannelFinished(cb: (name: string) => void) {
            return (this as unknown as GameObj<any>).on(
                "animateChannelFinished",
                cb,
            );
        },
        serializeAnimationChannels() {
            return channels.reduce((o: Record<string, AnimationChannel>, c) => {
                o[c.name] = c.serialize();
                return o;
            }, {});
        },
        serializeAnimationOptions() {
            const options: any = {};
            if (gopts.followMotion) {
                options.followMotion = true;
            }
            if (gopts.relative) {
                options.relative = true;
            }
            return options;
        },
    };
}

/**
 * Serializes an animation to javascript objects for serialization to JSON.
 * @param obj The root object to serialize from.
 * @param name Optional name of the root object.
 * @returns A javascript object serialization of the animation.
 */
export function serializeAnimation(obj: GameObj<any>, name: string): any {
    let serialization: Animation = { name: obj.name };
    if (obj.is("animate")) {
        serialization.channels = (obj as GameObj<AnimateComp>)
            .serializeAnimationChannels();
        Object.assign(
            serialization,
            (obj as GameObj<NamedComp | AnimateComp>)
                .serializeAnimationOptions(),
        );
    }
    if (obj.children.length > 0) {
        serialization.children = obj.children.filter(o => o.is("named")).map(
            o => serializeAnimation(o, o.name),
        );
    }
    return serialization;
}

function deserializeKeys(keys: AnimationChannelKeys) {
    if (typeof keys[0] == "number") {
        return keys;
    }
    else if (Array.isArray(keys[0])) {
        if (keys[0].length == 2) {
            return (keys as number[][]).map(k => new Vec2(k[0], k[1]));
        }
        else if (keys[0].length == 3) {
            return (keys as number[][]).map(k => new Color(k[0], k[1], k[2]));
        }
    }
}

function deserializeOptions(options: AnimationOptions) {
    if (options.easing) {
        options.easing = (easings as any)[options.easing];
    }
    if (options.easings) {
        options.easings = options.easings.map(e => (easings as any)[e]);
    }
    return options;
}

/**
 * Applies the animation to this object and its named children
 * @param obj The root object to deserialize to.
 * @param animation A javascript object serialization of the animation.
 */
export function applyAnimation(obj: GameObj<any>, animation: Animation) {
    // TODO: test this
    obj.use(animate({
        followMotion: animation.followMotion,
        relative: animation.relative,
    }));
    if (animation.channels) {
        for (const name in animation.channels) {
            const channel = animation.channels[name];
            obj.animate(
                name,
                deserializeKeys(channel.keys),
                deserializeOptions(channel),
            );
        }
    }
    if (animation.children) {
        for (const childAnimation of animation.children) {
            const q = obj.query({ name: childAnimation.name });
            if (q.length != 0) {
                applyAnimation(q[0], childAnimation);
            }
        }
    }
}

import { _k } from "../shared";
import type { RNGValue } from "../types";
import { Color, rgb } from "./color";
import { vec2 } from "./math";
import { Alea } from "./rngAlea";
import { LinearCongruentialEngine } from "./rngLce";
import { XorShift32 } from "./rngXorShift32";
import { Vec2 } from "./Vec2";

export interface RandomGenerator {
    /**
     * Generate a random number in [0-1).
     *
     * @returns A number between 0 and 1.
     */
    gen(): number;

    /**
     * Save the internal state to a string.
     *
     * Used to allow restoring the exact state of the generator.
     *
     * @returns The state of the generator as string.
     */
    save(): string;

    /**
     * Load the state of the generator from a string.
     */
    load(data: string): boolean;

    /**
     * Seed of the generator.
     */
    get seed(): RNGSeed;

    set seed(value: RNGSeed);
}

function isRandomGenerator(value: unknown): value is RandomGenerator {
    return !!value
        && typeof value === "object"
        && typeof (value as RandomGenerator).gen === "function"
        && typeof (value as RandomGenerator).save === "function"
        && typeof (value as RandomGenerator).load === "function"
        && (value as RandomGenerator).seed !== undefined;
}

export type RandomGeneratorType =
    | "lce"
    | "xorshift32"
    | "alea";

/**
 * @param type - The type of the generator to create.
 * @param seed - The seed to use for the generator. It is named to avoid confusion with the RandomGenerator's `seed` property.
 */
export type InternalRNGConfig =
    | { type: "lce"; seed?: number }
    | { type: "xorshift32"; seed?: number }
    | { type: "alea"; seed?: string | string[] };

export type RNGConfig = InternalRNGConfig | {
    type: "custom";
    rng: RandomGenerator;
};

export type RNGSeed = number | string | string[];

function createRNG(
    config: InternalRNGConfig,
): RandomGenerator {
    switch (config.type) {
        case "xorshift32":
            return new XorShift32(config.seed);
        case "alea":
            return new Alea(config.seed);
        case "lce":
        default:
            return new LinearCongruentialEngine(config.seed);
    }
}

export class RNG {
    rng: RandomGenerator;

    constructor(
        config: RNGConfig = { type: "lce" },
    ) {
        if (config.type === "custom") {
            if (!isRandomGenerator(config.rng)) {
                throw new Error("Invalid RNG config");
            }
            this.rng = config.rng;
        }
        else {
            this.rng = createRNG(config);
        }
    }

    /**
     * Generate a random number in [0-1).
     *
     * @example
     * ```js
     * const rng = new RNG({ type: "lce", seed: Date.now() })
     * const value = rng.gen() // Returns a number in [0-1)
     * ```
     *
     * @returns A number in [0-1).
     */
    gen(): number {
        return this.rng.gen();
    }

    /**
     * Save the rng internal state to a string.
     */
    save(): string {
        return this.rng.save();
    }
    /**
     * Load the rng internal state from a string.
     */
    load(data: string): boolean {
        return this.rng.load(data);
    }

    /**
     * Generate a random number between two values.
     *
     * @param a - The minimum value.
     * @param b - The maximum value.
     *
     * @example
     * ```js
     * const rng = new RNG({ type: "lce", seed: Date.now() })
     * const value = rng.genNumber(10, 20) // Returns a number in [10,20)
     * ```
     *
     * @returns A number between a and b.
     */
    genNumber(a: number, b: number): number {
        return a + this.gen() * (b - a);
    }

    /**
     * Generate a random integer in [0, max).
     *
     * @param max - The maximum value.
     *
     * @returns A number in [0, max).
     */
    genInteger(max: number) {
        return Math.floor(this.gen() * max);
    }

    /**
     * Generate a random 2D vector between two vectors.
     *
     * @param a - The minimum vector.
     * @param b - The maximum vector.
     *
     * @example
     * ```js
     * const rng = new RNG({ type: "lce", seed: Date.now() })
     * const vec = rng.genVec2(vec2(0,0), vec2(100,100))
     * ```
     *
     * @returns A vector between vectors a and b.
     */
    genVec2(a: Vec2, b: Vec2): Vec2 {
        return new Vec2(this.genNumber(a.x, b.x), this.genNumber(a.y, b.y));
    }

    /**
     * Generate a random color between two colors.
     *
     * @param a - The first color.
     * @param b - The second color.
     *
     * @example
     * ```js
     * const rng = new RNG({ type: "lce", seed: Date.now() })
     * const color = rng.genColor(rgb(0,0,0), rgb(255,255,255))
     * ```
     *
     * @returns A color between colors a and b.
     */
    genColor(a: Color, b: Color): Color {
        return new Color(
            this.genNumber(a.r, b.r),
            this.genNumber(a.g, b.g),
            this.genNumber(a.b, b.b),
        );
    }

    /**
     * Generate a random value of a specific type.
     *
     * @param args - No args for [0-1], one arg for [0-arg], or two args for [arg1-arg2].
     *
     * @example
     * ```js
     * const rng = new RNG({ type: "lce", seed: Date.now() })
     * const val = rng.genAny(0, 100) // Number between 0-100
     * const vec = rng.genAny(vec2(0,0), vec2(100,100)) // Vec2
     * const col = rng.genAny(rgb(0,0,0), rgb(255,255,255)) // Color
     * ```
     *
     * @returns A random value.
     */
    genAny<T = RNGValue>(...args: [] | [T] | [T, T]): T {
        if (args.length === 0) {
            return this.gen() as T;
        }
        else if (args.length === 1) {
            if (typeof args[0] === "number") {
                return this.genNumber(0, args[0]) as T;
            }
            else if (args[0] instanceof Vec2) {
                return this.genVec2(vec2(0, 0), args[0]) as T;
            }
            else if (args[0] instanceof Color) {
                return this.genColor(rgb(0, 0, 0), args[0]) as T;
            }
        }
        else if (args.length === 2) {
            if (typeof args[0] === "number" && typeof args[1] === "number") {
                return this.genNumber(args[0], args[1]) as T;
            }
            else if (args[0] instanceof Vec2 && args[1] instanceof Vec2) {
                return this.genVec2(args[0], args[1]) as T;
            }
            else if (args[0] instanceof Color && args[1] instanceof Color) {
                return this.genColor(args[0], args[1]) as T;
            }
        }

        throw new Error("More than 2 arguments not supported");
    }
}

export function randSeed(seed?: RNGSeed): RNGSeed {
    const rng = _k.game.defRNG.rng;

    if (seed !== undefined) {
        const isLceOrXorShift = rng instanceof LinearCongruentialEngine
            || rng instanceof XorShift32;

        // ----- Built-in RNGs
        // LCE and XorShift32
        if (
            isLceOrXorShift
        ) {
            if (typeof seed === "number") {
                (rng as LinearCongruentialEngine | XorShift32).seed = seed;
            }
            else {
                throw new Error(
                    `Linear Congruential Engine and XorShift32 seed must be a number, got ${seed}`,
                );
            }
        }
        else if (
            // Alea
            rng instanceof Alea
        ) {
            const error =
                `Alea seed must be a non-empty string or array of strings, got ${seed}`;
            if (
                typeof seed === "string" || Array.isArray(seed)
            ) {
                const seeds = [seed].flat();

                if (seeds.length > 0) {
                    (rng as Alea).seed = seeds;
                }
                else {
                    throw new Error(error);
                }
            }
            else {
                throw new Error(error);
            }
        }
        // ----- Custom RNGs
        else {
            // Set the generator's seed, user should take care of type checking
            rng.seed = seed;
        }
    }

    // Return seed in all cases
    return rng.seed;
}

export function setRNG(config: RNGConfig): void {
    _k.game.defRNG = new RNG(config);
}

export function getRNG() {
    return _k.game.defRNG;
}

export function rand<T = number>(...args: [] | [T] | [T, T]) {
    return _k.game.defRNG.genAny(...args);
}

export function randi(...args: [] | [number] | [number, number]) {
    return Math.floor(rand(...(args.length > 0 ? args : [2])));
}

export function chance(p: number): boolean {
    return rand() <= p;
}

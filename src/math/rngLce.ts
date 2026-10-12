import type { RandomGenerator } from "./random";

// basic ANSI C LCE

export const A = 1103515245;
export const C = 12345;
export const M = 2147483648;
/**
 * A random number generator using the linear congruential engine algorithm.
 *
 * @group Math
 * @subgroup Random
 */

export class LinearCongruentialEngine implements RandomGenerator {
    /**
     * The current seed value used by the random number generator.
     */
    seed: number;

    constructor(seed?: number) {
        this.seed = typeof seed === "number" ? seed : Date.now();
    }

    save() {
        return JSON.stringify({ seed: this.seed });
    }

    load(data: string) {
        const seedData = JSON.parse(data);
        if (
            typeof seedData?.seed === "number" && Number.isFinite(seedData.seed)
        ) {
            this.seed = seedData.seed;
            return true;
        }

        return false;
    }

    gen(): number {
        this.seed = (A * this.seed + C) % M;
        return this.seed / M;
    }
}
